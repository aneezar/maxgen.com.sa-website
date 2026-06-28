export default function VerticalDetailLoading() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-4 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-4 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
        {/* Left: text */}
        <div className="space-y-4">
          <div className="h-3 w-24 bg-amber-100 rounded animate-pulse" />
          <div className="h-9 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="space-y-2">
            {[100, 95, 88, 75, 90].map((w, i) => (
              <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="pt-4 flex gap-3">
            <div className="h-11 w-40 bg-amber-100 rounded animate-pulse" />
            <div className="h-11 w-32 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        {/* Right: image */}
        <div className="h-72 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Detail section */}
      <div className="border-t border-slate-200 pt-10 space-y-3">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-5" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${85 + (i % 3) * 5}%` }} />
        ))}
      </div>
    </section>
  );
}
