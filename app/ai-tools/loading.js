export default function AIToolsLoading() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-slate-200 pb-6">
        <div className="h-3 w-28 bg-amber-100 rounded animate-pulse mb-3" />
        <div className="h-9 w-64 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
      </div>

      {/* Tool tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {[120, 100, 140, 90, 110].map((w, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" style={{ width: w }} />
        ))}
      </div>

      {/* Panel */}
      <div className="border border-slate-200 bg-slate-50 p-6 space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 bg-white border border-slate-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 bg-white border border-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-24 bg-white border border-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-full bg-amber-100 rounded animate-pulse" />
      </div>
    </section>
  );
}
