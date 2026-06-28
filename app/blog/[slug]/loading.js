export default function BlogPostLoading() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-4 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-4 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Type + date */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-16 bg-amber-100 rounded animate-pulse" />
        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Title */}
      <div className="space-y-2 mb-6">
        <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-4/5 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5 mb-8">
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-11/12 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
      </div>

      {/* Hero image */}
      <div className="h-64 sm:h-80 bg-slate-200 rounded animate-pulse mb-10" />

      {/* Body paragraphs */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-11/12 bg-slate-100 rounded animate-pulse" />
            {i % 3 === 0 && <div className="h-4 w-4/5 bg-slate-100 rounded animate-pulse" />}
          </div>
        ))}
      </div>
    </article>
  );
}
