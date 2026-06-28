"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, Loader2, Search, Download, CheckSquare, Square, UserPlus } from "lucide-react";
import { adminAddCustomerRecord, adminUpdateCustomer, adminDeleteCustomer } from "@/lib/actions";

function emptyForm() {
  return { name: "", sector: "", note: "", sort_order: "" };
}

function csvExport(rows) {
  const header = "Name,Sector,Note,Sort Order";
  const lines = rows.map((c) => [
    `"${(c.name || "").replace(/"/g, '""')}"`,
    `"${(c.sector || "").replace(/"/g, '""')}"`,
    `"${(c.note || "").replace(/"/g, '""')}"`,
    c.sort_order ?? 0,
  ].join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "customers.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function CustomersTab({ customers: initial, setCustomers }) {
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, sector: c.sector || "", note: c.note || "", sort_order: String(c.sort_order ?? "") });
    setNotice("");
  };
  const resetForm = () => { setEditingId(null); setForm(emptyForm()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setNotice("Customer name is required."); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      sector: form.sector.trim() || null,
      note: form.note.trim() || null,
      sort_order: form.sort_order !== "" ? Number(form.sort_order) : 0,
    };

    let ok;
    if (editingId) {
      ok = await adminUpdateCustomer(editingId, payload);
      if (ok) setCustomers((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c)));
    } else {
      ok = await adminAddCustomerRecord(payload);
      if (ok) {
        setCustomers((prev) => [{ id: `temp-${Date.now()}`, ...payload, created_at: new Date().toISOString() }, ...prev]);
      }
    }
    setSaving(false);
    if (ok) { setNotice(editingId ? "Customer updated." : "Customer added."); resetForm(); }
    else setNotice("Could not save — try again.");
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const ok = await adminDeleteCustomer(id);
    if (ok) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      if (editingId === id) resetForm();
    }
  };

  const bulkDelete = async () => {
    if (!selected.size || !window.confirm(`Delete ${selected.size} customer(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => adminDeleteCustomer(id)));
    setCustomers((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const toggleSelect = (id) => setSelected((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const filtered = initial.filter((c) => !query || [c.name, c.sector, c.note].some((v) => (v || "").toLowerCase().includes(query.toLowerCase())));
  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((c) => c.id)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <form onSubmit={save} className="lg:col-span-1 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus size={15} className="text-amber-600" />
          <h3 className="text-slate-900 font-semibold">{editingId ? "Edit Customer" : "Add Customer"}</h3>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Name *</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Sector</span>
          <input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Banking, Hospitality, Telecom…" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Note</span>
          <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Key project or relationship note…" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
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
        <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] uppercase text-slate-500 tracking-wider">{initial.length} customers</span>
            {selected.size > 0 && (
              <button onClick={bulkDelete} disabled={bulkDeleting} type="button" className="flex items-center gap-1 px-2 py-1 border border-red-300 text-red-500 font-mono text-[10px] uppercase hover:border-red-500 transition-colors">
                {bulkDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete {selected.size}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => csvExport(initial)} type="button" className="flex items-center gap-1.5 border border-slate-300 text-slate-500 font-mono text-[10px] uppercase px-2.5 py-1.5 hover:border-amber-500 hover:text-amber-600 transition-colors">
              <Download size={12} /> Export CSV
            </button>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-44 bg-white border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-1.5 text-xs font-mono text-slate-700" />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-slate-400 font-mono text-sm text-center py-12">{query ? "No results." : "No customers yet."}</p>
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
            <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-200">
              {filtered.map((c) => (
                <div key={c.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${selected.has(c.id) ? "bg-amber-50" : "hover:bg-white"}`}>
                  <button type="button" onClick={() => toggleSelect(c.id)} aria-label={`Select ${c.name}`} className="text-slate-400 hover:text-amber-600 flex-shrink-0">
                    {selected.has(c.id) ? <CheckSquare size={15} className="text-amber-500" /> : <Square size={15} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm font-medium">{c.name}</p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {c.sector || "—"}{c.note ? ` · ${c.note}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(c)} aria-label={`Edit ${c.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(c.id, c.name)} aria-label={`Delete ${c.name}`} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400 transition-colors">
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
