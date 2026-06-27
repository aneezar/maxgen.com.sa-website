import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import Logo from "./Logo";
import { CATEGORIES } from "@/lib/constants";

export default function Footer({ content }) {
  return (
    <footer className="bg-slate-900 mt-8 text-slate-300" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-5 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Logo small dark />
          <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-xs">
            Electrical accessories and ELV systems supplier, serving installers and project engineers across India, Saudi Arabia, the UK, and the USA.
          </p>
        </div>

        <div>
          <h4 className="font-mono text-amber-500 text-xs uppercase tracking-widest mb-4">Company</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/about" className="text-left text-slate-400 hover:text-white">About Us</Link>
            <Link href="/verticals" className="text-left text-slate-400 hover:text-white">Verticals</Link>
            <Link href="/customers" className="text-left text-slate-400 hover:text-white">Major Customers</Link>
            <Link href="/partners" className="text-left text-slate-400 hover:text-white">Partners</Link>
            <Link href="/career" className="text-left text-slate-400 hover:text-white">Career</Link>
            <Link href="/contact" className="text-left text-slate-400 hover:text-white">Contact</Link>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-amber-500 text-xs uppercase tracking-widest mb-4">Shop</h4>
          <div className="flex flex-col gap-2 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/shop?cat=${c.id}`} className="text-left text-slate-400 hover:text-white">{c.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono text-amber-500 text-xs uppercase tracking-widest mb-4">Get In Touch</h4>
          <div className="space-y-2.5 text-sm text-slate-400">
            <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 flex-shrink-0 text-amber-500" /> {content?.contactAddress}</div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-amber-500" /> {content?.contactPhone}</div>
            <div className="flex items-center gap-2"><Mail size={14} className="text-amber-500" /> {content?.contactEmail}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} Maxgen. All rights reserved.</span>
          <span>India · Saudi Arabia · United Kingdom · United States</span>
        </div>
      </div>
    </footer>
  );
}
