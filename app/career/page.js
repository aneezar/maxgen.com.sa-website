import CareerClient from "@/components/CareerClient";
import { CAREERS } from "@/lib/constants";

export const metadata = {
  title: "Careers",
  description: "Open roles at Maxgen across engineering, sales, and operations in Saudi Arabia and India.",
  alternates: { canonical: "/career" },
};

export default function CareerPage() {
  return (
    <section className="max-w-4xl mx-auto px-5 py-16">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Careers</p>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">Build with us.</h1>
      <p className="text-slate-500 text-[15px] max-w-2xl mb-10">
        We&apos;re hiring across engineering, sales, and operations. Open roles below — tap one to apply.
      </p>
      <CareerClient roles={CAREERS} />
    </section>
  );
}
