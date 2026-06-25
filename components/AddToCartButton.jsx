"use client";

import { useState } from "react";
import { Plus, Minus, CircleDot, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

/**
 * Quantity-aware "Add to Cart" control.
 * - `compact` (default): a stepper + add button, used in grid/list cards.
 * - `compact={false}`: full-width single button, used on the product detail page,
 *   where the page itself usually provides its own quantity stepper already.
 */
export default function AddToCartButton({ product, className, compact = true }) {
  const { cart, addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const inCart = cart.find((i) => i.id === product.id)?.qty || 0;
  const maxQty = Math.max(1, product.stock || 1);

  const handleAdd = () => {
    addToCart(product, qty);
    setQty(1);
  };

  if (!compact) {
    return (
      <button onClick={handleAdd} className={className}>
        <ShoppingCart size={16} /> Add to Cart{inCart > 0 ? ` (${inCart} in cart)` : ""}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center border border-slate-300">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Decrease quantity"
        >
          <Minus size={12} />
        </button>
        <span className="w-7 text-center font-mono text-xs">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          className="p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Increase quantity"
        >
          <Plus size={12} />
        </button>
      </div>
      <button
        onClick={handleAdd}
        className={className || "flex items-center gap-1.5 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 px-3 py-2 text-[12px] font-mono uppercase tracking-wider transition-colors"}
      >
        {inCart > 0 ? <><CircleDot size={13} /> {inCart}</> : <><Plus size={13} /> Add</>}
      </button>
    </div>
  );
}
