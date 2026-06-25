"use client";

import { useState } from "react";
import NavBar from "./NavBar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";
import { CartProvider } from "./CartContext";

export default function SiteChrome({ content, children }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <NavBar onCartClick={() => setCartOpen(true)} />

      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-1.5 flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase tracking-widest">
          <span>Catalog synced live</span>
          <span>Riyadh, Saudi Arabia — Dispatch in 2–4 working days</span>
        </div>
      </div>

      {children}

      <Footer content={content} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </CartProvider>
  );
}
