import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getContent } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const metadata = {
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
    card: "summary",
    title: "Maxgen | Electrical Accessories & ELV Systems",
    description: "Electrical accessories and ELV systems supplier across India, Saudi Arabia, the UK, and the USA.",
  },
  robots: { index: true, follow: true },
};

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
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <SiteChrome content={content}>{children}</SiteChrome>
      </body>
    </html>
  );
}
