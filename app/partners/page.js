import Link from "next/link";
import { Handshake, ChevronRight } from "lucide-react";
import AddPartnerForm from "@/components/AddPartnerForm";
import { getPartners } from "@/lib/db";

export const metadata = {
  title: "Partners",
  description: "Technology and manufacturing partners that keep Maxgen's catalog certified, current, and serviceable.",
  alternates: { canonical: "/partners" },
};

export const revalidate = 3600;

export default async function PartnersPage() {
  const partners = await getPartners();

  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Partners</p>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">Backed by the brands installers trust.</h1>
      <p className="text-slate-500 text-[15px] max-w-2xl mb-10">
        We work with established technology and manufacturing partners to keep our catalog certified, current, and serviceable.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {partners.map((p) => (
          <div key={p.id} className="border border-slate-200 bg-white shadow-sm px-5 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <Handshake size={20} className="text-amber-600" />
            </div>
            <h2 className="text-slate-900 font-semibold text-[15px]">{p.name}</h2>
            {p.type && <p className="font-mono text-[10px] uppercase text-slate-400 tracking-wide mt-1">{p.type}</p>}
            {p.focus && <p className="text-slate-500 text-sm mt-2">{p.focus}</p>}
          </div>
        ))}
        {partners.length === 0 && (
          <p className="text-slate-400 font-mono text-sm col-span-full text-center py-10">No partners listed yet.</p>
        )}
      </div>

      <div className="border border-slate-200 bg-slate-50 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
        <p className="text-slate-600 text-sm">Interested in a supply or distribution partnership with Maxgen?</p>
        <Link href="/contact" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider px-4 py-2.5 flex items-center gap-1.5 flex-shrink-0">
          Get In Touch <ChevronRight size={13} />
        </Link>
      </div>

      <AddPartnerForm />
    </section>
  );
}
