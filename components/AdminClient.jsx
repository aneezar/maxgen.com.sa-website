"use client";

import { useState } from "react";
import { Lock, BarChart3, FileText, PackagePlus, Building2, Pencil, ClipboardList, UserPlus, Inbox, Briefcase } from "lucide-react";
import { ADMIN_PIN } from "@/lib/auth";
import QuoteAdminPanel from "./QuoteAdminPanel";
import AnalyticsTab from "./AnalyticsTab";
import ProductsTab from "./admin/ProductsTab";
import VerticalsTab from "./admin/VerticalsTab";
import ContentTab from "./admin/ContentTab";
import OrdersTab from "./admin/OrdersTab";
import LeadsTab from "./admin/LeadsTab";
import MessagesTab from "./admin/MessagesTab";
import ApplicationsTab from "./admin/ApplicationsTab";

export default function AdminClient({
  initialProducts, initialServices, initialContent,
  initialOrders, initialLeads, initialMessages, initialApplications,
  initialQuotes, initialCustomers = [], initialPartners = [],
}) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [tab, setTab] = useState("analytics");

  const [products, setProducts] = useState(initialProducts);
  const [services, setServices] = useState(initialServices);
  const [contentForm, setContentForm] = useState(initialContent);
  const [orders] = useState(initialOrders);
  const [leads] = useState(initialLeads);
  const [messages] = useState(initialMessages);
  const [applications] = useState(initialApplications);
  const [quotes, setQuotes] = useState(initialQuotes || []);
  const [customers] = useState(initialCustomers);
  const [partners] = useState(initialPartners);

  const checkPin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) { setAuthed(true); setPinError(""); }
    else setPinError("Incorrect PIN.");
  };

  if (!authed) {
    return (
      <section className="max-w-sm mx-auto px-5 py-24">
        <div className="border border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <Lock className="text-amber-600 mx-auto mb-3" size={26} />
          <h2 className="text-slate-900 font-semibold text-lg mb-1">Admin Access</h2>
          <p className="text-slate-500 text-sm mb-5">Enter the admin PIN to manage the catalog.</p>
          <form onSubmit={checkPin} className="space-y-3">
            <input
              type="text" inputMode="numeric" autoComplete="off"
              value={pin} onChange={(e) => setPin(e.target.value.trim())}
              placeholder="PIN"
              className="w-full bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700 text-center font-mono"
            />
            {pinError && <p className="text-red-500 text-xs font-mono">{pinError}</p>}
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider py-2.5">Unlock</button>
          </form>
        </div>
      </section>
    );
  }

  const pendingQuotes = quotes.filter((q) => q.status === "pending").length;

  const TABS = [
    { id: "analytics",    label: "Analytics",    icon: BarChart3 },
    { id: "quotes",       label: `Quotes${pendingQuotes > 0 ? ` (${pendingQuotes} new)` : ""}`, icon: FileText },
    { id: "products",     label: "Products",     icon: PackagePlus },
    { id: "verticals",    label: "Verticals",    icon: Building2 },
    { id: "content",      label: "Content",      icon: Pencil },
    { id: "orders",       label: "Orders",       icon: ClipboardList },
    { id: "leads",        label: "Leads",        icon: UserPlus },
    { id: "messages",     label: "Messages",     icon: Inbox },
    { id: "applications", label: "Applications", icon: Briefcase },
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Catalog & Orders</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 font-mono text-xs uppercase tracking-wider border ${tab === t.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"}`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "analytics"    && <AnalyticsTab products={products} customers={customers} partners={partners} />}
      {tab === "quotes"       && <QuoteAdminPanel quotes={quotes} setQuotes={setQuotes} />}
      {tab === "products"     && <ProductsTab products={products} setProducts={setProducts} />}
      {tab === "verticals"    && <VerticalsTab services={services} setServices={setServices} />}
      {tab === "content"      && <ContentTab contentForm={contentForm} setContentForm={setContentForm} />}
      {tab === "orders"       && <OrdersTab orders={orders} />}
      {tab === "leads"        && <LeadsTab leads={leads} />}
      {tab === "messages"     && <MessagesTab messages={messages} />}
      {tab === "applications" && <ApplicationsTab applications={applications} />}
    </section>
  );
}
