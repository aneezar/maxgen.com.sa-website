"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2, Save, Search, Loader2, Download, Upload, CheckSquare, Square, Star, Plus, X, Tag } from "lucide-react";
import { ProductImg, StatusDot } from "@/components/UI";
import { CATEGORIES, fmt } from "@/lib/constants";
import { adminSaveProduct, adminDeleteProduct } from "@/lib/actions";
import ImageUploadField from "./ImageUploadField";

function emptyProduct() {
  return {
    id: "", cat: CATEGORIES[0].id, name: "", spec: "", price: "", stock: "",
    status: "active", image: "", brand: "", featured: false,
    applications: "", tags: "", images: [],
  };
}

// ---------- CSV helpers ----------
function csvExport(products) {
  const header = "id,cat,name,spec,price,stock,status,brand,featured,applications,tags";
  const lines = products.map((p) => [
    `"${String(p.id || "").replace(/"/g, '""')}"`,
    `"${String(p.cat || "").replace(/"/g, '""')}"`,
    `"${String(p.name || "").replace(/"/g, '""')}"`,
    `"${String(p.spec || "").replace(/"/g, '""')}"`,
    p.price ?? 0,
    p.stock ?? 0,
    `"${p.status || "active"}"`,
    `"${String(p.brand || "").replace(/"/g, '""')}"`,
    p.featured ? "true" : "false",
    `"${String(p.applications || "").replace(/"/g, '""')}"`,
    `"${(Array.isArray(p.tags) ? p.tags : []).join(";").replace(/"/g, '""')}"`,
  ].join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "products.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}

function parseCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) { result.push(cur); cur = ""; }
    else cur += ch;
  }
  result.push(cur);
  return result;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).filter(Boolean).map((line) => {
    const vals = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim(); });
    return obj;
  });
}

// ---------- Tags input ----------
function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };
  const remove = (t) => onChange(tags.filter((x) => x !== t));
  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-1.5">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded-sm">
            {t}
            <button type="button" onClick={() => remove(t)} aria-label={`Remove tag ${t}`} className="hover:text-red-500"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="type tag and press Enter"
          className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-1.5 text-xs font-mono text-slate-700"
        />
        <button type="button" onClick={add} className="border border-slate-300 px-2 text-slate-500 hover:border-amber-500 hover:text-amber-600">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

