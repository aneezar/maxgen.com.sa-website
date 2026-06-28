"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, Loader2, Search, Download, CheckSquare, Square, Handshake } from "lucide-react";
import { adminAddPartnerRecord, adminUpdatePartner, adminDeletePartner } from "@/lib/actions";

const PARTNER_TYPES = ["Technology Partner", "Manufacturing Partner", "Distribution Partner", "Consulting Partner"];

function emptyForm() {
  return { name: "", type: PARTNER_TYPES[0], focus: "", sort_order: "" };
}

function csvExport(rows) {
  const header = "Name,Type,Focus,Sort Order";
  const lines = rows.map((p) => [
    `"${(p.name || "").replace(/"/g, '""')}"`,
    `"${(p.type || "").replace(/"/g, '""')}"`,
    `"${(p.focus || "").replace(/"/g, '""')}"`,
    p.sort_order ?? 0,
  ].join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "partners.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function PartnersTab({ partners: initial, setPartners }) {
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, type: p.type || PARTNER_TYPES[0], focus: p.focus || "", sort_order: String(p.sort_order ?? "") });
    setNotice("");
  };
  const resetForm = () => { setEditingId(null); setForm(emptyForm()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setNotice("Partner name is required."); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      type: form.type,
      focus: form.focus.trim() || null,
      sort_order: form.sort_order !== "" ? Number(form.sort_order) : 0,
    };

    let ok;
    if (editingId) {
      ok = await adminUpdatePartner(editingId, payload);
      if (ok) setPartners((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p)));
    } else {
      ok = await adminAddPartnerRecord(payload);
      if (ok) setPartners((prev) => [{ id: `temp-${Date.now()}`, ...payload, created_at: new Date().toISOString() }, ...prev]);
    }
    setSaving(false);
    if (ok) { setNotice(editingId ? "Partner updated." : "Partner added."); resetForm(); }
    else setNotice("Could not save — try again.");
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const ok = await adminDeletePartner(id);
    if (ok) {
      setPartners((prev) => prev.filter((p) => p.id !== id));
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      if (editingId === id) resetForm();
    }
  };

  const bulkDelete = async () => {
    if (!selected.size || !window.confirm(`Delete ${selected.size} partner(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => adminDeletePartner(id)));
    setPartners((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const toggleSelect = (id) => setSelected((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const filtered = initial
    .filter((p) => filterType === "all" || p.type === filterType)
    .filter((p) => !query || [p.name, p.type, p.focus].some((v) => (v || "").toLowerCase().includes(query.toLowerCase())));

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((p) => p.id)));

  const typeCounts = PARTNER_TYPES.reduce((acc, t) => { acc[t] = initial.filter((p) => p.type === t).length; return acc; }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <form onSubmit={save} className="lg:col-span-1 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <div className="flex items-center gap-2 mb-1">
          <Handshake size={15} className="text-amber-600" />
          <h3 className="text-slate-900 font-semibold">{editingId ? "Edit Partner" : "Add Partner"}</h3>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Name *</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Partner Type</span>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Focus / Speciality</span>
          <textarea rows={2} value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} placeholder="CCTV & video surveillance hardware…" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Sort Order (lower = first)</span>
          <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="0" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
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

      {/* List */}
      <div className="lg:col-span-2 border border-slate-200 bg-slate-50">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase text-slate-500 tracking-wider">{initial.length} partners</span>
              {selected.size > 0 && (
                <button onClick={bulkDelete} disabled={bulkDeleting} type="button" className="flex items-center gap-1 px-2 py-1 border border-red-300 text-red-500 font-mono text-[10px] uppercase hover:border-red-500">
                  {bulkDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete {selected.size}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => csvExport(initial)} type="button" className="flex items-center gap-1.5 border border-slate-300 text-slate-500 font-mono text-[10px] uppercase px-2.5 py-1.5 hover:border-amber-500 hover:text-amber-600">
                <Download size={12} /> Export CSV
              </button>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-44 bg-white border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-1.5 text-xs font-mono text-slate-700" />
              </div>
            </div>
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5 flex-wrap">
            {[{ id: "all", label: `All (${initial.length})` }, ...PARTNER_TYPES.map((t) => ({ id: t, label: `${t.replace(" Partner", "")} (${typeCounts[t]})` }))].map((f) => (
              <button key={f.id} type="button" onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${filterType === f.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-slate-400 font-mono text-sm text-center py-12">{query || filterType !== "all" ? "No results." : "No partners yet."}</p>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <button type="button" onClick={toggleAll} aria-label="Select all" className="text-slate-400 hover:text-amber-600">
                {allSelected ? <CheckSquare size={15} className="text-amber-500" /> : <Square size={15} />}
              </button>
              <span className="font-mono text-[10px] text-slate-400 uppercase">
                {selected.size > 0 ? `${selected.size} selected` : "Select all"}
              </span>
            </div>
            <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-200">
              {filtered.map((p) => (
                <div key={p.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${selected.has(p.id) ? "bg-amber-50" : "hover:bg-white"}`}>
                  <button type="button" onClick={() => toggleSelect(p.id)} aria-label={`Select ${p.name}`} className="text-slate-400 hover:text-amber-600 flex-shrink-0">
                    {selected.has(p.id) ? <CheckSquare size={15} className="text-amber-500" /> : <Square size={15} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-slate-900 text-sm font-medium">{p.name}</p>
                      <span className="font-mono text-[9px] uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5">
                        {(p.type || "").replace(" Partner", "")}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 truncate">{p.focus || "—"}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(p.id, p.name)} aria-label={`Delete ${p.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
