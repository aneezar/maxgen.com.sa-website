"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Lock, Pencil, Trash2, Save, PackagePlus, Inbox, ClipboardList, ImageOff, UserPlus,
  Building2, Briefcase, Search, Loader2, CheckCircle2, Upload, FileText, BarChart3,
} from "lucide-react";
import { ProductImg, StatusDot } from "./UI";
import { CATEGORIES, fmt } from "@/lib/constants";
import { validateAndResizeImage } from "@/lib/imageUtils";
import {
  adminSaveProduct, adminDeleteProduct,
  adminSaveService, adminDeleteService,
  adminSaveContent,
} from "@/lib/actions";
import QuoteAdminPanel from "./QuoteAdminPanel";
import AnalyticsTab from "./AnalyticsTab";

const ADMIN_PIN = "4490"; // change this before publishing

function emptyProduct() {
  return { id: "", cat: CATEGORIES[0].id, name: "", spec: "", price: "", stock: "", status: "active", image: "" };
}

const DIVISIONS = ["Enterprise Networking", "Low Current Systems", "ELV (Extra Low Voltage)", "Telecom Division", "MEP Division"];

function emptyService() {
  return { division: DIVISIONS[0], slug: "", category: "", title: "", description: "", detail: "", image: "" };
}

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function ImageUploadField({ value, onChange, label }) {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [processing, setProcessing] = useState(false);
  const inputId = useMemo(() => `img-upload-${Math.random().toString(36).slice(2)}`, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setInfo("");
    setProcessing(true);
    try {
      const result = await validateAndResizeImage(file);
      onChange(result.dataUrl);
      setInfo(`Resized to ${result.width}×${result.height}px, ${Math.round(result.bytes / 1024)}KB`);
    } catch (err) {
      setError(err.message || "Could not process that image — try again.");
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  };

  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase text-slate-500">{label || "Image"}</span>
      <div className="flex gap-2 mt-1">
        <input
          value={value && value.startsWith("data:") ? "" : value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={value && value.startsWith("data:") ? "Uploaded image in use — paste a URL to replace it" : "https://example.com/photo.jpg"}
          className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono"
        />
        <label htmlFor={inputId} className={`flex items-center gap-1.5 border px-3 py-2 text-xs font-mono uppercase whitespace-nowrap cursor-pointer ${processing ? "border-slate-200 text-slate-300 cursor-wait" : "border-slate-300 hover:border-amber-500 text-slate-500"}`}>
          {processing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {processing ? "Processing…" : "Upload"}
        </label>
        <input id={inputId} type="file" accept="image/*" onChange={handleFile} disabled={processing} className="hidden" />
      </div>
      {error && <p className="text-red-500 text-xs font-mono mt-1">{error}</p>}
      {info && !error && <p className="text-emerald-600 text-xs font-mono mt-1">{info}</p>}
      <div className="mt-2"><ProductImg src={value} alt="Preview" className="w-full h-28" /></div>
    </label>
  );
}

export default function AdminClient({ initialProducts, initialServices, initialContent, initialOrders, initialLeads, initialMessages, initialApplications, initialQuotes, initialCustomers = [], initialPartners = [] }) {
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

  return (
    <section className="max-w-6xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Catalog & Orders</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "quotes", label: `Quotes${quotes.filter(q => q.status === "pending").length > 0 ? ` (${quotes.filter(q => q.status === "pending").length} new)` : ""}`, icon: FileText },
            { id: "products", label: "Products", icon: PackagePlus },
            { id: "verticals", label: "Verticals", icon: Building2 },
            { id: "content", label: "Content", icon: Pencil },
            { id: "orders", label: "Orders", icon: ClipboardList },
            { id: "leads", label: "Leads", icon: UserPlus },
            { id: "messages", label: "Messages", icon: Inbox },
            { id: "applications", label: "Applications", icon: Briefcase },
          ].map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 font-mono text-xs uppercase tracking-wider border ${tab === t.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"}`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "analytics" && <AnalyticsTab products={products} customers={customers} partners={partners} />}
      {tab === "quotes" && <QuoteAdminPanel quotes={quotes} setQuotes={setQuotes} />}
      {tab === "products" && (
        <ProductsTab products={products} setProducts={setProducts} />
      )}
      {tab === "verticals" && (
        <VerticalsTab services={services} setServices={setServices} />
      )}
      {tab === "content" && (
        <ContentTab contentForm={contentForm} setContentForm={setContentForm} />
      )}
      {tab === "orders" && <OrdersTab orders={orders} />}
      {tab === "leads" && <LeadsTab leads={leads} />}
      {tab === "messages" && <MessagesTab messages={messages} />}
      {tab === "applications" && <ApplicationsTab applications={applications} />}
    </section>
  );
}

// ---------------------------------------------------------------------------
// PRODUCTS TAB
// ---------------------------------------------------------------------------
function ProductsTab({ products, setProducts }) {
  const [form, setForm] = useState(emptyProduct());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(50);

  const startEdit = (p) => { setEditingId(p.id); setForm({ ...p, price: String(p.price), stock: String(p.stock) }); setNotice(""); };
  const resetForm = () => { setEditingId(null); setForm(emptyProduct()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.id || !form.name || !form.price || !form.stock) { setNotice("SKU, name, price, and stock are required."); return; }
    setSaving(true);
    const record = { id: form.id.trim(), cat: form.cat, name: form.name.trim(), spec: form.spec.trim(), price: Number(form.price), stock: Number(form.stock), status: form.status, image: (form.image || "").trim() };
    if (!editingId && products.some((p) => p.id === record.id)) {
      setSaving(false); setNotice("A product with this SKU already exists."); return;
    }
    const ok = await adminSaveProduct(record);
    setSaving(false);
    if (ok) {
      setProducts((prev) => editingId ? prev.map((p) => (p.id === editingId ? record : p)) : [...prev, record]);
      setNotice(editingId ? "Product updated." : "Product added.");
      resetForm();
    } else setNotice("Could not save — try again.");
  };

  const remove = async (id) => {
    const ok = await adminDeleteProduct(id);
    if (ok) { setProducts((prev) => prev.filter((p) => p.id !== id)); if (editingId === id) resetForm(); }
  };

  const filtered = products.filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={save} className="lg:col-span-1 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <h3 className="text-slate-900 font-semibold mb-1">{editingId ? `Edit ${editingId}` : "Add Product"}</h3>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">SKU</span>
          <input value={form.id} disabled={!!editingId} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="MG-XX-0000" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono disabled:opacity-50" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Category</span>
          <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Item Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Spec / Description</span>
          <input value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Product Image" />
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Price (SAR)</span>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
          </label>
          <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Stock (units)</span>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
          </label>
        </div>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Status</span>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            <option value="active">In stock</option>
            <option value="low">Low stock</option>
          </select>
        </label>
        {notice && <p className="text-amber-600 text-xs font-mono">{notice}</p>}
        <div className="flex gap-2 pt-1">
          <button disabled={saving} className="flex-1 bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="border border-slate-300 text-slate-500 font-mono uppercase text-xs px-3">Cancel</button>}
        </div>
      </form>

      <div className="lg:col-span-2 border border-slate-200 bg-slate-50">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="font-mono text-[11px] uppercase text-slate-500 tracking-wider">{products.length.toLocaleString()} products in catalog</span>
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setVisible(50); }} placeholder="Search SKU or name" className="w-full bg-white border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-1.5 text-xs font-mono text-slate-700" />
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {filtered.slice(0, visible).map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <ProductImg src={p.image} alt={p.name} className="w-12 h-12 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-slate-500">{p.id}</span><StatusDot status={p.status} /></div>
                <p className="text-slate-900 text-sm font-medium truncate">{p.name}</p>
                <p className="font-mono text-[11px] text-slate-500">{fmt(p.price)} · {p.stock} units</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500"><Pencil size={14} /></button>
                <button onClick={() => remove(p.id)} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        {visible < filtered.length && (
          <button onClick={() => setVisible((v) => v + 50)} className="w-full border-t border-slate-200 py-2.5 text-center font-mono text-[11px] uppercase text-amber-600 hover:bg-white">Load 50 More</button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VERTICALS TAB
// ---------------------------------------------------------------------------
function VerticalsTab({ services, setServices }) {
  const [form, setForm] = useState(emptyService());
  const [editingSlug, setEditingSlug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const startEdit = (s) => { setEditingSlug(s.slug); setForm({ ...s }); setNotice(""); };
  const resetForm = () => { setEditingSlug(null); setForm(emptyService()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { setNotice("Title and short description are required."); return; }
    setSaving(true);
    const slug = (editingSlug || form.slug || slugify(form.title));
    const record = { slug, division: form.division, category: (form.category || "").trim() || null, title: form.title.trim(), description: form.description.trim(), detail: (form.detail || "").trim(), image: (form.image || "").trim() };
    if (!editingSlug && services.some((s) => s.slug === slug)) {
      setSaving(false); setNotice("A service with this slug already exists."); return;
    }
    const ok = await adminSaveService(record);
    setSaving(false);
    if (ok) {
      setServices((prev) => editingSlug ? prev.map((s) => (s.slug === editingSlug ? record : s)) : [...prev, record]);
      setNotice(editingSlug ? "Service updated." : "Service added.");
      resetForm();
    } else setNotice("Could not save — try again.");
  };

  const remove = async (slug) => {
    const ok = await adminDeleteService(slug);
    if (ok) { setServices((prev) => prev.filter((s) => s.slug !== slug)); if (editingSlug === slug) resetForm(); }
  };

  const grouped = DIVISIONS.map((d) => ({ division: d, items: services.filter((s) => s.division === d) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={save} className="lg:col-span-1 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <h3 className="text-slate-900 font-semibold mb-1">{editingSlug ? "Edit Service" : "Add Service"}</h3>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Division / Vertical</span>
          <select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Title</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Slug {editingSlug ? "(locked)" : "(auto-generated if blank)"}</span>
          <input value={form.slug} disabled={!!editingSlug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono disabled:opacity-50" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Category Tag (optional)</span>
          <input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="ELV / Life Safety Systems" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Short Description</span>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Full Description</span>
          <textarea rows={5} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>
        <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Service Image" />
        {notice && <p className="text-amber-600 text-xs font-mono">{notice}</p>}
        <div className="flex gap-2 pt-1">
          <button disabled={saving} className="flex-1 bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editingSlug ? "Update" : "Add"}
          </button>
          {editingSlug && <button type="button" onClick={resetForm} className="border border-slate-300 text-slate-500 font-mono uppercase text-xs px-3">Cancel</button>}
        </div>
      </form>

      <div className="lg:col-span-2 space-y-6">
        {grouped.map((div) => (
          <div key={div.division} className="border border-slate-200 bg-slate-50">
            <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">{div.division} · {div.items.length} services</div>
            <div className="divide-y divide-slate-200">
              {div.items.map((s) => (
                <div key={s.slug} className="flex items-center justify-between px-4 py-3 gap-3">
                  <ProductImg src={s.image} alt={s.title} className="w-12 h-12 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm font-medium truncate">{s.title}</p>
                    <p className="font-mono text-[11px] text-slate-500 truncate">{s.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(s)} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500"><Pencil size={14} /></button>
                    <button onClick={() => remove(s.slug)} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {div.items.length === 0 && <p className="text-slate-400 font-mono text-xs text-center py-6">No services in this division yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONTENT TAB
// ---------------------------------------------------------------------------
function ContentTab({ contentForm, setContentForm }) {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await adminSaveContent(contentForm);
    setSaving(false);
    setNotice(ok ? "Content saved." : "Could not save — try again.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <div className="border border-slate-200 bg-slate-50 px-5 py-5 space-y-3">
        <h3 className="text-slate-900 font-semibold">Home Page</h3>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Eyebrow tag</span>
          <input value={contentForm.heroTag || ""} onChange={(e) => setContentForm({ ...contentForm, heroTag: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Headline</span>
          <textarea rows={2} value={contentForm.heroTitle || ""} onChange={(e) => setContentForm({ ...contentForm, heroTitle: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Subtext</span>
          <textarea rows={3} value={contentForm.heroBody || ""} onChange={(e) => setContentForm({ ...contentForm, heroBody: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>
      </div>

      <div className="border border-slate-200 bg-slate-50 px-5 py-5 space-y-3">
        <h3 className="text-slate-900 font-semibold">About Page</h3>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Title</span>
          <input value={contentForm.aboutTitle || ""} onChange={(e) => setContentForm({ ...contentForm, aboutTitle: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Body (blank line = new paragraph)</span>
          <textarea rows={6} value={contentForm.aboutBody || ""} onChange={(e) => setContentForm({ ...contentForm, aboutBody: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">SKUs stat</span>
            <input value={contentForm.statSkus || ""} onChange={(e) => setContentForm({ ...contentForm, statSkus: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          </label>
          <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Years stat</span>
            <input value={contentForm.statYears || ""} onChange={(e) => setContentForm({ ...contentForm, statYears: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          </label>
          <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Dispatch stat</span>
            <input value={contentForm.statDispatch || ""} onChange={(e) => setContentForm({ ...contentForm, statDispatch: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          </label>
        </div>
      </div>

      <div className="border border-slate-200 bg-slate-50 px-5 py-5 space-y-3">
        <h3 className="text-slate-900 font-semibold">Contact Details</h3>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Address</span>
          <input value={contentForm.contactAddress || ""} onChange={(e) => setContentForm({ ...contentForm, contactAddress: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Phone</span>
            <input value={contentForm.contactPhone || ""} onChange={(e) => setContentForm({ ...contentForm, contactPhone: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          </label>
          <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">Email</span>
            <input value={contentForm.contactEmail || ""} onChange={(e) => setContentForm({ ...contentForm, contactEmail: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          </label>
        </div>
      </div>

      <div className="border border-slate-200 bg-slate-50 px-5 py-5 space-y-3">
        <h3 className="text-slate-900 font-semibold">Global Branches</h3>
        <label className="block"><span className="font-mono text-[10px] uppercase text-slate-500">One branch per line: Country | Address | Phone</span>
          <textarea rows={6} value={contentForm.branches || ""} onChange={(e) => setContentForm({ ...contentForm, branches: e.target.value })} placeholder="India | Kollam, Kerala | +91 00000 00000" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono resize-none" />
        </label>
      </div>

      {notice && <p className="text-amber-600 text-xs font-mono">{notice}</p>}
      <button disabled={saving} className="bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider px-5 py-2.5 flex items-center gap-1.5">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Content
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// SIMPLE LOG VIEWERS
// ---------------------------------------------------------------------------
function OrdersTab({ orders }) {
  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">{orders.length} orders logged</div>
      {orders.length === 0 ? <p className="text-slate-400 font-mono text-sm text-center py-12">No orders yet.</p> : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {orders.map((o) => (
            <div key={o.id} className="px-4 py-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-mono text-amber-600 text-sm">{o.id}</span>
                <span className="font-mono text-[11px] text-slate-500">{new Date(o.placed_at).toLocaleString()}</span>
              </div>
              <ul className="text-slate-500 text-sm space-y-0.5 mb-2">
                {(o.items || []).map((it, idx) => <li key={idx}>{it.qty}× {it.name} <span className="text-slate-400">({fmt(it.price)})</span></li>)}
              </ul>
              <p className="font-mono text-slate-700 text-sm">Total: {fmt(o.grand_total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeadsTab({ leads }) {
  const exportCsv = () => {
    const rows = [["email", "phone", "capturedAt"], ...leads.map((l) => [l.email || "", l.phone || "", l.captured_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "maxgen-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider flex justify-between">
        <span>{leads.length} leads captured</span>
        <button onClick={exportCsv} className="text-amber-600">Export CSV</button>
      </div>
      {leads.length === 0 ? <p className="text-slate-400 font-mono text-sm text-center py-12">No leads yet.</p> : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {leads.map((l, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3">
              <div>{l.email && <p className="text-slate-900 text-sm font-medium">{l.email}</p>}{l.phone && <p className="font-mono text-[12px] text-slate-500">{l.phone}</p>}</div>
              <span className="font-mono text-[11px] text-slate-500">{new Date(l.captured_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesTab({ messages }) {
  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">{messages.length} messages received</div>
      {messages.length === 0 ? <p className="text-slate-400 font-mono text-sm text-center py-12">No messages yet.</p> : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {messages.map((m, idx) => (
            <div key={idx} className="px-4 py-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-900 text-sm font-medium">{m.name} · {m.phone}</span>
                <span className="font-mono text-[11px] text-slate-500">{new Date(m.submitted_at).toLocaleString()}</span>
              </div>
              {m.email && <p className="font-mono text-[11px] text-slate-500 mb-1">{m.email}</p>}
              <p className="text-slate-500 text-sm">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationsTab({ applications }) {
  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">{applications.length} applications received</div>
      {applications.length === 0 ? <p className="text-slate-400 font-mono text-sm text-center py-12">No applications yet.</p> : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {applications.map((a, idx) => (
            <div key={idx} className="px-4 py-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-900 text-sm font-medium">{a.name}</span>
                <span className="font-mono text-[11px] text-slate-500">{new Date(a.applied_at).toLocaleString()}</span>
              </div>
              <p className="font-mono text-amber-600 text-xs mb-1">{a.role}</p>
              <p className="text-slate-500 text-sm">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
