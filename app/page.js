import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, BadgeCheck, Wrench } from "lucide-react";
import { ProductImg, StatusDot } from "@/components/UI";
import LeadCaptureBlock from "@/components/LeadCaptureBlock";
import { getProducts, getContent } from "@/lib/db";
import { CATEGORIES, fmt } from "@/lib/constants";

export const metadata = {
  title: "Maxgen | Electrical Accessories & ELV Systems — Saudi Arabia",
  description:
    "Switches, MCBs, distribution boards, wiring devices, cable trays, and lighting accessories — stocked and ready to ship across Saudi Arabia, India, the UK, and the USA.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [products, content] = await Promise.all([getProducts(), getContent()]);
  const featured = products.slice(0, 8);

  return (
    <>
      <section className="relative border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1800&q=80&auto=format&fit=crop"
            alt="Electrical and ELV systems installation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 py-24 sm:py-32">
          <p className="font-mono text-amber-400 text-xs uppercase tracking-[0.2em] mb-3">{content?.heroTag}</p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-[1.05] max-w-2xl font-display">
            {content?.heroTitle}
          </h1>
          <p className="text-slate-200 mt-5 max-w-xl text-[15px] leading-relaxed">{content?.heroBody}</p>
          <div className="flex gap-3 mt-8">
            <Link href="/shop" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider px-6 py-3.5 flex items-center gap-2">
              Shop Now <ChevronRight size={16} />
            </Link>
            <Link href="/contact" className="border border-white/40 hover:border-white text-white font-mono uppercase text-sm tracking-wider px-6 py-3.5">
              Request Quote
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-10 border-b border-slate-200">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/shop?cat=${c.id}`} className="flex flex-col items-center gap-2 text-center border border-slate-200 bg-white hover:border-amber-500 hover:shadow-md transition-all px-3 py-5">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Wrench size={18} className="text-amber-600" />
              </div>
              <span className="font-mono text-[10px] text-slate-600 uppercase tracking-wide leading-tight">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12 border-b border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, label: "ISI / CE Certified Stock" },
            { icon: Truck, label: "Dispatch in 2–4 Days" },
            { icon: BadgeCheck, label: "Batch Traceability" },
            { icon: Wrench, label: "Site BOQ Support" },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center border border-slate-200 bg-slate-50 px-3 py-5">
              <f.icon size={20} className="text-amber-600" />
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 font-display">Featured Items</h2>
          <Link href="/shop" className="font-mono text-xs uppercase text-amber-600 flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featured.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} className="text-left border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-amber-500 transition-all flex flex-col">
              <ProductImg src={p.image} alt={p.name} className="w-full h-32" />
              <div className="px-4 py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] text-slate-500">{p.id}</span>
                  <StatusDot status={p.status} />
                </div>
                <h3 className="text-slate-900 text-sm font-semibold">{p.name}</h3>
                <p className="font-mono text-amber-600 mt-2">{fmt(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LeadCaptureBlock />
    </>
  );
}
