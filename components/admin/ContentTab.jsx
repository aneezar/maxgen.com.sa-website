"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { adminSaveContent } from "@/lib/actions";

export default function ContentTab({ contentForm, setContentForm }) {
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
