function RowSkeleton() {
  return (
    <div className="border border-slate-200 bg-white px-5 py-4 flex items-center justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
      <div className="h-8 w-24 bg-amber-100 rounded animate-pulse" />
    </div>
  );
}

export default function MyQuotesLoading() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-12">
      <div className="h-8 w-44 bg-slate-200 rounded animate-pulse mb-2" />
      <div className="h-4 w-72 bg-slate-100 rounded animate-pulse mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    </section>
  );
}
