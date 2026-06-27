import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductImg } from "@/components/UI";
import { getServiceBySlug, getServices } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { imgixUrl } from "@/lib/imgix";

export const revalidate = 3600;
// Explicitly allow on-demand rendering for slugs not yet in
// generateStaticParams — e.g. a vertical added via Admin since the last build.
export const dynamicParams = true;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const service = await getServiceBySlug(params.slug);
  if (!service) return {};
  const ogImage = service.image
    ? imgixUrl(service.image, { w: 1200, h: 630, fit: "crop", q: 85 })
    : null;
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `/verticals/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.description,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: service.title }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ServiceDetailPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const service = await getServiceBySlug(params.slug);
  if (!service) notFound();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: { "@type": "Organization", name: "Maxgen", url: SITE_URL },
    areaServed: ["Saudi Arabia", "India", "United Kingdom", "United States"],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Verticals", item: `${SITE_URL}/verticals` },
      { "@type": "ListItem", position: 3, name: service.title, item: `${SITE_URL}/verticals/${service.slug}` },
    ],
  };

  const heroSrc = imgixUrl(service.image, { w: 900, h: 500, q: 80 });

  return (
    <section className="max-w-4xl mx-auto px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Link href="/verticals" className="font-mono text-xs uppercase text-amber-600 flex items-center gap-1 mb-6">
        <ChevronRight size={12} className="rotate-180" /> Back to Verticals
      </Link>

      <ProductImg src={heroSrc} alt={service.title} className="w-full h-64 mb-8" loading="eager" />

      <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">
        {service.division}{service.category ? ` · ${service.category}` : ""}
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 font-display">{service.title}</h1>
      <p className="text-slate-500 text-[16px] leading-relaxed mb-4">{service.description}</p>
      <p className="text-slate-500 text-[15px] leading-relaxed">{service.detail}</p>

      <div className="mt-10 border border-slate-200 bg-slate-50 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">Need this for a project or site? Get in touch and we'll scope it.</p>
        <Link href="/contact" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider px-4 py-2.5 flex items-center gap-1.5 flex-shrink-0">
          Request Quote <ChevronRight size={13} />
        </Link>
      </div>
    </section>
  );
}
