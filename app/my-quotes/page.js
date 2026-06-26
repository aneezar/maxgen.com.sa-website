import MyQuotesList from "@/components/MyQuotesList";
import RFQLookup from "@/components/RFQLookup";

export const metadata = {
  title: "My Quotes",
  robots: { index: false, follow: false },
};

export default function MyQuotesPage() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-12">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-2">Procurement</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-8 font-display">My Quotes</h1>

      <MyQuotesList />

      <div className="mt-10 border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Track by Reference</h2>
        <p className="text-slate-500 text-sm mb-4 font-mono">
          Enter your <span className="text-amber-600">MG-RFQ-XXXXXXXX</span> reference to check status.
        </p>
        <RFQLookup />
      </div>
    </section>
  );
}
