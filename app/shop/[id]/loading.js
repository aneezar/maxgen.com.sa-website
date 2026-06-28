const P = ({ w, h = 4, className = "" }) => (
  <div className={`bg-slate-200 rounded animate-pulse ${className}`} style={{ width: w, height: h * 4 }} />
);

export default function ProductDetailLoading() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <P w={40} h={3} />
        <P w={8} h={3} />
        <P w={60} h={3} />
        <P w={8} h={3} />
        <P w={120} h={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image skeleton */}
        <div className="bg-slate-200 animate-pulse h-80 sm:h-[420px] rounded" />

        {/* Detail skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <P w={80} h={3} />
            <P w={60} h={3} />
          </div>
          <P w={60} h={3} />
          <P w="100%" h={9} />
          <div className="space-y-1.5">
            <P w="90%" h={4} />
            <P w="80%" h={4} />
            <P w="70%" h={4} />
          </div>
          <P w={100} h={8} />
          <div className="space-y-3 pt-2">
            <div className="bg-amber-100 animate-pulse h-12 rounded" />
            <div className="bg-slate-100 animate-pulse h-12 rounded" />
          </div>
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <P w="60%" h={4} />
            <P w="55%" h={4} />
            <P w="65%" h={4} />
          </div>
        </div>
      </div>
    </section>
  );
}
