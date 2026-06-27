import AddCustomerForm from "@/components/AddCustomerForm";
import { getCustomers } from "@/lib/db";

export const metadata = {
  title: "Major Customers",
  description: "Clients Maxgen has supplied and supported across banking, hospitality, logistics, telecom, and construction sectors.",
  alternates: { canonical: "/customers" },
};

export const revalidate = 3600;

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Major Customers</p>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">Trusted across banking, hospitality, and infrastructure.</h1>
      <p className="text-slate-500 text-[15px] max-w-2xl mb-10">
        A selection of clients we&apos;ve supplied and supported across multiple project types and sectors.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {customers.map((c) => (
          <div key={c.id} className="border border-slate-200 bg-white shadow-sm px-5 py-5">
            {c.sector && <p className="font-mono text-[10px] uppercase tracking-widest text-amber-600 mb-2">{c.sector}</p>}
            <h2 className="text-slate-900 font-semibold text-[15px] mb-1.5">{c.name}</h2>
            {c.note && <p className="text-slate-500 text-sm">{c.note}</p>}
          </div>
        ))}
        {customers.length === 0 && (
          <p className="text-slate-400 font-mono text-sm col-span-full text-center py-10">No customers listed yet.</p>
        )}
      </div>

      <AddCustomerForm />
    </section>
  );
}
