"use client";

import { useState } from "react";
import { X, Plus, Minus, ChevronRight, ClipboardList, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useQuote } from "./QuoteContext";
import { fmt } from "@/lib/constants";
import RFQForm from "./RFQForm";
import WhatsAppQuoteButton from "./WhatsAppQuoteButton";

export default function QuoteBasketDrawer({ open, onClose }) {
  const { quote, inc, dec, remove, subtotal, itemCount, addToHistory } = useQuote();
  const [step, setStep] = useState("basket");
  const [refId, setRefId] = useState(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => { if (step === "success") setStep("basket"); }, 300);
  };

  const handleSuccess = (id) => {
    addToHistory(id);
    setRefId(id);
    setStep("success");
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div className="absolute inset-0 bg-slate-900/40" onClick={handleClose} />

      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white border-l border-slate-200 flex flex-col transform transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            {step === "form" && (
              <button onClick={() => setStep("basket")} className="text-slate-400 hover:text-slate-900 mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-600">
                {step === "basket" ? "Quote Basket" : step === "form" ? "RFQ Details" : "Submitted"}
              </p>
              <h2 className="text-slate-900 font-semibold text-lg leading-tight">
                {step === "basket"
                  ? `${itemCount} ${itemCount === 1 ? "item" : "items"}`
                  : step === "form"
                  ? "Request for Quotation"
                  : "Thank You"}
              </h2>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-900" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Success */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <CheckCircle2 className="text-emerald-500" size={48} />
            <p className="text-slate-900 font-semibold text-xl">RFQ Received</p>
            <p className="font-mono text-amber-600 text-base">{refId}</p>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Our team will review your request and respond within 24 hours.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleClose}
                className="font-mono text-xs uppercase text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
              <Link
                href="/my-quotes"
                onClick={handleClose}
                className="font-mono text-xs uppercase text-amber-600 hover:text-amber-500 flex items-center gap-1"
              >
                View My Quotes <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        )}

        {/* Basket */}
        {step === "basket" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {quote.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <ClipboardList size={36} className="text-slate-200" />
                  <p className="text-slate-400 font-mono text-sm">Quote basket is empty.</p>
                  <p className="text-slate-400 font-mono text-xs">Add items from the product catalogue.</p>
                </div>
              )}
              {quote.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] text-slate-400">{item.id}</p>
                    {item.brand && (
                      <p className="font-mono text-[9px] text-amber-700 uppercase tracking-wider">{item.brand}</p>
                    )}
                    <p className="text-slate-900 text-sm font-medium truncate">{item.name}</p>
                    <p className="font-mono text-amber-600 text-sm mt-0.5">
                      {fmt(item.price)} <span className="text-slate-400 text-[10px]">ea.</span>
                    </p>
                  </div>
                  <div className="flex items-center border border-slate-300">
                    <button onClick={() => dec(item.id)} className="p-1.5 text-slate-500 hover:bg-slate-100"><Minus size={13} /></button>
                    <span className="w-8 text-center font-mono text-sm">{item.qty}</span>
                    <button onClick={() => inc(item.id)} className="p-1.5 text-slate-500 hover:bg-slate-100"><Plus size={13} /></button>
                  </div>
                  <button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-5 py-4 flex-shrink-0 space-y-3">
              <div className="flex justify-between font-mono text-sm text-slate-500">
                <span>Est. Subtotal</span>
                <span className="text-amber-600 font-semibold">{fmt(subtotal)}</span>
              </div>
              <button
                disabled={quote.length === 0}
                onClick={() => setStep("form")}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-mono uppercase text-sm tracking-wider py-3 flex items-center justify-center gap-2 transition-colors"
              >
                Proceed to RFQ <ChevronRight size={16} />
              </button>
              <WhatsAppQuoteButton quote={quote} subtotal={subtotal} />
              <p className="font-mono text-[10px] text-slate-400 text-center">
                Prices shown are indicative. Final quotation follows review.
              </p>
            </div>
          </>
        )}

        {/* RFQ Form */}
        {step === "form" && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <RFQForm onSuccess={handleSuccess} />
          </div>
        )}
      </div>
    </div>
  );
}
