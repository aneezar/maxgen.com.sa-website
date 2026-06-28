import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export const metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

const QUICK_LINKS = [
  { href: "/shop",       label: "Full Catalog" },
  { href: "/verticals",  label: "Verticals & Services" },
  { href: "/my-quotes",  label: "My Quotes" },
  { href: "/blog",       label: "Blog & News" },
  { href: "/contact",    label: "Contact Us" },
];

export default function NotFound() {
  return (
    <section className="max-w-4xl mx-auto px-5 py-24">
      <div className="text-center mb-12">
        <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Error 404</p>
        <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">Page not found.</h1>
        <p className="text-slate-500 text-[15px] max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Try one of the links below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Quick links */}
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">Quick links</h2>
          <div className="flex flex-col divide-y divide-slate-100">
            {QUICK_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="flex items-center justify-between py-3 text-slate-700 hover:text-amber-600 text-sm font-medium transition-colors group">
                {l.label}
                <span className="text-slate-300 group-hover:text-amber-500 font-mono text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Shop by category */}
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">Shop by category</h2>
          <div className="flex flex-col divide-y divide-slate-100">
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/shop?cat=${c.id}`}
                className="flex items-center justify-between py-3 text-slate-700 hover:text-amber-600 text-sm font-medium transition-colors group">
                {c.label}
                <span className="text-slate-300 group-hover:text-amber-500 font-mono text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-200 text-center">
        <p className="text-slate-500 text-sm">
          Need help?{" "}
          <a href="mailto:info@maxgen.com.sa" className="text-amber-600 hover:underline">info@maxgen.com.sa</a>
          {" "}or{" "}
          <Link href="/contact" className="text-amber-600 hover:underline">contact us online</Link>.
        </p>
      </div>
    </section>
  );
}
