export default function QuoteDetailLoading() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-12">
      {/* Back link */}
      <div className="h-3 w-28 bg-slate-200 rounded animate-pulse mb-8" />

      {/* Header */}
      <div className="border border-slate-200 bg-slate-50 px-6 py-5 mb-6 space-y-3">
        <div className="h-3 w-32 bg-amber-100 rounded animate-pulse" />
        <div className="h-7 w-52 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Status timeline */}
      <div className="border border-slate-200 bg-white px-6 py-5 mb-6">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-5" />
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-100 rounded-full animate-pulse" />
              {i < 4 && <div className="h-px w-8 bg-slate-100" />}
            </div>
          ))}
        </div>
      </div>

      {/* Items table */}
      <div className="border border-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 border-b border-slate-100 flex justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-slate-100 rounded animate-pulse self-center" />
          </div>
        ))}
        <div className="px-5 py-4 flex justify-end">
          <div className="h-5 w-32 bg-amber-100 rounded animate-pulse" />
        </div>
      </div>
    </section>
  );
}
