import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-24 text-center">
      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Not Found</p>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">Post not found.</h1>
      <p className="text-slate-500 text-[15px] mb-8 max-w-md mx-auto">
        This article doesn&apos;t exist or may have been removed.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/blog"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider px-6 py-3 transition-colors">
          All Articles
        </Link>
        <Link href="/"
          className="border border-slate-300 hover:border-amber-500 text-slate-600 hover:text-amber-700 font-mono uppercase text-sm tracking-wider px-6 py-3 transition-colors">
          Go Home
        </Link>
      </div>
    </section>
  );
}
