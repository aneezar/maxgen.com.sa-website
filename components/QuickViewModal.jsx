"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import { ProductImg, StatusDot } from "@/components/UI";
import { imgixUrl } from "@/lib/imgix";
import AddToQuoteButton from "@/components/AddToQuoteButton";
import { fmt } from "@/lib/constants";

export default function QuickViewModal({ product: p, closeHref }) {
  const router = useRouter();

  const close = () => router.push(closeHref, { scroll: false });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") router.push(closeHref, { scroll: false }); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [router, closeHref]);

  const imgSrc = imgixUrl(p.image, { w: 800, h: 600, q: 80 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Quick view: ${p.name}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-slate-100 border border-slate-200 transition-colors"
          aria-label="Close quick view"
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="relative">
            {p.featured && (
              <span className="absolute top-3 left-3 z-10 bg-amber-500 text-slate-950 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5">
                Featured
              </span>
            )}
            <ProductImg src={imgSrc} alt={p.name} className="w-full h-64 sm:h-full min-h-[280px]" />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-slate-400">{p.id}</span>
              <StatusDot status={p.status} />
              <span className="font-mono text-[10px] uppercase text-slate-500">
                {p.status === "low" ? "Low stock" : "In stock"}
              </span>
            </div>

            {p.brand && (
              <span className="self-start font-mono text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 uppercase tracking-widest mb-3">
                {p.brand}
              </span>
            )}

            <h2 className="text-xl font-bold text-slate-900 font-display mb-2 leading-snug">{p.name}</h2>
            <p className="text-sm text-slate-500 font-mono mb-4 leading-relaxed line-clamp-3">{p.spec}</p>

            <p className="font-mono text-2xl text-amber-600 font-semibold mb-0.5">{fmt(p.price)}</p>
            <p className="text-slate-400 text-xs mb-5">{p.stock} units in stock</p>

            <AddToQuoteButton
              product={p}
              compact={false}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider py-3 flex items-center justify-center gap-2 mb-3 transition-colors"
            />

            <Link
              href={`/shop/${p.id}`}
              onClick={close}
              className="flex items-center justify-center gap-2 border border-slate-300 hover:border-amber-500 text-slate-600 hover:text-amber-700 font-mono uppercase text-xs tracking-wider py-3 transition-colors"
            >
              <ExternalLink size={13} /> View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
