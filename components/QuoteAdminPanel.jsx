"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Download, Loader2, ExternalLink } from "lucide-react";
import { adminUpdateQuoteStatus } from "@/lib/actions";
import { fmt } from "@/lib/constants";

const STATUS_OPTIONS = ["pending", "reviewed", "quoted", "accepted", "rejected"];

const STATUS_COLORS = {
  pending:  "bg-yellow-100 text-yellow-800 border-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 border-blue-200",
  quoted:   "bg-purple-100 text-purple-800 border-purple-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

export default function QuoteAdminPanel({ quotes: initialQuotes, setQuotes }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [noteEdits, setNoteEdits] = useState({});

  const filtered = initialQuotes.filter((q) => filter === "all" || q.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = initialQuotes.filter((q) => q.status === s).length;
    return acc;
  }, {});

  const handleStatusChange = async (id, newStatus) => {
    const note = noteEdits[id];
    setUpdating(id);
    const ok = await adminUpdateQuoteStatus(id, newStatus, note);
    setUpdating(null);
    if (ok) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: newStatus, admin_note: note ?? q.admin_note, updated_at: new Date().toISOString() }
            : q
        )
      );
    }
  };

  const handleNoteChange = (id, value) => {
    setNoteEdits((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[{ id: "all", label: `All (${initialQuotes.length})` }, ...STATUS_OPTIONS.map((s) => ({ id: s, label: `${s} (${counts[s]})` }))].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
              filter === t.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="border border-slate-200 bg-slate-50">
        {filtered.length === 0 ? (
          <p className="text-slate-400 font-mono text-sm text-center py-12">No quotes in this category.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((q) => {
              const isOpen = expanded === q.id;
              const currentNote = noteEdits[q.id] ?? q.admin_note ?? "";

              return (
                <div key={q.id}>
                  {/* Summary row */}
                  <div
                    className="flex items-center justify-between px-4 py-3.5 gap-3 cursor-pointer hover:bg-white"
                    onClick={() => setExpanded(isOpen ? null : q.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-mono text-amber-600 text-sm font-semibold">{q.id}</span>
                        <StatusBadge status={q.status} />
                      </div>
                      <p className="text-slate-900 text-sm font-medium">
                        {q.contact_name}{q.company ? ` · ${q.company}` : ""}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500">
                        {q.phone}{q.email ? ` · ${q.email}` : ""} · {(q.items || []).length} items · {fmt(q.subtotal)}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {new Date(q.created_at).toLocaleString("en-GB")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`/api/export/${q.id}`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600"
                        title="Export CSV"
                      >
                        <Download size={14} />
                      </a>
                      {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="bg-white border-t border-slate-200 px-4 py-4 space-y-4">
                      {/* Customer info */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        {[
                          ["Contact", q.contact_name],
                          ["Company", q.company || "—"],
                          ["Phone", q.phone],
                          ["Email", q.email || "—"],
                          ["Project Ref", q.project_ref || "—"],
                          ["Required By", q.delivery_date || "—"],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <p className="font-mono text-[10px] uppercase text-slate-400">{label}</p>
                            <p className="text-slate-700 font-medium truncate">{val}</p>
                          </div>
                        ))}
                      </div>

                      {q.notes && (
                        <div>
                          <p className="font-mono text-[10px] uppercase text-slate-400 mb-1">Notes</p>
                          <p className="text-slate-600 text-sm whitespace-pre-line">{q.notes}</p>
                        </div>
                      )}

                      {q.boq_url && (
                        <a
                          href={q.boq_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-600 hover:text-amber-500 underline"
                        >
                          <ExternalLink size={12} /> Download BOQ File
                        </a>
                      )}

                      {/* Line items */}
                      <div>
                        <p className="font-mono text-[10px] uppercase text-slate-400 mb-2">Line Items</p>
                        <div className="border border-slate-200 divide-y divide-slate-200">
                          {(q.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-[10px] text-slate-400">{item.id}</p>
                                {item.brand && <p className="font-mono text-[9px] text-amber-700 uppercase">{item.brand}</p>}
                                <p className="text-slate-900 text-sm truncate">{item.name}</p>
                              </div>
                              <div className="text-right flex-shrink-0 pl-3">
                                <p className="font-mono text-xs text-slate-500">{item.qty} × {fmt(item.price)}</p>
                                <p className="font-mono text-sm text-amber-600 font-semibold">{fmt(item.price * item.qty)}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 bg-slate-50">
                            <span className="font-mono text-xs uppercase text-slate-500">Subtotal</span>
                            <span className="font-mono text-sm font-semibold text-slate-900">{fmt(q.subtotal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin controls */}
                      <div className="space-y-3 border-t border-slate-200 pt-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <label className="font-mono text-[10px] uppercase text-slate-500">Status</label>
                          <select
                            value={q.status}
                            onChange={(e) => handleStatusChange(q.id, e.target.value)}
                            disabled={updating === q.id}
                            className="bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-1.5 text-sm font-mono text-slate-700"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {updating === q.id && <Loader2 size={14} className="animate-spin text-amber-500" />}
                        </div>

                        <label className="block">
                          <span className="font-mono text-[10px] uppercase text-slate-500">Internal Note</span>
                          <div className="flex gap-2 mt-1">
                            <textarea
                              rows={2}
                              value={currentNote}
                              onChange={(e) => handleNoteChange(q.id, e.target.value)}
                              placeholder="Internal notes visible only to admin…"
                              className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm font-mono text-slate-700 resize-none"
                            />
                            <button
                              type="button"
                              disabled={updating === q.id}
                              onClick={() => handleStatusChange(q.id, q.status)}
                              className="border border-slate-300 hover:border-amber-500 text-slate-500 hover:text-amber-600 px-3 text-xs font-mono uppercase self-start py-2"
                            >
                              Save
                            </button>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
