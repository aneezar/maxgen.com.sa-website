import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck, BadgeCheck, Truck,
  Zap, LayoutGrid, Cable, Plug, Lightbulb,
  FileText, Package, Award, QrCode,
  Landmark, Building2, Heart, Wifi, Train, Hammer, Factory,
} from "lucide-react";
import { ProductImg, StatusDot } from "@/components/UI";
import LeadCaptureBlock from "@/components/LeadCaptureBlock";
import { getProductsFiltered, getContent } from "@/lib/db";
import { CATEGORIES, PARTNERS, fmt } from "@/lib/constants";
import { imgixUrl } from "@/lib/imgix";

export const metadata = {
  title: "Maxgen | Electrical Accessories & ELV Systems — Saudi Arabia",
  description:
    "Switches, MCBs, distribution boards, wiring devices, cable trays, and lighting accessories — stocked and ready to ship across Saudi Arabia, India, the UK, and the USA.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

const CATEGORY_ICONS = {
  switches: Zap,
  mcb: ShieldCheck,
  db: LayoutGrid,
  wiring: Plug,
  cabletray: Cable,
  lighting: Lightbulb,
};

const WHY_CHOOSE = [
  {
    icon: BadgeCheck,
    title: "ISI / CE Certified Stock",
    body: "Every product sourced to spec — fully certified for commercial and industrial installation.",
  },
  {
    icon: Truck,
    title: "2–4 Day Dispatch",
    body: "Stocked in-warehouse and ready to ship. Most orders leave within two business days.",
  },
  {
    icon: QrCode,
    title: "Batch Traceability",
    body: "Full lot traceability on every shipment, so your compliance records stay clean.",
  },
  {
    icon: FileText,
    title: "Site BOQ Support",
    body: "Send us your bill of quantities and we'll price it line by line — at project scale.",
  },
  {
    icon: Package,
    title: "Bulk & Project Orders",
    body: "Staged dispatch for phased site work. We coordinate delivery to match your programme.",
  },
  {
    icon: Award,
    title: "10+ Years of Experience",
    body: "Over a decade supplying contractors, integrators, and developers across four countries.",
  },
];

const INDUSTRIES = [
  { icon: Landmark,  label: "Banking & Finance" },
  { icon: Building2, label: "Hospitality" },
  { icon: Heart,     label: "Healthcare" },
  { icon: Wifi,      label: "Telecom" },
  { icon: Train,     label: "Transportation" },
  { icon: Package,   label: "Logistics" },
  { icon: Hammer,    label: "Construction" },
  { icon: Factory,   label: "Industrial" },
];

const STATS = [
  { value: "10+",    label: "Years in Operation" },
  { value: "2,500+", label: "SKUs In Stock" },
  { value: "4",      label: "Countries Served" },
  { value: "2–4 Days", label: "Average Dispatch" },
];

export default async function HomePage() {
  const [featuredRaw, content] = await Promise.all([
    getProductsFiltered({ featured: true }),
    getContent(),
  ]);
  // Fall back to 8 newest products if no items have been marked featured in admin
  const featured = featuredRaw.length > 0
    ? featuredRaw.slice(0, 8)
    : (await getProductsFiltered({})).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1800&q=80&auto=format&fit=crop"
            alt="Electrical and ELV systems installation"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 py-28 sm:py-36">
          <p className="font-mono text-amber-400 text-xs uppercase tracking-[0.2em] mb-3">
            {content?.heroTag ?? "Electrical Catalog · Live Inventory"}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-[1.05] max-w-2xl font-display">
            {content?.heroTitle ?? "Switches, breakers, boards, and wiring — stocked and ready to ship."}
          </h1>
          <p className="text-slate-300 mt-5 max-w-xl text-base leading-relaxed">
            {content?.heroBody ?? "Maxgen supplies certified electrical accessories and ELV systems to contractors and integrators across Saudi Arabia, India, the UK, and the USA."}
          </p>
          <p className="text-slate-400 text-sm mt-3 max-w-lg leading-relaxed">
            Trusted by banks, hotels, telecom providers, and government projects — with full batch traceability and site BOQ support.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/shop"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider px-6 py-3.5 flex items-center gap-2 transition-colors"
            >
              Browse Catalog <ChevronRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="border border-white/40 hover:border-amber-400 hover:text-amber-400 text-white font-mono uppercase text-sm tracking-wider px-6 py-3.5 transition-colors"
            >
              Request Quote
            </Link>
            <Link
              href="/verticals"
              className="border border-white/20 hover:border-white/50 text-slate-400 hover:text-white font-mono uppercase text-sm tracking-wider px-6 py-3.5 transition-colors"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-5 py-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-slate-700">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center sm:px-6 text-center">
                <dt className="font-mono text-2xl sm:text-3xl font-bold text-amber-400">{s.value}</dt>
                <dd className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mt-1">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Product categories */}
      <section className="max-w-7xl mx-auto px-5 py-10 border-b border-slate-200">
        <h2 className="sr-only">Product Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.id] ?? Zap;
            return (
              <Link
                key={c.id}
                href={`/shop?cat=${c.id}`}
                className="flex flex-col items-center gap-2.5 text-center border border-slate-200 bg-white hover:border-amber-500 hover:shadow-md transition-all px-3 py-6 group shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                  <Icon size={19} className="text-amber-600" />
                </div>
                <span className="font-mono text-[10px] text-slate-600 uppercase tracking-wide leading-tight">{c.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why Choose Maxgen */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-16">
          <div className="mb-10 text-center">
            <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-2">Why Maxgen</p>
            <h2 className="text-3xl font-bold text-slate-900 font-display">Built for the people who wire buildings.</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              From a single socket order to a phased multi-site rollout — we work the way contractors and integrators actually work.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_CHOOSE.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-slate-200 shadow-sm px-6 py-7 flex flex-col gap-3 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-[15px]">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-2">Track Record</p>
              <h2 className="text-3xl font-bold text-slate-900 font-display">Industries We Serve</h2>
            </div>
            <Link
              href="/customers"
              className="font-mono text-xs uppercase text-amber-600 flex items-center gap-1 hover:text-amber-500 whitespace-nowrap flex-shrink-0"
            >
              Our Clients <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.label}
                className="flex items-center gap-3 border border-slate-200 bg-white shadow-sm px-4 py-5 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ind.icon size={16} className="text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 leading-tight">{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner logos */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-7">
            Trusted Manufacturer &amp; Technology Partners
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="border border-slate-200 bg-white shadow-sm px-5 py-3.5 flex flex-col items-center gap-0.5 min-w-[130px] hover:border-amber-300 hover:shadow-md transition-all"
              >
                <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  {p.type.replace(" Partner", "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-5 py-14">
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-1">Ready to Ship</p>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Featured Items</h2>
          </div>
          <Link href="/shop" className="font-mono text-xs uppercase text-amber-600 flex items-center gap-1 hover:text-amber-500">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              className="text-left border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-amber-500 transition-all flex flex-col group"
            >
              <div className="w-full h-40 overflow-hidden bg-slate-50">
                <ProductImg src={imgixUrl(p.image, { w: 400, h: 300, q: 75 })} alt={p.name} className="w-full h-full" objectFit="contain" />
              </div>
              <div className="px-4 py-4 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] text-slate-400">{p.id}</span>
                  <StatusDot status={p.status} />
                </div>
                <h3 className="text-slate-900 text-sm font-semibold leading-snug flex-1">{p.name}</h3>
                {p.spec && (
                  <p className="text-slate-400 text-xs mt-1 leading-snug line-clamp-1">{p.spec}</p>
                )}
                <p className="font-mono text-amber-600 mt-3 font-medium">{fmt(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LeadCaptureBlock />
    </>
  );
}
