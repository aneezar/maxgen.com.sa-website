function CardSkeleton() {
  return (
    <div className="border border-slate-200 bg-white">
      <div className="h-44 bg-slate-200 animate-pulse" />
      <div className="p-5 space-y-2.5">
        <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-5 w-4/5 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
        <div className="flex gap-2 pt-1">
          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function BlogLoading() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-12">
      {/* Heading */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-4" />
        {/* Type tabs */}
        <div className="flex gap-2 flex-wrap">
          {[80, 60, 90, 70].map((w, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </section>
  );
}
