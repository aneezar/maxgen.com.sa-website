import { MapPin, Phone, Mail } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { getContent } from "@/lib/db";
import { parseBranches, SITE_URL } from "@/lib/constants";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Maxgen for electrical accessories and ELV systems orders, quotes, and project support across Saudi Arabia, India, the UK, and the USA.",
  alternates: { canonical: "/contact" },
};

export const revalidate = 3600;

export default async function ContactPage() {
  const content = await getContent();
  const branches = parseBranches(content?.branches);

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Maxgen",
    address: { "@type": "PostalAddress", streetAddress: content?.contactAddress, addressCountry: "SA" },
    telephone: content?.contactPhone,
    email: content?.contactEmail,
    url: `${SITE_URL}/contact`,
  };

  return (
    <section className="max-w-5xl mx-auto px-5 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Get In Touch</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-6 font-display">Talk to us about your order.</h1>
          <div className="space-y-4 text-slate-500 text-sm">
            <div className="flex items-center gap-3"><MapPin size={16} className="text-amber-600" /> {content?.contactAddress}</div>
            <div className="flex items-center gap-3"><Phone size={16} className="text-amber-600" /> {content?.contactPhone}</div>
            <div className="flex items-center gap-3"><Mail size={16} className="text-amber-600" /> {content?.contactEmail}</div>
          </div>
        </div>

        <ContactForm />
      </div>

      <div className="mt-16">
        <h2 className="font-mono text-amber-600 text-xs uppercase tracking-widest mb-5 pb-2 border-b border-slate-200">Our Global Branches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.map((b, i) => (
            <div key={i} className="border border-slate-200 bg-white shadow-sm px-5 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-600 mb-2">{b.country}</p>
              <div className="flex items-start gap-2 text-slate-600 text-sm mb-2">
                <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" /> <span>{b.address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <Phone size={14} className="text-slate-400 flex-shrink-0" /> <span>{b.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
