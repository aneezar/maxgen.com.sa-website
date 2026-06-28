"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("[Route Error]", error);
  }, [error]);

  return (
    <section className="max-w-3xl mx-auto px-5 py-24 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 border border-red-200 mb-6">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <p className="font-mono text-red-500 text-xs uppercase tracking-[0.2em] mb-3">Something went wrong</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-4 font-display">
        This page ran into an error.
      </h1>
      <p className="text-slate-500 text-[15px] mb-8 max-w-md mx-auto leading-relaxed">
        A temporary issue occurred loading this page. Try refreshing — if the problem persists, contact us at{" "}
        <a href="mailto:info@maxgen.com.sa" className="text-amber-600 hover:underline">info@maxgen.com.sa</a>.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider px-6 py-3 transition-colors"
        >
          <RefreshCw size={14} /> Try Again
        </button>
        <Link
          href="/"
          className="border border-slate-300 hover:border-amber-500 text-slate-600 hover:text-amber-700 font-mono uppercase text-sm tracking-wider px-6 py-3 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </section>
  );
}
