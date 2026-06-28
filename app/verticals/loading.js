function VerticalCardSkeleton() {
  return (
    <div className="border border-slate-200 bg-white">
      <div className="h-40 bg-slate-200 animate-pulse" />
      <div className="p-5 space-y-2.5">
        <div className="h-3 w-20 bg-amber-100 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
        <div className="h-8 w-28 bg-slate-100 rounded animate-pulse mt-2" />
      </div>
    </div>
  );
}

export default function VerticalsLoading() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <div className="mb-8">
        <div className="h-3 w-20 bg-amber-100 rounded animate-pulse mb-3" />
        <div className="h-9 w-56 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <VerticalCardSkeleton key={i} />)}
      </div>
    </section>
  );
}
