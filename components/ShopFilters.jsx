"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES, fmt } from "@/lib/constants";

export default function ShopFilters({ priceCeiling }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCat = searchParams.get("cat") || "all";
  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "default";
  const maxPrice = searchParams.get("maxPrice") || "";

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "all" || value === "default") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <aside className="space-y-6">
      <div>
        <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Category</h4>
        <div className="flex flex-col gap-1">
          <button onClick={() => updateParam("cat", "all")} className={`text-left px-3 py-2 text-sm font-medium ${activeCat === "all" ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}>
            All Items
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => updateParam("cat", c.id)} className={`text-left px-3 py-2 text-sm font-medium ${activeCat === c.id ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Max Price</h4>
        <input
          type="range"
          min="0"
          max={priceCeiling}
          value={maxPrice === "" ? priceCeiling : maxPrice}
          onChange={(e) => updateParam("maxPrice", e.target.value)}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between font-mono text-[11px] text-slate-500 mt-1">
          <span>SAR 0</span>
          <span>{fmt(maxPrice === "" ? priceCeiling : Number(maxPrice))}</span>
        </div>
        {maxPrice !== "" && (
          <button onClick={() => updateParam("maxPrice", "")} className="font-mono text-[11px] text-amber-600 mt-2">Clear price filter</button>
        )}
      </div>

      <div>
        <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Search</h4>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            defaultValue={query}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="SKU or name"
            className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-2 text-sm font-mono text-slate-700"
          />
        </div>
      </div>

      <div>
        <h4 className="font-mono text-[11px] uppercase text-slate-500 tracking-wider mb-3">Sort</h4>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full bg-white border border-slate-300 text-sm text-slate-700 px-3 py-2 font-mono"
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
        </select>
      </div>
    </aside>
  );
}
