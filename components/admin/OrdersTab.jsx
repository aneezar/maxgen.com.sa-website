"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Download, Search, CheckCircle2 } from "lucide-react";
import { fmt } from "@/lib/constants";
import { adminUpdateOrderStatus } from "@/lib/actions";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending:    "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped:    "bg-purple-100 text-purple-800 border-purple-200",
  delivered:  "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled:  "bg-red-100 text-red-800 border-red-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status || "pending"}
    </span>
  );
}

function csvExport(orders) {
  const header = "Order ID,Placed At,Status,Items,Subtotal,VAT,Grand Total,Customer,Email,Phone,Notes";
  const lines = orders.map((o) => [
    `"${o.id}"`,
    `"${o.placed_at ? new Date(o.placed_at).toLocaleString("en-GB") : ""}"`,
    `"${o.status || "pending"}"`,
    `"${(o.items || []).map((i) => `${i.qty}x ${i.name}`).join("; ").replace(/"/g, '""')}"`,
    o.subtotal ?? 0,
    o.vat ?? 0,
    o.grand_total ?? 0,
    `"${(o.customer_name || "").replace(/"/g, '""')}"`,
    `"${(o.customer_email || "").replace(/"/g, '""')}"`,
    `"${(o.customer_phone || "").replace(/"/g, '""')}"`,
    `"${(o.notes || "").replace(/"/g, '""')}"`,
  ].join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "orders.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function OrdersTab({ orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [noteEdits, setNoteEdits] = useState({});

  const handleStatusChange = async (id, newStatus) => {
    const notes = noteEdits[id];
    setUpdating(id);
    const ok = await adminUpdateOrderStatus(id, newStatus, notes);
    setUpdating(null);
    if (ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus, notes: notes ?? o.notes } : o));
    }
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => (o.status || "pending") === s).length;
    return acc;
  }, {});

  const filtered = orders
    .filter((o) => filter === "all" || (o.status || "pending") === filter)
    .filter((o) => !query || o.id.toLowerCase().includes(query.toLowerCase()) || (o.customer_name || "").toLowerCase().includes(query.toLowerCase()) || (o.customer_email || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {[{ id: "all", label: `All (${orders.length})` }, ...STATUS_OPTIONS.map((s) => ({ id: s, label: `${s} (${counts[s]})` }))].map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${filter === t.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => csvExport(orders)} type="button" className="flex items-center gap-1.5 border border-slate-300 text-slate-500 font-mono text-[10px] uppercase px-2.5 py-1.5 hover:border-amber-500 hover:text-amber-600">
            <Download size={12} /> Export CSV
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order or customer…" className="w-52 bg-white border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-1.5 text-xs font-mono text-slate-700" />
          </div>
        </div>
      </div>

      <div className="border border-slate-200 bg-slate-50">
        {filtered.length === 0 ? (
          <p className="text-slate-400 font-mono text-sm text-center py-12">{query || filter !== "all" ? "No orders match." : "No orders yet."}</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((o) => {
              const isOpen = expanded === o.id;
              const currentNote = noteEdits[o.id] ?? o.notes ?? "";
              const status = o.status || "pending";

              return (
                <div key={o.id}>
                  {/* Summary row */}
                  <div
                    className="flex items-center justify-between px-4 py-3.5 gap-3 cursor-pointer hover:bg-white transition-colors"
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-mono text-amber-600 text-sm font-semibold">{o.id}</span>
                        <StatusBadge status={status} />
                      </div>
                      {(o.customer_name || o.customer_email) && (
                        <p className="text-slate-700 text-sm">
                          {o.customer_name || ""}{o.customer_email ? ` · ${o.customer_email}` : ""}
                        </p>
                      )}
                      <p className="font-mono text-[11px] text-slate-500">
                        {(o.items || []).length} items · {fmt(o.grand_total)}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {o.placed_at ? new Date(o.placed_at).toLocaleString("en-GB") : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {status === "delivered" && <CheckCircle2 size={15} className="text-emerald-500" />}
                      {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="bg-white border-t border-slate-200 px-4 py-4 space-y-4">
                      {/* Line items */}
                      <div>
                        <p className="font-mono text-[10px] uppercase text-slate-400 mb-2">Line Items</p>
                        <div className="border border-slate-200 divide-y divide-slate-100">
                          {(o.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2">
                              <div className="min-w-0 flex-1">
                                {item.id && <p className="font-mono text-[10px] text-slate-400">{item.id}</p>}
                                <p className="text-slate-900 text-sm">{item.name}</p>
                              </div>
                              <div className="text-right flex-shrink-0 pl-3">
                                <p className="font-mono text-xs text-slate-500">{item.qty} × {fmt(item.price)}</p>
                                <p className="font-mono text-sm text-amber-600 font-semibold">{fmt(item.price * item.qty)}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 bg-slate-50">
                            <span className="font-mono text-xs text-slate-500">Subtotal</span>
                            <span className="font-mono text-xs font-semibold">{fmt(o.subtotal)}</span>
                          </div>
                          <div className="flex justify-between px-3 py-2 bg-slate-50">
                            <span className="font-mono text-xs text-slate-500">VAT</span>
                            <span className="font-mono text-xs">{fmt(o.vat)}</span>
                          </div>
                          <div className="flex justify-between px-3 py-2 bg-amber-50">
                            <span className="font-mono text-xs font-semibold text-slate-700 uppercase">Grand Total</span>
                            <span className="font-mono text-sm font-bold text-amber-700">{fmt(o.grand_total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status + notes */}
                      <div className="space-y-3 border-t border-slate-200 pt-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <label className="font-mono text-[10px] uppercase text-slate-500">Status</label>
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            disabled={updating === o.id}
                            className="bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-1.5 text-sm font-mono text-slate-700"
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {updating === o.id && <Loader2 size={14} className="animate-spin text-amber-500" />}
                        </div>

                        <label className="block">
                          <span className="font-mono text-[10px] uppercase text-slate-500">Internal Notes / Tracking</span>
                          <div className="flex gap-2 mt-1">
                            <textarea
                              rows={2}
                              value={currentNote}
                              onChange={(e) => setNoteEdits((prev) => ({ ...prev, [o.id]: e.target.value }))}
                              placeholder="Tracking number, courier, notes…"
                              className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm font-mono text-slate-700 resize-none"
                            />
                            <button
                              type="button"
                              disabled={updating === o.id}
                              onClick={() => handleStatusChange(o.id, status)}
                              className="border border-slate-300 hover:border-amber-500 text-slate-500 hover:text-amber-600 px-3 text-xs font-mono uppercase self-start py-2"
                            >
                              Save
                            </button>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
