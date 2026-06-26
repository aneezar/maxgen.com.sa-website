export default function ProductCardSkeleton() {
  return (
    <div className="border border-slate-200 bg-white flex flex-col overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="px-4 pt-3 pb-4 flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-3 w-14 bg-slate-200 rounded" />
        </div>
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-3 w-3/4 bg-slate-200 rounded" />
        <div className="mt-1 flex justify-between items-center border-t border-slate-100 pt-3">
          <div className="h-5 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-20 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}
