import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import ShopFilters from "@/components/ShopFilters";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import QuickViewModal from "@/components/QuickViewModal";
import AIProductSearch from "@/components/AIProductSearch";
import { getProductsFiltered, getBrands, getMaxPrice, getProductById } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";

export const metadata = {
  title: "Shop — Electrical Accessories Catalog",
  description:
    "Browse switches, MCBs, distribution boards, wiring devices, cable trays, and lighting accessories in stock and ready to ship.",
  alternates: { canonical: "/shop" },
};

export const revalidate = 3600;

const PAGE_SIZE = 24;

export default async function ShopPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;

  const cat          = searchParams?.cat          || "all";
  const q            = searchParams?.q            || "";
  const sort         = searchParams?.sort         || "default";
  const rawMaxPrice  = searchParams?.maxPrice     ? Number(searchParams.maxPrice) : null;
  const maxPrice     = rawMaxPrice !== null ? Math.min(Math.max(0, rawMaxPrice), 1_000_000) : null;
  const rawPage      = Math.max(1, Number(searchParams?.page) || 1);
  const brand        = searchParams?.brand        || "all";
  const featured     = searchParams?.featured     === "true";
  const availability = searchParams?.availability || "";
  const viewId       = searchParams?.view         || null;

  const [products, brands, priceCeiling, viewProduct] = await Promise.all([
    getProductsFiltered({ cat, brand, featured, availability, q, sort, maxPrice }),
    getBrands(),
    getMaxPrice(),
    viewId ? getProductById(viewId) : Promise.resolve(null),
  ]);

  const totalPages     = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page           = Math.min(rawPage, totalPages);
  const pageItems      = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCatLabel = cat === "all" ? "All Items" : (CATEGORIES.find((c) => c.id === cat)?.label ?? "All Items");

  // Build a base params object without view/page for composing other URLs
  const baseParams = () => {
    const p = new URLSearchParams();
    if (cat !== "all")        p.set("cat", cat);
    if (q)                    p.set("q", q);
    if (sort !== "default")   p.set("sort", sort);
    if (maxPrice)             p.set("maxPrice", String(maxPrice));
    if (brand !== "all")      p.set("brand", brand);
    if (featured)             p.set("featured", "true");
    if (availability)         p.set("availability", availability);
    return p;
  };

  const closeHref = (() => {
    const p = baseParams();
    const qs = p.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  })();

  return (
    <>
      {viewProduct && <QuickViewModal product={viewProduct} closeHref={closeHref} />}

      <section className="max-w-7xl mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-5">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight size={11} />
          <span className="text-slate-700">{activeCatLabel}</span>
        </div>

        <div className="pb-6 border-b border-slate-200 mb-8">
          <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Shop</p>
          <h1 className="text-3xl font-bold text-slate-900 font-display mb-4">Full Catalog</h1>
          {!!process.env.ANTHROPIC_API_KEY && (
            <div className="max-w-2xl">
              <AIProductSearch />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8">

          {/* Filters sidebar */}
          <Suspense fallback={<div className="text-slate-400 text-sm font-mono">Loading filters…</div>}>
            <ShopFilters priceCeiling={priceCeiling} brands={brands} />
          </Suspense>

          {/* Product grid */}
          <div>
            <p className="font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-4">
              Showing {pageItems.length} of {products.length} items
            </p>

            {products.length === 0 ? (
              <p className="text-slate-500 font-mono text-sm text-center py-16">No items match that search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pageItems.map((p) => {
                  const qvParams = baseParams();
                  qvParams.set("view", p.id);
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      quickViewHref={`/shop?${qvParams.toString()}`}
                    />
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const pp = baseParams();
                  pp.set("page", String(p));
                  return (
                    <Link
                      key={p}
                      href={`/shop?${pp.toString()}`}
                      className={`px-3 py-2 font-mono text-xs border ${
                        p === page
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : "border-slate-300 text-slate-500 hover:border-amber-500"
                      }`}
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
    </>
  );
}
