import Link from "next/link";
import { Eye, Star } from "lucide-react";
import { ProductImg, StatusDot } from "@/components/UI";
import { imgixUrl } from "@/lib/imgix";
import AddToQuoteButton from "@/components/AddToQuoteButton";
import { fmt } from "@/lib/constants";

export default function ProductCard({ product: p, quickViewHref }) {
  const imgSrc = imgixUrl(p.image, { w: 600, h: 450, q: 75 });

  return (
    <div className="group relative border border-slate-200 bg-white hover:border-amber-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col h-full overflow-hidden">

      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {p.featured && (
          <span className="bg-amber-500 text-slate-950 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
            <Star size={8} /> Featured
          </span>
        )}
        {p.status === "low" && (
          <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5">
            Low Stock
          </span>
        )}
      </div>

      {/* Quick View */}
      {quickViewHref && (
        <Link
          href={quickViewHref}
          scroll={false}
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white border border-slate-200 p-1.5"
          aria-label={`Quick view ${p.name}`}
        >
          <Eye size={14} className="text-slate-600" />
        </Link>
      )}

      {/* Image */}
      <Link href={`/shop/${p.id}`} className="block">
        <ProductImg src={imgSrc} alt={p.name} className="aspect-[4/3] h-auto" />
      </Link>

      {/* SKU + stock */}
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="font-mono text-[11px] tracking-wider text-slate-400">{p.id}</span>
        <div className="flex items-center gap-1.5">
          <StatusDot status={p.status} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            {p.status === "low" ? "Low stock" : "In stock"}
          </span>
        </div>
      </div>

      {/* Brand badge */}
      {p.brand && (
        <div className="px-4 pt-1.5">
          <span className="font-mono text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 uppercase tracking-widest">
            {p.brand}
          </span>
        </div>
      )}

      {/* Name + spec */}
      <Link href={`/shop/${p.id}`} className="px-4 pt-2 pb-4 flex-1 block">
        <h2 className="text-slate-900 font-semibold text-[15px] leading-snug hover:text-amber-700 line-clamp-2">
          {p.name}
        </h2>
        <p className="font-mono text-[12px] text-slate-500 mt-1.5 tracking-wide line-clamp-2">{p.spec}</p>
      </Link>

      {/* Price + cart */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50 mt-auto">
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-lg text-amber-600 font-medium truncate">{fmt(p.price)}</span>
          <span className="font-mono text-[10px] text-slate-500">{p.stock} units</span>
        </div>
        <AddToQuoteButton product={p} />
      </div>
    </div>
  );
}
