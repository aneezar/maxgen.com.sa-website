"use client";

import { fmt } from "@/lib/constants";

export default function OrdersTab({ orders }) {
  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">
        {orders.length} orders logged
      </div>
      {orders.length === 0 ? (
        <p className="text-slate-400 font-mono text-sm text-center py-12">No orders yet.</p>
      ) : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {orders.map((o) => (
            <div key={o.id} className="px-4 py-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-mono text-amber-600 text-sm">{o.id}</span>
                <span className="font-mono text-[11px] text-slate-500">{new Date(o.placed_at).toLocaleString()}</span>
              </div>
              <ul className="text-slate-500 text-sm space-y-0.5 mb-2">
                {(o.items || []).map((it, idx) => (
                  <li key={idx}>{it.qty}× {it.name} <span className="text-slate-400">({fmt(it.price)})</span></li>
                ))}
              </ul>
              <p className="font-mono text-slate-700 text-sm">Total: {fmt(o.grand_total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
