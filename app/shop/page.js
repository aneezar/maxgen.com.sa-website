import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { ProductImg, StatusDot } from "@/components/UI";
import AddToCartButton from "@/components/AddToCartButton";
import ShopFilters from "@/components/ShopFilters";
import { getProducts } from "@/lib/db";
import { CATEGORIES, fmt } from "@/lib/constants";

export const metadata = {
  title: "Shop — Electrical Accessories Catalog",
  description: "Browse switches, MCBs, distribution boards, wiring devices, cable trays, and lighting accessories in stock and ready to ship.",
  alternates: { canonical: "/shop" },
};

export const revalidate = 3600;

const PAGE_SIZE = 24;

export default async function ShopPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const products = await getProducts();
  const priceCeiling = Math.max(100, ...products.map((p) => p.price));

  const cat = searchParams?.cat || "all";
  const q = (searchParams?.q || "").toLowerCase();
  const sort = searchParams?.sort || "default";
  const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : null;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  let filtered = products.filter((p) => {
    const matchCat = cat === "all" || p.cat === cat;
    const matchQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const matchPrice = maxPrice === null || p.price <= maxPrice;
    return matchCat && matchQuery && matchPrice;
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "name-asc") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCatLabel = cat === "all" ? "All Items" : CATEGORIES.find((c) => c.id === cat)?.label;

  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-5">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <ChevronRight size={11} />
        <span className="text-slate-700">{activeCatLabel}</span>
      </div>

      <div className="pb-6 border-b border-slate-200 mb-8">
        <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Shop</p>
        <h1 className="text-3xl font-bold text-slate-900 font-display">Full Catalog</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading filters…</div>}>
          <ShopFilters priceCeiling={priceCeiling} />
        </Suspense>

        <div>
          <p className="font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-4">
            Showing {pageItems.length} of {filtered.length} items
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((p) => (
              <div key={p.id} className="group relative border border-slate-200 bg-white hover:border-amber-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col h-full overflow-hidden">
                <Link href={`/shop/${p.id}`} className="block">
                  <ProductImg src={p.image} alt={p.name} className="aspect-[4/3] h-auto" />
                </Link>
                <div className="flex items-center justify-between px-4 pt-3">
                  <span className="font-mono text-[11px] tracking-wider text-slate-500">{p.id}</span>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={p.status} />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{p.status === "low" ? "low stock" : "in stock"}</span>
                  </div>
                </div>
                <Link href={`/shop/${p.id}`} className="px-4 pt-2 pb-4 flex-1 block">
                  <h2 className="text-slate-900 font-semibold text-[15px] leading-snug hover:text-amber-700 line-clamp-2">{p.name}</h2>
                  <p className="font-mono text-[12px] text-slate-500 mt-1.5 tracking-wide line-clamp-2">{p.spec}</p>
                </Link>
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50 mt-auto">
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-lg text-amber-600 font-medium truncate">{fmt(p.price)}</span>
                    <span className="font-mono text-[10px] text-slate-500">{p.stock} units · stock</span>
                  </div>
                  <AddToCartButton product={p} />
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && <p className="text-slate-500 font-mono text-sm text-center py-16">No items match that search.</p>}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const params = new URLSearchParams({ ...searchParams, page: String(p) });
                return (
                  <Link
                    key={p}
                    href={`/shop?${params.toString()}`}
                    className={`px-3 py-2 font-mono text-xs border ${p === page ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-amber-500"}`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
