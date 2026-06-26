"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function RFQLookup() {
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = ref.trim().toUpperCase();
    if (!cleaned) { setError("Enter a reference number."); return; }
    if (!cleaned.startsWith("MG-RFQ-")) { setError("Reference should start with MG-RFQ-"); return; }
    setError("");
    router.push(`/my-quotes/${cleaned}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={ref}
          onChange={(e) => { setRef(e.target.value); setError(""); }}
          placeholder="MG-RFQ-XXXXXXXX"
          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none font-mono text-sm text-slate-700 uppercase"
        />
      </div>
      <button
        type="submit"
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider px-4 py-2.5 transition-colors whitespace-nowrap"
      >
        Track
      </button>
      {error && <p className="absolute mt-10 text-red-500 text-xs font-mono">{error}</p>}
    </form>
  );
}
