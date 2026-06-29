import { getContent } from "@/lib/db";

export const metadata = {
  title: "About Us",
  description: "Maxgen — electrical accessories and ELV systems supplier built from over a decade of systems integration work across networking, ELV, telecom, and MEP disciplines.",
  alternates: { canonical: "/about" },
};

export const revalidate = 3600;

export default async function AboutPage() {
  const content = await getContent();

  return (
    <section className="max-w-4xl mx-auto px-5 py-16">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">About Maxgen</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 font-display">{content?.aboutTitle}</h1>
      <div className="space-y-4 text-slate-500 leading-relaxed text-[15px]">
        {(content?.aboutBody || "").split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
        {[
          { n: content?.statSkus, l: "SKUs Stocked" },
          { n: content?.statYears, l: "Years in Business" },
          { n: content?.statDispatch, l: "Typical Dispatch" },
          { n: "4", l: "Countries" },
        ].map((s, i) => (
          <div key={i} className="border border-slate-200 bg-slate-50 px-4 py-5 text-center">
            <p className="text-2xl font-bold text-amber-600 font-display">{s.n}</p>
            <p className="font-mono text-[11px] text-slate-500 uppercase mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      <p className="text-slate-500 text-sm mt-6">
        Maxgen operates across <span className="text-slate-700 font-medium">India, Saudi Arabia, the United Kingdom, and the United States</span>, supporting clients with local stock and regional teams in each market.
      </p>
    </section>
  );
}
