"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, Loader2 } from "lucide-react";
import { ProductImg } from "@/components/UI";
import { adminSaveService, adminDeleteService } from "@/lib/actions";
import ImageUploadField from "./ImageUploadField";

const DIVISIONS = ["Enterprise Networking", "Low Current Systems", "ELV (Extra Low Voltage)", "Telecom Division", "MEP Division"];

function emptyService() {
  return { division: DIVISIONS[0], slug: "", category: "", title: "", description: "", detail: "", image: "" };
}

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function VerticalsTab({ services, setServices }) {
  const [form, setForm] = useState(emptyService());
  const [editingSlug, setEditingSlug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const startEdit = (s) => { setEditingSlug(s.slug); setForm({ ...s }); setNotice(""); };
  const resetForm = () => { setEditingSlug(null); setForm(emptyService()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setNotice("Title and short description are required."); return;
    }
    setSaving(true);
    const slug = editingSlug || form.slug || slugify(form.title);
    const record = {
      slug,
      division: form.division,
      category: (form.category || "").trim() || null,
      title: form.title.trim(),
      description: form.description.trim(),
      detail: (form.detail || "").trim(),
      image: (form.image || "").trim(),
    };
    if (!editingSlug && services.some((s) => s.slug === slug)) {
      setSaving(false); setNotice("A service with this slug already exists."); return;
    }
    const ok = await adminSaveService(record);
    setSaving(false);
    if (ok) {
      setServices((prev) => editingSlug ? prev.map((s) => (s.slug === editingSlug ? record : s)) : [...prev, record]);
      setNotice(editingSlug ? "Service updated." : "Service added.");
      resetForm();
    } else {
      setNotice("Could not save — try again.");
    }
  };

  const remove = async (slug, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const ok = await adminDeleteService(slug);
    if (ok) {
      setServices((prev) => prev.filter((s) => s.slug !== slug));
      if (editingSlug === slug) resetForm();
    }
  };

  const grouped = DIVISIONS.map((d) => ({ division: d, items: services.filter((s) => s.division === d) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={save} className="lg:col-span-1 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <h3 className="text-slate-900 font-semibold mb-1">{editingSlug ? "Edit Service" : "Add Service"}</h3>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Division / Vertical</span>
          <select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Title</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Slug {editingSlug ? "(locked)" : "(auto-generated if blank)"}</span>
          <input value={form.slug} disabled={!!editingSlug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono disabled:opacity-50" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Category Tag (optional)</span>
          <input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="ELV / Life Safety Systems" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Short Description</span>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Full Description</span>
          <textarea rows={5} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>

        <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Service Image" />

        {notice && <p className="text-amber-600 text-xs font-mono">{notice}</p>}

        <div className="flex gap-2 pt-1">
          <button disabled={saving} className="flex-1 bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editingSlug ? "Update" : "Add"}
          </button>
          {editingSlug && (
            <button type="button" onClick={resetForm} className="border border-slate-300 text-slate-500 font-mono uppercase text-xs px-3">Cancel</button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 space-y-6">
        {grouped.map((div) => (
          <div key={div.division} className="border border-slate-200 bg-slate-50">
            <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">
              {div.division} · {div.items.length} services
            </div>
            <div className="divide-y divide-slate-200">
              {div.items.map((s) => (
                <div key={s.slug} className="flex items-center justify-between px-4 py-3 gap-3">
                  <ProductImg src={s.image} alt={s.title} className="w-12 h-12 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm font-medium truncate">{s.title}</p>
                    <p className="font-mono text-[11px] text-slate-500 truncate">{s.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(s)} aria-label={`Edit ${s.title}`} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500"><Pencil size={14} /></button>
                    <button onClick={() => remove(s.slug, s.title)} aria-label={`Delete ${s.title}`} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {div.items.length === 0 && (
                <p className="text-slate-400 font-mono text-xs text-center py-6">No services in this division yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
