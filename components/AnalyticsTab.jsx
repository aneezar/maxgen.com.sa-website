"use client";

import { useMemo } from "react";
import { Package, Users, Handshake, AlertTriangle, ImageOff, Star } from "lucide-react";
import { CATEGORIES, fmt } from "@/lib/constants";
import { ProductImg } from "./UI";

function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className={`border px-5 py-5 ${accent ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${accent ? "bg-amber-100" : "bg-slate-100"}`}>
        <Icon size={16} className={accent ? "text-amber-600" : "text-slate-500"} />
      </div>
      <p className={`font-display text-3xl font-bold ${accent ? "text-amber-600" : "text-slate-900"}`}>{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-slate-400 text-xs mt-1.5">{sub}</p>}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3 pb-2 border-b border-slate-200">
      {children}
    </h2>
  );
}

function HBar({ label, count, max, total }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const share = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
  return (
    <div className="flex items-center gap-3 py-0.5">
      <span className="font-mono text-[11px] text-slate-600 w-36 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 h-2">
        <div className="bg-amber-400 h-2" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-slate-700 w-6 text-right flex-shrink-0">{count}</span>
      <span className="font-mono text-[10px] text-slate-400 w-8 text-right flex-shrink-0">{share}%</span>
    </div>
  );
}

function MiniStat({ label, value, color = "text-slate-900" }) {
  return (
    <div className="text-center px-4 py-4">
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function AnalyticsTab({ products = [], customers = [], partners = [] }) {
  const stats = useMemo(() => {
    // By category — count per CATEGORIES constant, sorted by count desc
    const byCategory = CATEGORIES
      .map((c) => ({ ...c, count: products.filter((p) => p.cat === c.id).length }))
      .sort((a, b) => b.count - a.count);
    const maxCatCount = Math.max(...byCategory.map((c) => c.count), 1);

    // By brand — aggregate from product.brand field, top 10
    const brandMap = {};
    for (const p of products) {
      if (p.brand) brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
    }
    const byBrand = Object.entries(brandMap)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const maxBrandCount = byBrand.length > 0 ? byBrand[0].count : 1;

    // Featured
    const featuredCount = products.filter((p) => p.featured).length;
    const nonFeaturedCount = products.length - featuredCount;

    // Missing images (no image URL at all — data: URLs are valid uploads)
    const missingImages = products.filter((p) => !p.image || p.image === "");

    // Stock breakdown
    const outOfStock = products.filter((p) => p.stock === 0);
    const lowStock = products.filter((p) => p.status === "low" && p.stock > 0);
    const inStock = products.filter((p) => p.status !== "low" && p.stock > 0);

    // Issues: missing image OR out of stock
    const issueIds = new Set([
      ...missingImages.map((p) => p.id),
      ...outOfStock.map((p) => p.id),
    ]);

    // Estimated catalog value (price × stock for in-stock products)
    const catalogValue = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0,
    );

    // Recently added — only if created_at exists on any product
    const withDate = products.filter((p) => p.created_at);
    const recent = [...withDate]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    return {
      byCategory, maxCatCount,
      byBrand, maxBrandCount,
      featuredCount, nonFeaturedCount,
      missingImages,
      outOfStock, lowStock, inStock,
      issueCount: issueIds.size,
      catalogValue,
      recent,
      hasRecent: recent.length > 0,
    };
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="border border-slate-200 bg-slate-50 py-20 text-center">
        <Package size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="font-mono text-sm text-slate-400 uppercase tracking-wider">No products to analyse yet.</p>
        <p className="text-slate-400 text-xs mt-2">Add products in the Products tab to see analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={products.length.toLocaleString()}
          sub={`Est. catalog value ${fmt(stats.catalogValue)}`}
        />
        <StatCard
          icon={Users}
          label="Total Customers"
          value={customers.length.toLocaleString()}
        />
        <StatCard
          icon={Handshake}
          label="Total Partners"
          value={partners.length.toLocaleString()}
        />
        <StatCard
          icon={AlertTriangle}
          label="Products with Issues"
          value={stats.issueCount.toLocaleString()}
          sub="Missing image or zero stock"
          accent={stats.issueCount > 0}
        />
      </div>

      {/* Products by Category */}
      <div>
        <SectionHeading>Products by Category</SectionHeading>
        <div className="border border-slate-200 bg-white px-5 py-5 space-y-2.5">
          {stats.byCategory.map((c) => (
            <HBar key={c.id} label={c.label} count={c.count} max={stats.maxCatCount} total={products.length} />
          ))}
          {stats.byCategory.every((c) => c.count === 0) && (
            <p className="text-slate-400 font-mono text-xs text-center py-4">No category data available.</p>
          )}
        </div>
      </div>

      {/* Brand + Status columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Products by Brand */}
        <div>
          <SectionHeading>Products by Brand {stats.byBrand.length > 0 ? `(top ${stats.byBrand.length})` : ""}</SectionHeading>
          <div className="border border-slate-200 bg-white px-5 py-5">
            {stats.byBrand.length === 0 ? (
              <p className="text-slate-400 font-mono text-xs text-center py-4">No brand data on products yet.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.byBrand.map(({ brand, count }) => (
                  <HBar key={brand} label={brand} count={count} max={stats.maxBrandCount} total={products.length} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured + Stock status */}
        <div className="space-y-4">

          {/* Featured vs Non-featured */}
          <div>
            <SectionHeading>Featured vs Non-Featured</SectionHeading>
            <div className="border border-slate-200 bg-white grid grid-cols-2 divide-x divide-slate-200">
              <MiniStat
                label="Featured"
                value={stats.featuredCount}
                color="text-amber-600"
              />
              <MiniStat
                label="Not Featured"
                value={stats.nonFeaturedCount}
              />
            </div>
          </div>

          {/* Stock status */}
          <div>
            <SectionHeading>Stock Status</SectionHeading>
            <div className="border border-slate-200 bg-white grid grid-cols-3 divide-x divide-slate-200">
              <MiniStat label="In Stock" value={stats.inStock.length} color="text-emerald-600" />
              <MiniStat label="Low Stock" value={stats.lowStock.length} color="text-amber-600" />
              <MiniStat label="Out of Stock" value={stats.outOfStock.length} color={stats.outOfStock.length > 0 ? "text-red-500" : "text-slate-900"} />
            </div>
          </div>

        </div>
      </div>

      {/* Products Missing Images */}
      <div>
        <SectionHeading>
          Products Missing Images ({stats.missingImages.length})
        </SectionHeading>
        {stats.missingImages.length === 0 ? (
          <div className="border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-2">
            <Star size={13} className="text-emerald-600 flex-shrink-0" />
            <p className="font-mono text-xs text-emerald-700">All products have images assigned.</p>
          </div>
        ) : (
          <div className="border border-slate-200 bg-white divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {stats.missingImages.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ImageOff size={14} className="text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-slate-400">{p.id}</p>
                  <p className="text-slate-700 text-sm font-medium truncate">{p.name}</p>
                </div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wide flex-shrink-0">
                  {CATEGORIES.find((c) => c.id === p.cat)?.label ?? p.cat}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Out-of-Stock Products */}
      {stats.outOfStock.length > 0 && (
        <div>
          <SectionHeading>Out-of-Stock Products ({stats.outOfStock.length})</SectionHeading>
          <div className="border border-slate-200 bg-white divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {stats.outOfStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <ProductImg src={p.image} alt={p.name} className="w-9 h-9 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-slate-400">{p.id}</p>
                  <p className="text-slate-700 text-sm font-medium truncate">{p.name}</p>
                </div>
                <span className="font-mono text-xs text-red-500 flex-shrink-0">0 units</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Products */}
      {stats.hasRecent && (
        <div>
          <SectionHeading>Recently Added Products</SectionHeading>
          <div className="border border-slate-200 bg-white divide-y divide-slate-100">
            {stats.recent.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <ProductImg src={p.image} alt={p.name} className="w-10 h-10 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-slate-400">{p.id}</p>
                  <p className="text-slate-700 text-sm font-medium truncate">{p.name}</p>
                  {p.brand && (
                    <p className="font-mono text-[10px] text-amber-700 uppercase tracking-wider mt-0.5">{p.brand}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 pl-4">
                  <p className="font-mono text-sm text-amber-600 font-medium">{fmt(p.price)}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                    {new Date(p.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
