"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Search } from "lucide-react";

export default function AIProductSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const router = useRouter();

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setHint("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "search", data: { query } }),
      });
      const json = await res.json();

      if (json.error || !json.result) {
        // Fallback: treat as keyword search
        router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
        return;
      }

      let parsed;
      try {
        // Strip markdown code fences if present
        const raw = json.result.replace(/```json?\n?/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(raw);
      } catch {
        router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
        return;
      }

      if (parsed.summary) setHint(parsed.summary);

      const params = new URLSearchParams();
      if (parsed.q)            params.set("q", parsed.q);
      if (parsed.cat)          params.set("cat", parsed.cat);
      if (parsed.brand)        params.set("brand", parsed.brand);
      if (parsed.featured)     params.set("featured", "true");
      if (parsed.sort)         params.set("sort", parsed.sort);

      if (!params.toString()) params.set("q", query.trim());
      router.push(`/shop?${params.toString()}`);
    } catch {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={search} className="flex gap-0">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you need — e.g. MCBs for a villa project in Riyadh…"
            className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 border-r-0 focus:border-amber-500 outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <button
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-mono text-xs uppercase tracking-wider px-4 py-3 border border-amber-500 disabled:border-slate-200 transition-colors flex-shrink-0"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          AI Search
        </button>
      </form>
      {hint && (
        <p className="mt-1.5 font-mono text-[11px] text-amber-700 flex items-center gap-1.5">
          <Sparkles size={10} /> {hint}
        </p>
      )}
    </div>
  );
}
