"use client";

import { useState } from "react";
import {
  BarChart3, FileText, PackagePlus, Building2, Pencil,
  ClipboardList, UserPlus, Inbox, Briefcase, Users, Handshake,
  Newspaper, TrendingUp, Sparkles,
} from "lucide-react";
import QuoteAdminPanel from "./QuoteAdminPanel";
import AnalyticsTab from "./AnalyticsTab";
import ProductsTab from "./admin/ProductsTab";
import VerticalsTab from "./admin/VerticalsTab";
import ContentTab from "./admin/ContentTab";
import OrdersTab from "./admin/OrdersTab";
import LeadsTab from "./admin/LeadsTab";
import MessagesTab from "./admin/MessagesTab";
import ApplicationsTab from "./admin/ApplicationsTab";
import CustomersTab from "./admin/CustomersTab";
import PartnersTab from "./admin/PartnersTab";
import BlogTab from "./admin/BlogTab";
import CareersAdminTab from "./admin/CareersAdminTab";
import MarketingTab from "./admin/MarketingTab";
import AITab from "./admin/AITab";

export default function AdminClient({
  initialProducts, initialServices, initialContent,
  initialOrders, initialLeads, initialMessages, initialApplications,
  initialQuotes, initialCustomers = [], initialPartners = [],
  initialPosts = [], initialJobs = [], hasAI = false,
}) {
  const [tab, setTab] = useState("analytics");

  const [products, setProducts] = useState(initialProducts);
  const [services, setServices] = useState(initialServices);
  const [contentForm, setContentForm] = useState(initialContent);
  const [orders] = useState(initialOrders);
  const [leads] = useState(initialLeads);
  const [messages] = useState(initialMessages);
  const [applications] = useState(initialApplications);
  const [quotes, setQuotes] = useState(initialQuotes || []);
  const [customers, setCustomers] = useState(initialCustomers);
  const [partners, setPartners] = useState(initialPartners);
  const [posts, setPosts] = useState(initialPosts);
  const [jobs, setJobs] = useState(initialJobs);

  const pendingQuotes = quotes.filter((q) => q.status === "pending").length;

  const TABS = [
    { id: "analytics",    label: "Analytics",    icon: BarChart3 },
    { id: "quotes",       label: pendingQuotes > 0 ? `Quotes (${pendingQuotes} new)` : "Quotes", icon: FileText },
    { id: "products",     label: "Products",     icon: PackagePlus },
    { id: "verticals",    label: "Verticals",    icon: Building2 },
    { id: "content",      label: "Content",      icon: Pencil },
    { id: "orders",       label: "Orders",       icon: ClipboardList },
    { id: "customers",    label: "Customers",    icon: Users },
    { id: "partners",     label: "Partners",     icon: Handshake },
    { id: "blog",         label: "Blog",         icon: Newspaper },
    { id: "careers",      label: "Careers",      icon: Briefcase },
    { id: "marketing",    label: "Marketing",    icon: TrendingUp },
    { id: "ai",           label: "AI Tools",     icon: Sparkles },
    { id: "leads",        label: "Leads",        icon: UserPlus },
    { id: "messages",     label: "Messages",     icon: Inbox },
    { id: "applications", label: "Applications", icon: Briefcase },
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Catalog &amp; Orders</h1>
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
      {tab === "customers"    && <CustomersTab customers={customers} setCustomers={setCustomers} />}
      {tab === "partners"     && <PartnersTab partners={partners} setPartners={setPartners} />}
      {tab === "blog"         && <BlogTab posts={posts} setPosts={setPosts} />}
      {tab === "careers"      && <CareersAdminTab jobs={jobs} setJobs={setJobs} />}
      {tab === "marketing"    && <MarketingTab posts={posts} jobs={jobs} leads={leads} quotes={quotes} messages={messages} />}
      {tab === "leads"        && <LeadsTab leads={leads} />}
      {tab === "messages"     && <MessagesTab messages={messages} />}
      {tab === "applications" && <ApplicationsTab applications={applications} />}
      {tab === "ai"           && <AITab products={products} hasAI={hasAI} />}
    </section>
  );
}
