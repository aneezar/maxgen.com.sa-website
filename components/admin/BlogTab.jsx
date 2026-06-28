"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, Loader2, Search, Download, Eye, EyeOff, Tag } from "lucide-react";
import { adminSavePost, adminDeletePost } from "@/lib/actions";
import ImageUploadField from "./ImageUploadField";

const POST_TYPES = [
  { id: "blog", label: "Blog" },
  { id: "news", label: "News" },
  { id: "case-study", label: "Case Study" },
  { id: "success-story", label: "Success Story" },
];

const TYPE_COLORS = {
  blog: "bg-slate-100 text-slate-600",
  news: "bg-blue-100 text-blue-700",
  "case-study": "bg-amber-100 text-amber-800",
  "success-story": "bg-emerald-100 text-emerald-700",
};

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function emptyPost() {
  return {
    type: "blog", slug: "", title: "", excerpt: "", body: "",
    cover_image: "", author: "Maxgen Team", tags: [], status: "draft",
    published_at: new Date().toISOString().slice(0, 10),
  };
}

function csvExport(posts) {
  const header = "Type,Slug,Title,Excerpt,Author,Status,Published At,Tags";
  const lines = posts.map((p) => [
    `"${p.type}"`,
    `"${p.slug}"`,
    `"${(p.title || "").replace(/"/g, '""')}"`,
    `"${(p.excerpt || "").replace(/"/g, '""')}"`,
    `"${(p.author || "").replace(/"/g, '""')}"`,
    `"${p.status}"`,
    `"${p.published_at || ""}"`,
    `"${(Array.isArray(p.tags) ? p.tags : []).join(";")}"`,
  ].join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "posts.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}

function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };
  return (
    <div>
      <div className="flex gap-1 flex-wrap mb-1">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 font-mono text-[9px] px-1.5 py-0.5">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-red-500 ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="tag + Enter" className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-2 py-1.5 text-xs font-mono" />
        <button type="button" onClick={add} className="border border-slate-300 px-2 text-slate-400 hover:border-amber-500">+</button>
      </div>
    </div>
  );
}

