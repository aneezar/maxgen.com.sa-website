import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, BadgeCheck, Wrench, Star } from "lucide-react";
import { ProductImg, StatusDot } from "@/components/UI";
import { imgixUrl } from "@/lib/imgix";
import AddToQuoteButton from "@/components/AddToQuoteButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getProductById, getProducts } from "@/lib/db";
import { CATEGORIES, fmt, SITE_URL } from "@/lib/constants";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const product = await getProductById(params.id);
  if (!product) return {};
  const ogImage =
    product.image && !product.image.startsWith("data:")
      ? imgixUrl(product.image, { w: 1200, h: 630, fit: "crop", q: 85 })
      : null;
  return {
    title: product.name,
    description: `${product.name} — ${product.spec}. ${fmt(product.price)}. In stock, ships in 2–4 working days from Maxgen.`,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      title: product.name,
      description: product.spec,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: product.name }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProductDetailPage({ params: paramsPromise }) {
  const params  = await paramsPromise;
  const product = await getProductById(params.id);
  if (!product) notFound();

  const allProducts = await getProducts();
  const category    = CATEGORIES.find((c) => c.id === product.cat);
  const related     = allProducts.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 4);
  const heroImg     = imgixUrl(product.image, { w: 1200, h: 900, q: 80 });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.spec,
    sku: product.id,
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    ...(product.image && !product.image.startsWith("data:") && { image: product.image }),
    offers: {
      "@type": "Offer",
      priceCurrency: "SAR",
      price: product.price,
      availability:
        product.status === "low"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
      url: `${SITE_URL}/shop/${product.id}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      ...(category
        ? [{ "@type": "ListItem", position: 3, name: category.label, item: `${SITE_URL}/shop?cat=${product.cat}` }]
        : []),
      { "@type": "ListItem", position: category ? 4 : 3, name: product.name, item: `${SITE_URL}/shop/${product.id}` },
    ],
  };

  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-6 flex-wrap">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <ChevronRight size={11} />
        <Link href="/shop" className="hover:text-amber-600">Shop</Link>
        {category && (
          <>
            <ChevronRight size={11} />
            <Link href={`/shop?cat=${product.cat}`} className="hover:text-amber-600">{category.label}</Link>
          </>
        )}
        <ChevronRight size={11} />
        <span className="text-slate-700">{product.id}</span>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Image */}
        <div className="relative">
          {product.featured && (
            <span className="absolute top-3 left-3 z-10 bg-amber-500 text-slate-950 font-mono text-[9px] uppercase tracking-wider px-2 py-1 flex items-center gap-1">
              <Star size={8} /> Featured
            </span>
          )}
          <ProductImg
            src={heroImg}
            alt={product.name}
            className="w-full h-80 sm:h-[420px] border border-slate-200"
            loading="eager"
          />
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-slate-400">{product.id}</span>
            <StatusDot status={product.status} />
            <span className="font-mono text-[11px] uppercase text-slate-500">
              {product.status === "low" ? "Low stock" : "In stock"}
            </span>
          </div>

          {product.brand && (
            <span className="inline-block font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 uppercase tracking-wider mb-3">
              {product.brand}
            </span>
          )}

          <h1 className="text-3xl font-bold text-slate-900 mb-3 font-display">{product.name}</h1>
          <p className="font-mono text-slate-500 text-sm mb-5 leading-relaxed">{product.spec}</p>

          <p className="font-mono text-3xl text-amber-600 font-semibold mb-1">{fmt(product.price)}</p>
          <p className="text-slate-400 text-xs mb-6">
            VAT included where applicable · {product.stock} units in stock
          </p>

          <div className="flex flex-col gap-3">
            <AddToQuoteButton
              product={product}
              compact={false}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider py-3.5 flex items-center justify-center gap-2 transition-colors"
            />
            <WhatsAppButton product={product} />
          </div>

          <div className="border-t border-slate-200 pt-5 mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Truck size={16} className="text-amber-600 flex-shrink-0" />
              Dispatch in 2–4 working days
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <BadgeCheck size={16} className="text-amber-600 flex-shrink-0" />
              ISI / CE certified, batch traceable
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Wrench size={16} className="text-amber-600 flex-shrink-0" />
              BOQ and bulk order support available
            </div>
          </div>
        </div>
      </div>

      {/* Applications */}
      {product.applications && (
        <div className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Applications</h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line max-w-3xl">
            {product.applications}
          </p>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-5 font-display">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.id}`}
                className="text-left border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-amber-500 transition-all flex flex-col"
              >
                <ProductImg
                  src={imgixUrl(p.image, { w: 400, h: 300, q: 70 })}
                  alt={p.name}
                  className="w-full h-28"
                />
                <div className="px-3 py-3">
                  {p.brand && (
                    <p className="font-mono text-[9px] uppercase tracking-wider text-amber-700 mb-0.5">{p.brand}</p>
                  )}
                  <p className="text-slate-900 text-sm font-medium truncate">{p.name}</p>
                  <p className="font-mono text-amber-600 text-sm mt-1">{fmt(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
