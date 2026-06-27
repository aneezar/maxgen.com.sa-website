"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, Search, Loader2 } from "lucide-react";
import { ProductImg, StatusDot } from "@/components/UI";
import { CATEGORIES, fmt } from "@/lib/constants";
import { adminSaveProduct, adminDeleteProduct } from "@/lib/actions";
import ImageUploadField from "./ImageUploadField";

function emptyProduct() {
  return { id: "", cat: CATEGORIES[0].id, name: "", spec: "", price: "", stock: "", status: "active", image: "" };
}

export default function ProductsTab({ products, setProducts }) {
  const [form, setForm] = useState(emptyProduct());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(50);

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ ...p, price: String(p.price), stock: String(p.stock) });
    setNotice("");
  };
  const resetForm = () => { setEditingId(null); setForm(emptyProduct()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    const name  = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.id.trim())                    { setNotice("SKU is required."); return; }
    if (name.length < 2)                    { setNotice("Product name must be at least 2 characters."); return; }
    if (form.price === "")                  { setNotice("Price is required."); return; }
    if (price < 0 || price > 1_000_000)    { setNotice("Price must be between 0 and 1,000,000."); return; }
    if (form.stock === "")                  { setNotice("Stock is required."); return; }
    if (stock < 0)                          { setNotice("Stock cannot be negative."); return; }
    if (form.image?.startsWith("data:") && form.image.length > 400_000) {
      setNotice("Image is too large. Please upload a smaller image."); return;
    }

    setSaving(true);
    const record = {
      id: form.id.trim(),
      cat: form.cat,
      name,
      spec: form.spec.trim(),
      price,
      stock,
      status: form.status,
      image: (form.image || "").trim(),
    };

    if (!editingId && products.some((p) => p.id === record.id)) {
      setSaving(false); setNotice("A product with this SKU already exists."); return;
    }

    const ok = await adminSaveProduct(record);
    setSaving(false);
    if (ok) {
      setProducts((prev) => editingId ? prev.map((p) => (p.id === editingId ? record : p)) : [...prev, record]);
      setNotice(editingId ? "Product updated." : "Product added.");
      resetForm();
    } else {
      setNotice("Could not save — try again.");
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}" (${id})? This cannot be undone.`)) return;
    const ok = await adminDeleteProduct(id);
    if (ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const filtered = products.filter(
    (p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={save} className="lg:col-span-1 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <h3 className="text-slate-900 font-semibold mb-1">{editingId ? `Edit ${editingId}` : "Add Product"}</h3>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">SKU</span>
          <input value={form.id} disabled={!!editingId} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="MG-XX-0000" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono disabled:opacity-50" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Category</span>
          <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Item Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Spec / Description</span>
          <input value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Product Image" />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Price (SAR)</span>
            <input type="number" min="0" max="1000000" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Stock (units)</span>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
          </label>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Status</span>
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
          {editingId && (
            <button type="button" onClick={resetForm} className="border border-slate-300 text-slate-500 font-mono uppercase text-xs px-3">Cancel</button>
          )}
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{p.id}</span>
                  <StatusDot status={p.status} />
                </div>
                <p className="text-slate-900 text-sm font-medium truncate">{p.name}</p>
                <p className="font-mono text-[11px] text-slate-500">{fmt(p.price)} · {p.stock} units</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500"><Pencil size={14} /></button>
                <button onClick={() => remove(p.id, p.name)} aria-label={`Delete ${p.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400"><Trash2 size={14} /></button>
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
