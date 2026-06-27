import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, Printer } from "lucide-react";
import { getQuoteById } from "@/lib/db";
import { fmt } from "@/lib/constants";
import QuoteStatusTimeline from "@/components/QuoteStatusTimeline";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Quote ${id}`, robots: { index: false } };
}

export default async function QuoteDetailPage({ params }) {
  const { id } = await params;
  const q = await getQuoteById(id);
  if (!q) notFound();

  return (
    <section className="max-w-3xl mx-auto px-5 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-8 flex-wrap">
        <Link href="/my-quotes" className="hover:text-amber-600">My Quotes</Link>
        <ChevronRight size={11} />
        <span className="text-slate-700">{q.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-1">Request for Quotation</p>
          <h1 className="text-2xl font-bold text-slate-900 font-display">{q.id}</h1>
          <p className="font-mono text-[11px] text-slate-400 mt-1">
            Submitted {new Date(q.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {q.email && (
            <a
              href={`/api/export/${q.id}?email=${encodeURIComponent(q.email)}`}
              download
              className="flex items-center gap-1.5 border border-slate-300 hover:border-amber-500 text-slate-500 hover:text-amber-600 font-mono text-xs uppercase tracking-wider px-3 py-2 transition-colors"
            >
              <FileText size={13} /> Export CSV
            </a>
          )}
          <a
            href={`/quote/${q.id}/print`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 border border-slate-300 hover:border-amber-500 text-slate-500 hover:text-amber-600 font-mono text-xs uppercase tracking-wider px-3 py-2 transition-colors"
          >
            <Printer size={13} /> Download PDF
          </a>
        </div>
      </div>

      {/* Status timeline */}
      <div className="border border-slate-200 bg-white px-6 py-6 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-4">Status</p>
        <QuoteStatusTimeline status={q.status} adminNote={q.admin_note} quotedAt={q.quoted_at} />
      </div>

      {/* Line items */}
      <div className="mb-8">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">Items Requested</h2>
        <div className="border border-slate-200 divide-y divide-slate-200">
          {(q.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-slate-400">{item.id}</p>
                {item.brand && (
                  <p className="font-mono text-[9px] text-amber-700 uppercase tracking-wider">{item.brand}</p>
                )}
                <p className="text-slate-900 text-sm font-medium truncate">{item.name}</p>
                {item.spec && (
                  <p className="font-mono text-[11px] text-slate-500 truncate">{item.spec}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0 pl-4">
                <p className="font-mono text-xs text-slate-500">{item.qty} × {fmt(item.price)}</p>
                <p className="font-mono text-sm text-amber-600 font-semibold">{fmt(item.price * item.qty)}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 bg-slate-50">
            <span className="font-mono text-xs uppercase text-slate-500">Estimated Subtotal</span>
            <span className="font-mono text-sm font-semibold text-slate-900">{fmt(q.subtotal)}</span>
          </div>
        </div>
        <p className="font-mono text-[10px] text-slate-400 mt-2">
          Prices are indicative. A formal quotation will follow.
        </p>
      </div>

      {/* Request details */}
      <div className="mb-8">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">Request Details</h2>
        <div className="border border-slate-200 bg-white divide-y divide-slate-100">
          {[
            ["Contact", q.contact_name],
            q.company     && ["Company", q.company],
            q.project_ref && ["Project Reference", q.project_ref],
            q.delivery_date && ["Required By", new Date(q.delivery_date).toLocaleDateString("en-GB")],
            q.notes       && ["Notes", q.notes],
            q.boq_url     && ["BOQ File", q.boq_url],
          ].filter(Boolean).map(([label, value]) => (
            <div key={label} className="flex gap-4 px-4 py-3">
              <span className="font-mono text-[10px] uppercase text-slate-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
              {label === "BOQ File" ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-amber-600 text-sm underline break-all">
                  Download
                </a>
              ) : (
                <span className="text-slate-700 text-sm whitespace-pre-line">{value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/my-quotes"
        className="font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-amber-600 flex items-center gap-1"
      >
        ← Back to My Quotes
      </Link>
    </section>
  );
}
