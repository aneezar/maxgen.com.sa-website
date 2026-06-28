"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, Loader2, Search, Download, ToggleLeft, ToggleRight } from "lucide-react";
import { adminSaveJob, adminDeleteJob } from "@/lib/actions";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const DEPARTMENTS = ["Engineering", "Sales", "Operations", "Marketing", "Finance", "HR", "Other"];
const STATUS_OPTIONS = ["active", "paused", "closed"];

function emptyJob() {
  return { title: "", location: "Riyadh, Saudi Arabia", type: "Full-time", department: "Engineering", description: "", requirements: "", status: "active", sort_order: 0 };
}

function csvExport(jobs) {
  const header = "Title,Department,Location,Type,Status,Sort Order";
  const lines = jobs.map((j) => [
    `"${(j.title || "").replace(/"/g, '""')}"`,
    `"${j.department || ""}"`,
    `"${j.location || ""}"`,
    `"${j.type || ""}"`,
    `"${j.status}"`,
    `"${j.sort_order || 0}"`,
  ].join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "jobs.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function CareersAdminTab({ jobs: initial, setJobs }) {
  const [form, setForm] = useState(emptyJob());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const startEdit = (j) => { setEditingId(j.id); setForm({ ...emptyJob(), ...j }); setNotice(""); };
  const resetForm = () => { setEditingId(null); setForm(emptyJob()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setNotice("Title is required."); return; }
    setSaving(true);
    const record = {
      ...(editingId && { id: editingId }),
      title: form.title.trim(),
      location: form.location.trim() || "Riyadh, Saudi Arabia",
      type: form.type,
      department: form.department,
      description: form.description.trim() || null,
      requirements: form.requirements.trim() || null,
      status: form.status,
      sort_order: parseInt(form.sort_order) || 0,
    };
    const ok = await adminSaveJob(record);
    setSaving(false);
    if (ok) {
      if (editingId) {
        setJobs((prev) => prev.map((j) => j.id === editingId ? { ...j, ...record } : j));
      } else {
        setJobs((prev) => [{ id: `temp-${Date.now()}`, ...record, created_at: new Date().toISOString() }, ...prev]);
      }
      setNotice(editingId ? "Job updated." : "Job added.");
      resetForm();
    } else {
      setNotice("Could not save — try again.");
    }
  };

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const ok = await adminDeleteJob(id);
    if (ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const toggleStatus = async (j) => {
    const next = j.status === "active" ? "paused" : "active";
    const ok = await adminSaveJob({ id: j.id, title: j.title, location: j.location, type: j.type, department: j.department, description: j.description, requirements: j.requirements, status: next, sort_order: j.sort_order });
    if (ok) setJobs((prev) => prev.map((x) => x.id === j.id ? { ...x, status: next } : x));
  };

  const filtered = initial
    .filter((j) => statusFilter === "all" || j.status === statusFilter)
    .filter((j) => !query || j.title.toLowerCase().includes(query.toLowerCase()) || (j.department || "").toLowerCase().includes(query.toLowerCase()));

  const counts = STATUS_OPTIONS.reduce((acc, s) => { acc[s] = initial.filter((j) => j.status === s).length; return acc; }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <form onSubmit={save} className="lg:col-span-2 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <h3 className="font-semibold text-slate-900 mb-1">{editingId ? "Edit Job" : "New Job Listing"}</h3>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Job Title *</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Department</span>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Location</span>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Description</span>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Requirements</span>
          <textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Sort Order</span>
            <input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
          </label>
        </div>

        {notice && <p className="text-amber-600 text-xs font-mono">{notice}</p>}

        <div className="flex gap-2 pt-1">
          <button disabled={saving} className="flex-1 bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editingId ? "Update" : "Add Role"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="border border-slate-300 text-slate-500 font-mono uppercase text-xs px-3">Cancel</button>}
        </div>
      </form>

      {/* List */}
      <div className="lg:col-span-3 border border-slate-200 bg-slate-50">
        <div className="px-4 py-3 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase text-slate-500 tracking-wider">{initial.length} listings</span>
            <div className="flex gap-2 items-center">
              <button onClick={() => csvExport(initial)} type="button" className="flex items-center gap-1.5 border border-slate-300 text-slate-500 font-mono text-[10px] uppercase px-2.5 py-1.5 hover:border-amber-500 hover:text-amber-600">
                <Download size={12} /> Export CSV
              </button>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-36 bg-white border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-1.5 text-xs font-mono text-slate-700" />
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[{ id: "all", label: `All (${initial.length})` }, ...STATUS_OPTIONS.map((s) => ({ id: s, label: `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})` }))].map((f) => (
              <button key={f.id} type="button" onClick={() => setStatusFilter(f.id)}
                className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${statusFilter === f.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-slate-400 font-mono text-sm text-center py-12">{query || statusFilter !== "all" ? "No results." : "No jobs yet."}</p>
        ) : (
          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
            {filtered.map((j) => (
              <div key={j.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5">{j.department}</span>
                    <span className="font-mono text-[9px] text-slate-400">{j.type}</span>
                    {j.status === "active"
                      ? <span className="font-mono text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5">Active</span>
                      : j.status === "paused"
                        ? <span className="font-mono text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5">Paused</span>
                        : <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5">Closed</span>}
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{j.title}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">{j.location}</p>
                  {j.description && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{j.description}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
                  <button onClick={() => toggleStatus(j)} aria-label="Toggle status" className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600">
                    {j.status === "active" ? <ToggleRight size={14} className="text-emerald-500" /> : <ToggleLeft size={14} />}
                  </button>
                  <button onClick={() => startEdit(j)} aria-label={`Edit ${j.title}`} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600"><Pencil size={14} /></button>
                  <button onClick={() => remove(j.id, j.title)} aria-label={`Delete ${j.title}`} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
