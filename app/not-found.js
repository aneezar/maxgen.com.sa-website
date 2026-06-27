import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-24 text-center">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">404</p>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">Page not found.</h1>
      <p className="text-slate-500 text-[15px] mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider px-6 py-3 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="border border-slate-300 hover:border-amber-500 text-slate-600 hover:text-amber-700 font-mono uppercase text-sm tracking-wider px-6 py-3 transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    </section>
  );
}