export default function BlogTab({ posts: initial, setPosts }) {
  const [form, setForm] = useState(emptyPost());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : [],
      published_at: p.published_at ? p.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
    setNotice("");
  };
  const resetForm = () => { setEditingId(null); setForm(emptyPost()); setNotice(""); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setNotice("Title is required."); return; }
    if (!form.slug.trim() && !form.title.trim()) { setNotice("Title required to generate slug."); return; }

    setSaving(true);
    const slug = form.slug.trim() || slugify(form.title);

    if (!editingId && initial.some((p) => p.slug === slug)) {
      setSaving(false); setNotice("A post with this slug already exists."); return;
    }

    const record = {
      ...(editingId && { id: editingId }),
      type: form.type,
      slug,
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      body: form.body.trim() || null,
      cover_image: (form.cover_image || "").trim() || null,
      author: form.author.trim() || "Maxgen Team",
      tags: Array.isArray(form.tags) ? form.tags : [],
      status: form.status,
      published_at: form.status === "published" ? (form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString()) : null,
    };

    const ok = await adminSavePost(record);
    setSaving(false);
    if (ok) {
      if (editingId) {
        setPosts((prev) => prev.map((p) => p.id === editingId ? { ...p, ...record } : p));
      } else {
        setPosts((prev) => [{ id: `temp-${Date.now()}`, ...record, created_at: new Date().toISOString() }, ...prev]);
      }
      setNotice(editingId ? "Post updated." : "Post added.");
      resetForm();
    } else {
      setNotice("Could not save — try again.");
    }
  };

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const ok = await adminDeletePost(id);
    if (ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const filtered = initial
    .filter((p) => typeFilter === "all" || p.type === typeFilter)
    .filter((p) => !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.slug.toLowerCase().includes(query.toLowerCase()));

  const typeCounts = POST_TYPES.reduce((acc, t) => {
    acc[t.id] = initial.filter((p) => p.type === t.id).length;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form (wider) */}
      <form onSubmit={save} className="lg:col-span-2 border border-slate-200 bg-slate-50 px-5 py-5 space-y-3 self-start">
        <h3 className="font-semibold text-slate-900 mb-1">{editingId ? "Edit Post" : "New Post"}</h3>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Type</span>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
            {POST_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Title *</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Slug {editingId ? "(locked)" : "(auto-generated)"}</span>
          <input value={form.slug} disabled={!!editingId} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-xs text-slate-700 font-mono disabled:opacity-50" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Excerpt (used in cards + SEO)</span>
          <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none" />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Body (## for h2, ### for h3, - for bullets)</span>
          <textarea rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="## Introduction&#10;&#10;Your content here…" className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono resize-y" />
        </label>

        <ImageUploadField value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} label="Cover Image" />

        <label className="block">
          <span className="font-mono text-[10px] uppercase text-slate-500">Author</span>
          <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
        </label>

        <div>
          <span className="font-mono text-[10px] uppercase text-slate-500 flex items-center gap-1"><Tag size={10} /> Tags</span>
          <div className="mt-1">
            <TagsInput tags={Array.isArray(form.tags) ? form.tags : []} onChange={(t) => setForm({ ...form, tags: t })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-slate-500">Publish Date</span>
            <input type="date" value={form.published_at || ""} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono" />
          </label>
        </div>

        {notice && <p className="text-amber-600 text-xs font-mono">{notice}</p>}

        <div className="flex gap-2 pt-1">
          <button disabled={saving} className="flex-1 bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editingId ? "Update" : "Publish"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="border border-slate-300 text-slate-500 font-mono uppercase text-xs px-3">Cancel</button>}
        </div>
      </form>

      {/* List */}
      <div className="lg:col-span-3 border border-slate-200 bg-slate-50">
        <div className="px-4 py-3 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase text-slate-500 tracking-wider">{initial.length} posts</span>
            <div className="flex items-center gap-2">
              <button onClick={() => csvExport(initial)} type="button" className="flex items-center gap-1.5 border border-slate-300 text-slate-500 font-mono text-[10px] uppercase px-2.5 py-1.5 hover:border-amber-500 hover:text-amber-600">
                <Download size={12} /> Export CSV
              </button>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-40 bg-white border border-slate-300 focus:border-amber-500 outline-none pl-8 pr-3 py-1.5 text-xs font-mono text-slate-700" />
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[{ id: "all", label: `All (${initial.length})` }, ...POST_TYPES.map((t) => ({ id: t.id, label: `${t.label} (${typeCounts[t.id]})` }))].map((f) => (
              <button key={f.id} type="button" onClick={() => setTypeFilter(f.id)}
                className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${typeFilter === f.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-500"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-slate-400 font-mono text-sm text-center py-12">{query || typeFilter !== "all" ? "No results." : "No posts yet."}</p>
        ) : (
          <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-200">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${TYPE_COLORS[p.type] || "bg-slate-100 text-slate-600"}`}>{p.type}</span>
                    {p.status === "published"
                      ? <Eye size={11} className="text-emerald-500" aria-label="Published" />
                      : <EyeOff size={11} className="text-slate-400" aria-label="Draft" />}
                  </div>
                  <p className="text-slate-900 text-sm font-medium leading-snug">{p.title}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                    {p.slug}
                    {p.published_at ? ` · ${new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : " · draft"}
                  </p>
                  {p.excerpt && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{p.excerpt}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0 mt-0.5">
                  <button onClick={() => startEdit(p)} aria-label={`Edit ${p.title}`} className="p-2 border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600"><Pencil size={14} /></button>
                  <button onClick={() => remove(p.id, p.title)} aria-label={`Delete ${p.title}`} className="p-2 border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
