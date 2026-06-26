"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Menu, ChevronRight } from "lucide-react";
import Logo from "./Logo";
import { useQuote } from "./QuoteContext";
import { fmt } from "@/lib/constants";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/verticals", label: "Verticals" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/customers", label: "Major Customers" },
  { href: "/partners", label: "Partners" },
  { href: "/career", label: "Career" },
];

const tailLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
];

export default function NavBar({ onCartClick }) {
  const [open, setOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const { itemCount, subtotal } = useQuote();

  return (
    <div className="border-b border-slate-200 bg-white/95 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link href="/"><Logo small /></Link>

        <nav className="hidden md:flex items-center gap-1">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
              {l.label}
            </Link>
          ))}

          <div className="relative" onMouseEnter={() => setCompanyOpen(true)} onMouseLeave={() => setCompanyOpen(false)}>
            <button className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 flex items-center gap-1">
              Company <ChevronRight size={11} className={`transition-transform ${companyOpen ? "rotate-90" : ""}`} />
            </button>
            {companyOpen && (
              <div className="absolute left-0 top-full bg-white border border-slate-200 shadow-lg py-1 min-w-[180px] z-50">
                {companyLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="block w-full text-left px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50">
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {tailLinks.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onCartClick} className="flex items-center gap-2 border border-slate-300 hover:border-amber-500 px-3 py-2 transition-colors">
            <ClipboardList size={16} className="text-amber-600" />
            <span className="font-mono text-xs">{itemCount}</span>
            <span className="font-mono text-xs text-amber-600 hidden sm:inline">{itemCount > 0 ? fmt(subtotal) : "Quote"}</span>
          </button>
          <button className="md:hidden text-slate-500" onClick={() => setOpen((v) => !v)}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 px-5 py-2 flex flex-col">
          {[...mainLinks, ...companyLinks, ...tailLinks].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-left py-2 font-mono text-xs uppercase tracking-wider text-slate-500">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
