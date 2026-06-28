"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Star, SlidersHorizontal, ChevronDown } from "lucide-react";
import { CATEGORIES, fmt } from "@/lib/constants";

export default function ShopFilters({ priceCeiling, brands = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const activeCat    = searchParams.get("cat")          || "all";
  const activeBrand  = searchParams.get("brand")        || "all";
  const query        = searchParams.get("q")            || "";
  const sort         = searchParams.get("sort")         || "default";
  const maxPrice     = searchParams.get("maxPrice")     || "";
  const availability = searchParams.get("availability") || "";
  const featured     = searchParams.get("featured")     || "";

  const activeCount = [
    activeCat !== "all",
    activeBrand !== "all",
    availability === "instock",
    featured === "true",
    maxPrice !== "",
    sort !== "default",
  ].filter(Boolean).length;

  const update = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || value === "default") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggle = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <aside>

      {/* ── Search — always visible on all screens ── */}
      <div className="mb-4 lg:mb-0 lg:space-y-7">
        <div className="lg:mb-0">
          <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-2 hidden lg:block">Search</h4>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              defaultValue={query}
              onChange={(e) => update("q", e.target.value)}
              placeholder="SKU, name or brand"
              aria-label="Search products"
              className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-2 text-sm font-mono text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* ── Mobile: Filters toggle button ── */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 border border-slate-200 bg-white mt-3"
        aria-expanded={mobileOpen}
      >
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-700">
          <SlidersHorizontal size={13} />
          Filters
          {activeCount > 0 && (
            <span className="bg-amber-500 text-slate-950 font-mono text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center leading-none">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Filter panel — hidden on mobile until toggled, always shown on lg ── */}
      <div className={`${mobileOpen ? "block" : "hidden"} lg:block`}>

        {/* Mobile: compact panel below toggle */}
        <div className="lg:hidden border border-t-0 border-slate-200 bg-slate-50 px-4 pt-4 pb-5 grid grid-cols-2 gap-x-5 gap-y-5">

          {/* Category */}
          <div>
            <h4 className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mb-2">Category</h4>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => update("cat", "all")}
                className={`text-left px-2 py-1.5 text-xs font-medium transition-colors ${activeCat === "all" ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-white"}`}
              >
                All Items
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => update("cat", c.id)}
                  className={`text-left px-2 py-1.5 text-xs font-medium transition-colors ${activeCat === c.id ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-white"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <h4 className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mb-2">Brand</h4>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => update("brand", "all")}
                className={`text-left px-2 py-1.5 text-xs font-medium transition-colors ${activeBrand === "all" ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-white"}`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => update("brand", b)}
                  className={`text-left px-2 py-1.5 text-xs font-medium transition-colors ${activeBrand === b ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-white"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Availability + Featured */}
          <div className="space-y-2">
            <h4 className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mb-2">Filters</h4>
            <button
              onClick={() => toggle("availability", "instock")}
              className={`w-full text-left px-2 py-1.5 text-xs font-medium border transition-colors ${
                availability === "instock" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              In Stock Only
            </button>
            <button
              onClick={() => toggle("featured", "true")}
              className={`w-full text-left px-2 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                featured === "true" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <Star size={11} className={featured === "true" ? "text-amber-500" : "text-slate-300"} />
              Featured Only
            </button>
          </div>

          {/* Sort */}
          <div>
            <h4 className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mb-2">Sort</h4>
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs text-slate-700 px-2 py-1.5 font-mono"
              aria-label="Sort products"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
          </div>

          {/* Max price — full width */}
          <div className="col-span-2">
            <h4 className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mb-2">Max Price</h4>
            <input
              type="range" min="0" max={priceCeiling}
              value={maxPrice === "" ? priceCeiling : maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="w-full accent-amber-500"
              aria-label="Maximum price filter"
            />
            <div className="flex justify-between font-mono text-[10px] text-slate-500 mt-1">
              <span>SAR 0</span>
              <span>{fmt(maxPrice === "" ? priceCeiling : Number(maxPrice))}</span>
            </div>
            {maxPrice !== "" && (
              <button onClick={() => update("maxPrice", "")} className="font-mono text-[11px] text-amber-600 hover:text-amber-500 mt-1">
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Desktop: full sidebar ── */}
        <div className="hidden lg:block space-y-7 mt-7">

          {/* Category */}
          <div>
            <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Category</h4>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => update("cat", "all")}
                className={`text-left px-3 py-2 text-sm font-medium transition-colors ${activeCat === "all" ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                All Items
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => update("cat", c.id)}
                  className={`text-left px-3 py-2 text-sm font-medium transition-colors ${activeCat === c.id ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          {brands.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Brand</h4>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => update("brand", "all")}
                  className={`text-left px-3 py-2 text-sm font-medium transition-colors ${activeBrand === "all" ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => update("brand", b)}
                    className={`text-left px-3 py-2 text-sm font-medium transition-colors ${activeBrand === b ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div>
            <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Availability</h4>
            <button
              onClick={() => toggle("availability", "instock")}
              className={`w-full text-left px-3 py-2 text-sm font-medium border transition-colors ${
                availability === "instock" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              In Stock Only
            </button>
          </div>

          {/* Featured */}
          <div>
            <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Show</h4>
            <button
              onClick={() => toggle("featured", "true")}
              className={`w-full text-left px-3 py-2 text-sm font-medium border flex items-center gap-2 transition-colors ${
                featured === "true" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Star size={13} className={featured === "true" ? "text-amber-500" : "text-slate-300"} />
              Featured Only
            </button>
          </div>

          {/* Max price */}
          <div>
            <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Max Price</h4>
            <input
              type="range" min="0" max={priceCeiling}
              value={maxPrice === "" ? priceCeiling : maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="w-full accent-amber-500"
              aria-label="Maximum price filter"
            />
            <div className="flex justify-between font-mono text-[11px] text-slate-500 mt-1">
              <span>SAR 0</span>
              <span>{fmt(maxPrice === "" ? priceCeiling : Number(maxPrice))}</span>
            </div>
            {maxPrice !== "" && (
              <button onClick={() => update("maxPrice", "")} className="font-mono text-[11px] text-amber-600 hover:text-amber-500 mt-2">
                Clear price filter
              </button>
            )}
          </div>

          {/* Sort */}
          <div>
            <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Sort</h4>
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="w-full bg-white border border-slate-300 text-sm text-slate-700 px-3 py-2 font-mono"
              aria-label="Sort products"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
          </div>

        </div>
      </div>
    </aside>
  );
}
