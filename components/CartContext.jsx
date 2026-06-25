"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("maxgen:cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("maxgen:cart", JSON.stringify(cart));
    } catch {}
  }, [cart, hydrated]);

  const addToCart = useCallback((product, qty = 1) => {
    const addQty = Math.max(1, Number(qty) || 1);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + addQty } : i));
      }
      return [...prev, { ...product, qty: addQty }];
    });
  }, []);

  const inc = useCallback((id) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  }, []);

  const dec = useCallback((id) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)));
  }, []);

  const remove = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, inc, dec, remove, clear, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
