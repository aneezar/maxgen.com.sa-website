"use client";

import { useState } from "react";
import NavBar from "./NavBar";
import QuoteBasketDrawer from "./QuoteBasketDrawer";
import Footer from "./Footer";
import { QuoteProvider } from "./QuoteContext";

export default function SiteChrome({ content, children }) {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <QuoteProvider>
      <NavBar onCartClick={() => setQuoteOpen(true)} />

      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-1.5 flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase tracking-widest">
          <span>Catalog synced live</span>
          <span>Riyadh, Saudi Arabia — Dispatch in 2–4 working days</span>
        </div>
      </div>

      <main id="main-content">{children}</main>

      <Footer content={content} />
      <QuoteBasketDrawer open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </QuoteProvider>
  );
}
