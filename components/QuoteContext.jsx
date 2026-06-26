"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [quote, setQuote] = useState([]);
  const [quoteHistory, setQuoteHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("maxgen:quote");
      if (raw) setQuote(JSON.parse(raw));
      const hist = localStorage.getItem("maxgen:quote-history");
      if (hist) setQuoteHistory(JSON.parse(hist));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem("maxgen:quote", JSON.stringify(quote)); } catch {}
  }, [quote, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem("maxgen:quote-history", JSON.stringify(quoteHistory)); } catch {}
  }, [quoteHistory, hydrated]);

  const addToQuote = useCallback((product, qty = 1) => {
    const addQty = Math.max(1, Number(qty) || 1);
    setQuote((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + addQty } : i);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        brand: product.brand || null,
        spec: product.spec || null,
        price: product.price,
        stock: product.stock,
        qty: addQty,
      }];
    });
  }, []);

  const inc = useCallback((id) => {
    setQuote((prev) => prev.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  }, []);

  const dec = useCallback((id) => {
    setQuote((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
  }, []);

  const remove = useCallback((id) => {
    setQuote((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setQuote([]), []);

  const addToHistory = useCallback((refId) => {
    setQuoteHistory((prev) => prev.includes(refId) ? prev : [refId, ...prev]);
  }, []);

  const subtotal = quote.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = quote.reduce((sum, i) => sum + i.qty, 0);

  return (
    <QuoteContext.Provider value={{ quote, addToQuote, inc, dec, remove, clear, subtotal, itemCount, addToHistory }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside QuoteProvider");
  return ctx;
}
