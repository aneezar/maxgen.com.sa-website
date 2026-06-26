"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { fmt } from "@/lib/constants";
import { ChevronRight, Loader2 } from "lucide-react";

const STATUS_COLORS = {
  pending:  "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  quoted:   "bg-purple-100 text-purple-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function MyQuotesList() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("maxgen:quote-history");
      const ids = raw ? JSON.parse(raw) : [];
      if (ids.length === 0) { setLoading(false); return; }
      setHasHistory(true);

      supabase
        .from("quotes")
        .select("id,status,contact_name,subtotal,items,created_at,admin_note,quoted_at")
        .in("id", ids)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setQuotes(data);
          setLoading(false);
        });
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 font-mono text-sm py-6">
        <Loader2 size={14} className="animate-spin" /> Loading your quotes…
      </div>
    );
  }

  if (!hasHistory) return null;

  if (quotes.length === 0) {
    return <p className="font-mono text-sm text-slate-400 py-4">No quotes found for your stored references.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{quotes.length} quote{quotes.length !== 1 ? "s" : ""} on this device</p>
      {quotes.map((q) => (
        <Link
          key={q.id}
          href={`/my-quotes/${q.id}`}
          className="flex items-center justify-between border border-slate-200 hover:border-amber-500 bg-white px-5 py-4 transition-colors group"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-amber-600 text-sm font-semibold">{q.id}</span>
              <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 ${STATUS_COLORS[q.status] || "bg-slate-100 text-slate-600"}`}>
                {q.status}
              </span>
            </div>
            <p className="text-slate-700 text-sm font-medium">{q.contact_name}</p>
            <p className="font-mono text-[11px] text-slate-400">
              {(q.items || []).length} item{(q.items || []).length !== 1 ? "s" : ""} · {fmt(q.subtotal)} · {new Date(q.created_at).toLocaleDateString("en-GB")}
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-amber-500 flex-shrink-0 ml-3 transition-colors" />
        </Link>
      ))}
    </div>
  );
}
