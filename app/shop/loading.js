import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function ShopLoading() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      {/* Breadcrumb skeleton */}
      <div className="h-3 w-32 bg-slate-200 rounded animate-pulse mb-5" />

      {/* Heading skeleton */}
      <div className="pb-6 border-b border-slate-200 mb-8">
        <div className="h-3 w-10 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-8 w-44 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8">

        {/* Filter sidebar skeleton */}
        <div className="space-y-7">
          {[4, 7, 4, 2, 2].map((rows, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="flex flex-col gap-1">
                {Array.from({ length: rows }).map((_, j) => (
                  <div key={j} className="h-9 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Product grid skeleton */}
        <div>
          <div className="h-3 w-36 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
