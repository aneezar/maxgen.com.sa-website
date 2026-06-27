import Link from "next/link";
import { Building2, Globe2, ChevronRight } from "lucide-react";
import { ProductImg } from "@/components/UI";
import { getServicesGrouped } from "@/lib/db";
import { CLIENTS } from "@/lib/constants";
import { imgixUrl } from "@/lib/imgix";

export const metadata = {
  title: "Verticals — Low Current, ELV, Telecom & MEP Services",
  description: "Maxgen's four operating divisions: Low Current Systems, ELV (Extra Low Voltage), Telecom, and MEP — covering CCTV, access control, fire alarm, BMS, HVAC, grounding, and more.",
  alternates: { canonical: "/verticals" },
};

export const revalidate = 3600;

export default async function VerticalsPage() {
  const divisions = await getServicesGrouped();

  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Verticals</p>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">One group, four operating divisions.</h1>
      <p className="text-slate-500 text-[15px] max-w-2xl mb-12">
        Maxgen organizes its work into four verticals, each staffed and stocked to handle its own scope end to end —
        from accessory supply through full systems integration.
      </p>

      {divisions.map((div) => (
        <div key={div.division} className="mb-14">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
            <Building2 size={18} className="text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900 font-display">{div.division}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {div.items.map((s) => (
              <Link key={s.slug} href={`/verticals/${s.slug}`} className="text-left border border-slate-200 bg-white hover:border-amber-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
                <ProductImg src={imgixUrl(s.image, { w: 600, h: 360, q: 75 })} alt={s.title} className="w-full h-36" />
                <div className="px-5 py-5 flex-1">
                  {s.category && <p className="font-mono text-[10px] uppercase tracking-widest text-amber-600 mb-1.5">{s.category}</p>}
                  <h3 className="text-slate-900 font-semibold mb-1.5 text-[15px]">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-mono text-[11px] uppercase mt-3">
                    Read more <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="border border-slate-200 bg-slate-50 px-6 py-6 flex items-center gap-3 mb-12">
        <Globe2 size={20} className="text-amber-600 flex-shrink-0" />
        <p className="text-slate-600 text-sm">All four verticals operate across our India, Saudi Arabia, UK, and USA branches, coordinated centrally for multi-country projects.</p>
      </div>

      <div>
        <h2 className="font-mono text-amber-600 text-xs uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">Clients We&apos;ve Worked With</h2>
        <div className="flex flex-wrap gap-2">
          {CLIENTS.map((c) => (
            <span key={c} className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-500 text-xs font-mono">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
