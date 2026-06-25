"use client";

import { useState } from "react";
import { X, Plus, Minus, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { useCart } from "./CartContext";
import { fmt } from "@/lib/constants";
import { submitOrder } from "@/lib/actions";

export default function CartDrawer({ open, onClose }) {
  const { cart, inc, dec, remove, total, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState(null);

  const checkout = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    const orderId = `MG-ORD-${Date.now().toString().slice(-8)}`;
    const vat = Math.round(total * 0.15);
    const order = {
      orderId,
      items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      subtotal: total,
      vat,
      grandTotal: total + vat,
    };
    const ok = await submitOrder(order);
    setPlacing(false);
    if (ok) {
      setPlacedId(orderId);
      clear();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-slate-200 flex flex-col transform transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber-600">Order Manifest</p>
            <h2 className="text-slate-900 font-semibold text-lg">Cart — {cart.length} {cart.length === 1 ? "item" : "items"}</h2>
          </div>
          <button onClick={() => { onClose(); setPlacedId(null); }} className="text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        {placedId ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={36} />
            <p className="text-slate-900 font-medium text-lg">Order placed.</p>
            <p className="font-mono text-amber-600 text-sm">{placedId}</p>
            <p className="text-slate-500 text-sm">We'll confirm by phone.</p>
            <button onClick={() => { onClose(); setPlacedId(null); }} className="font-mono text-xs uppercase text-amber-600 mt-3">Close</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.length === 0 && <p className="text-slate-400 font-mono text-sm pt-10 text-center">Manifest empty. Add items from the shop.</p>}
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] text-slate-400">{item.id}</p>
                    <p className="text-slate-900 text-sm font-medium truncate">{item.name}</p>
                    <p className="font-mono text-amber-600 text-sm mt-1">{fmt(item.price)}</p>
                  </div>
                  <div className="flex items-center border border-slate-300">
                    <button onClick={() => dec(item.id)} className="p-1.5 text-slate-500 hover:bg-slate-100"><Minus size={13} /></button>
                    <span className="w-8 text-center font-mono text-sm">{item.qty}</span>
                    <button onClick={() => inc(item.id)} className="p-1.5 text-slate-500 hover:bg-slate-100"><Plus size={13} /></button>
                  </div>
                  <button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-5 py-5 space-y-3">
              <div className="flex justify-between font-mono text-sm text-slate-500"><span>Subtotal</span><span>{fmt(total)}</span></div>
              <div className="flex justify-between font-mono text-sm text-slate-500"><span>VAT (15%)</span><span>{fmt(Math.round(total * 0.15))}</span></div>
              <div className="flex justify-between text-slate-900 font-semibold text-lg pt-2 border-t border-slate-200">
                <span>Total</span><span className="text-amber-600">{fmt(total + Math.round(total * 0.15))}</span>
              </div>
              <button
                disabled={cart.length === 0 || placing}
                onClick={checkout}
                className="w-full bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-mono uppercase text-sm tracking-wider py-3 mt-2 flex items-center justify-center gap-2 hover:bg-amber-400"
              >
                {placing ? <><Loader2 size={16} className="animate-spin" /> Placing…</> : <>Place Order <ChevronRight size={16} /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