// ---------- Extra images ----------
function GalleryField({ images, onChange }) {
  const [url, setUrl] = useState("");
  const add = () => {
    const v = url.trim();
    if (v && !images.includes(v)) onChange([...images, v]);
    setUrl("");
  };
  return (
    <div className="space-y-1.5">
      {images.map((img, i) => (
        <div key={i} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="w-10 h-10 object-contain bg-slate-50 border border-slate-200 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="font-mono text-[10px] text-slate-500 truncate flex-1">{img}</span>
          <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500"><X size={13} /></button>
        </div>
      ))}
      <div className="flex gap-1.5">
        <input value={url} onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="https://… (additional image URL)"
          className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-1.5 text-xs font-mono text-slate-700"
        />
        <button type="button" onClick={add} className="border border-slate-300 px-2 text-slate-500 hover:border-amber-500 hover:text-amber-600">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default function ProductsTab({ products, setProducts }) {
  const [form, setForm] = useState(emptyProduct());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [visible, setVisible] = useState(50);
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const importRef = useRef(null);

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...p,
      price: String(p.price),
      stock: String(p.stock),
      brand: p.brand || "",
      featured: !!p.featured,
      applications: p.applications || "",
      tags: Array.isArray(p.tags) ? p.tags : [],
      images: Array.isArray(p.images) ? p.images : [],
    });
    setNotice("");
  };
  const resetForm = () => { setEditingId(null); setForm(emptyProduct()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.id.trim())                  { setNotice("SKU is required."); return; }
    if (name.length < 2)                  { setNotice("Name must be at least 2 characters."); return; }
    if (form.price === "")                { setNotice("Price is required."); return; }
    if (price < 0 || price > 1_000_000)  { setNotice("Price must be 0–1,000,000."); return; }
    if (form.stock === "")                { setNotice("Stock is required."); return; }
    if (stock < 0)                        { setNotice("Stock cannot be negative."); return; }
    if (form.image?.startsWith("data:") && form.image.length > 400_000) {
      setNotice("Image too large — upload a smaller image."); return;
    }

    if (!editingId && products.some((p) => p.id === form.id.trim())) {
      setNotice("A product with this SKU already exists."); return;
    }

    setSaving(true);
    const tags = Array.isArray(form.tags) ? form.tags : [];
    const record = {
      id: form.id.trim(),
      cat: form.cat,
      name,
      spec: (form.spec || "").trim(),
      price,
      stock,
      status: form.status,
      image: (form.image || "").trim(),
      brand: (form.brand || "").trim() || null,
      featured: !!form.featured,
      applications: (form.applications || "").trim() || null,
      tags,
      images: Array.isArray(form.images) ? form.images : [],
    };

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
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      if (editingId === id) resetForm();
    }
  };

  const bulkDelete = async () => {
    if (!selected.size || !window.confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => adminDeleteProduct(id)));
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const toggleSelect = (id) => setSelected((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportStatus("Parsing…");
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) { setImportStatus("No valid rows found."); return; }

    let imported = 0;
    let failed = 0;
    for (const row of rows) {
      if (!row.id || !row.name) { failed++; continue; }
      const record = {
        id: row.id,
        cat: row.cat || CATEGORIES[0].id,
        name: row.name,
        spec: row.spec || "",
        price: Number(row.price) || 0,
        stock: Number(row.stock) || 0,
        status: row.status || "active",
        brand: row.brand || null,
        featured: row.featured === "true",
        applications: row.applications || null,
        tags: row.tags ? row.tags.split(";").map((t) => t.trim()).filter(Boolean) : [],
        images: [],
        image: "",
      };
      const ok = await adminSaveProduct(record);
      if (ok) {
        setProducts((prev) => {
          const idx = prev.findIndex((p) => p.id === record.id);
          return idx >= 0 ? prev.map((p, i) => (i === idx ? record : p)) : [...prev, record];
        });
        imported++;
      } else {
        failed++;
      }
    }
    setImportStatus(`Done — ${imported} imported, ${failed} failed.`);
    setTimeout(() => setImportStatus(""), 5000);
  };

  const filtered = products
    .filter((p) => catFilter === "all" || p.cat === catFilter)
    .filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()) || (p.brand || "").toLowerCase().includes(query.toLowerCase()));

  const allVisibleSelected = filtered.length > 0 && filtered.slice(0, visible).every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allVisibleSelected ? new Set() : new Set(filtered.slice(0, visible).map((p) => p.id)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <form onSubmit={save} className="lg:col-span-1 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <h3 className="text-slate-900 font-semibold mb-1">{editingId ? `Edit ${editingId}` : "Add Product"}</h3>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">SKU *</span>
          <input value={form.id} disabled={!!editingId} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="MG-XX-0000" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono disabled:opacity-50" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Category</span>
          <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Item Name *</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Spec / Description</span>
          <input value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Brand</span>
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Legrand, Schneider, Panduit…" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-amber-500 w-4 h-4" />
          <span className="font-mono text-[11px] uppercase text-slate-600 flex items-center gap-1"><Star size={11} className="text-amber-500" /> Featured on homepage</span>
        </label>

        <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Primary Image" />

        <div>
          <span className="font-mono text-[10px] uppercase text-slate-500">Gallery Images (additional)</span>
          <div className="mt-1">
            <GalleryField images={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Price (SAR) *</span>
            <input type="number" min="0" max="1000000" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Stock (units) *</span>
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

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Applications</span>
          <textarea rows={2} value={form.applications} onChange={(e) => setForm({ ...form, applications: e.target.value })} placeholder="Commercial buildings, hospitals, data centres…" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>

        <div>
          <span className="font-mono text-[10px] uppercase text-slate-500 flex items-center gap-1"><Tag size={10} /> Tags</span>
          <div className="mt-1">
            <TagsInput tags={Array.isArray(form.tags) ? form.tags : []} onChange={(t) => setForm({ ...form, tags: t })} />
          </div>
        </div>

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

      {/* List */}
      <div className="lg:col-span-2 border border-slate-200 bg-slate-50">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] uppercase text-slate-500 tracking-wider">{products.length.toLocaleString()} products</span>
              {selected.size > 0 && (
                <button onClick={bulkDelete} disabled={bulkDeleting} type="button" className="flex items-center gap-1 px-2 py-1 border border-red-300 text-red-500 font-mono text-[10px] uppercase hover:border-red-500">
                  {bulkDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete {selected.size}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => csvExport(products)} type="button" className="flex items-center gap-1.5 border border-slate-300 text-slate-500 font-mono text-[10px] uppercase px-2.5 py-1.5 hover:border-amber-500 hover:text-amber-600">
                <Download size={12} /> Export CSV
              </button>
              <label className="flex items-center gap-1.5 border border-slate-300 text-slate-500 font-mono text-[10px] uppercase px-2.5 py-1.5 hover:border-amber-500 hover:text-amber-600 cursor-pointer">
                <Upload size={12} /> Import CSV
                <input ref={importRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => { setQuery(e.target.value); setVisible(50); }} placeholder="Search SKU, name, brand" className="w-44 bg-white border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-1.5 text-xs font-mono text-slate-700" />
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            {[{ id: "all", label: `All (${products.length})` }, ...CATEGORIES.map((c) => ({ id: c.id, label: `${c.label.split(" ")[0]} (${products.filter((p) => p.cat === c.id).length})` }))].map((f) => (
              <button key={f.id} type="button" onClick={() => { setCatFilter(f.id); setVisible(50); }}
                className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${catFilter === f.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {importStatus && <p className="font-mono text-[11px] text-amber-600">{importStatus}</p>}
        </div>

        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
          <button type="button" onClick={toggleAll} aria-label="Select all visible" className="text-slate-400 hover:text-amber-600">
            {allVisibleSelected ? <CheckSquare size={15} className="text-amber-500" /> : <Square size={15} />}
          </button>
          <span className="font-mono text-[10px] text-slate-400 uppercase">
            {selected.size > 0 ? `${selected.size} selected` : "Select all"}
          </span>
        </div>

        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {filtered.slice(0, visible).map((p) => (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${selected.has(p.id) ? "bg-amber-50" : "hover:bg-white"}`}>
              <button type="button" onClick={() => toggleSelect(p.id)} aria-label={`Select ${p.name}`} className="text-slate-400 hover:text-amber-600 flex-shrink-0">
                {selected.has(p.id) ? <CheckSquare size={15} className="text-amber-500" /> : <Square size={15} />}
              </button>
              <div className="w-16 h-12 flex-shrink-0 overflow-hidden bg-slate-50 border border-slate-100">
                <ProductImg src={p.image} alt={p.name} className="w-full h-full" objectFit="contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] text-slate-500">{p.id}</span>
                  <StatusDot status={p.status} />
                  {p.featured && <Star size={10} className="text-amber-500" aria-label="Featured" />}
                  {p.brand && <span className="font-mono text-[9px] uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5">{p.brand}</span>}
                </div>
                <p className="text-slate-900 text-sm font-medium truncate">{p.name}</p>
                <p className="font-mono text-[11px] text-slate-500">{fmt(p.price)} · {p.stock} units</p>
                {Array.isArray(p.tags) && p.tags.length > 0 && (
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {p.tags.map((t) => <span key={t} className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600"><Pencil size={14} /></button>
                <button onClick={() => remove(p.id, p.name)} aria-label={`Delete ${p.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-400 font-mono text-sm text-center py-12">{query || catFilter !== "all" ? "No results." : "No products yet."}</p>
          )}
        </div>
        {visible < filtered.length && (
          <button onClick={() => setVisible((v) => v + 50)} className="w-full border-t border-slate-200 py-2.5 text-center font-mono text-[11px] uppercase text-amber-600 hover:bg-white">
            Load 50 more ({filtered.length - visible} remaining)
          </button>
        )}
      </div>
    </div>
  );
}
