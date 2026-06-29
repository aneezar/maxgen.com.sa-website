import "./globals.css";
import { Inter, Barlow_Condensed } from "next/font/google";
import Script from "next/script";
import SiteChrome from "@/components/SiteChrome";
import { getContent } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const IMGIX_DOMAIN = process.env.NEXT_PUBLIC_IMGIX_DOMAIN;
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Maxgen | Electrical Accessories & ELV Systems — Saudi Arabia",
      template: "%s | Maxgen",
    },
    description:
      "Maxgen supplies electrical accessories and ELV systems — switches, MCBs, distribution boards, CCTV, access control, fire alarm, BMS, and more — across India, Saudi Arabia, the UK, and the USA.",
    keywords: [
      "electrical accessories Saudi Arabia",
      "ELV systems Riyadh",
      "CCTV supplier Saudi Arabia",
      "fire alarm system supplier",
      "building management system BMS",
      "MCB distribution board supplier",
      "structured cabling Riyadh",
    ],
    openGraph: {
      type: "website",
      siteName: "Maxgen",
      title: "Maxgen | Electrical Accessories & ELV Systems",
      description:
        "Electrical accessories and ELV systems supplier across India, Saudi Arabia, the UK, and the USA.",
      url: SITE_URL,
      images: [{ url: "/logo-icon.png", width: 256, height: 224, alt: "Maxgen" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Maxgen | Electrical Accessories & ELV Systems",
      description: "Electrical accessories and ELV systems supplier across India, Saudi Arabia, the UK, and the USA.",
    },
    robots: { index: true, follow: true },
    ...(GSC_VERIFICATION && { verification: { google: GSC_VERIFICATION } }),
  };
}

export default async function RootLayout({ children }) {
  const content = await getContent();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maxgen",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-icon.png`,
    description:
      "Electrical accessories and ELV systems supplier serving India, Saudi Arabia, the UK, and the USA.",
    address: {
      "@type": "PostalAddress",
      streetAddress: content?.contactAddress || "Riyadh, Saudi Arabia",
      addressCountry: "SA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: content?.contactPhone || "",
      contactType: "sales",
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <head>
        {IMGIX_DOMAIN && (
          <link rel="preconnect" href={`https://${IMGIX_DOMAIN}`} crossOrigin="anonymous" />
        )}
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script id="gtm-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');` }} />
        )}
        {/* Google Analytics 4 — production only.
            next/script afterInteractive is dropped by the Cloudflare Worker
            dynamic render path, so we use native async script tags which
            render in all paths (static, ISR, and dynamic). */}
        {GA_ID && process.env.NODE_ENV === "production" && (
          <>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');` }} />
          </>
        )}
      </head>
      <body>
        {/* GTM noscript fallback */}
        {GTM_ID && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
          </noscript>
        )}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-amber-500 focus:text-slate-950 focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <SiteChrome content={content} hasAI={!!process.env.ANTHROPIC_API_KEY}>{children}</SiteChrome>
      </body>
    </html>
  );
}
