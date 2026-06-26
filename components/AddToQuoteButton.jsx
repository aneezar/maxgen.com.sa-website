"use client";

import { useState } from "react";
import { Plus, Minus, ClipboardList } from "lucide-react";
import { useQuote } from "./QuoteContext";

export default function AddToQuoteButton({ product, compact = true, className }) {
  const { quote, addToQuote } = useQuote();
  const [qty, setQty] = useState(1);
  const inQuote = quote.find((i) => i.id === product.id)?.qty || 0;

  if (!compact) {
    return (
      <button
        onClick={() => addToQuote(product, 1)}
        className={className}
      >
        <ClipboardList size={16} />
        {inQuote > 0 ? `Add to Quote (${inQuote} in basket)` : "Add to Quote"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center border border-slate-300">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Decrease"
        >
          <Minus size={12} />
        </button>
        <span className="w-7 text-center font-mono text-xs">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Increase"
        >
          <Plus size={12} />
        </button>
      </div>
      <button
        onClick={() => { addToQuote(product, qty); setQty(1); }}
        title={inQuote > 0 ? `${inQuote} in quote basket` : "Add to quote basket"}
        className="flex items-center gap-1 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 px-2.5 py-2 text-[11px] font-mono uppercase tracking-wider transition-colors"
      >
        {inQuote > 0
          ? <><ClipboardList size={12} /> {inQuote}</>
          : <><Plus size={12} /> Quote</>}
      </button>
    </div>
  );
}
