"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import BOQUpload from "./BOQUpload";
import { submitRFQ } from "@/lib/actions";
import { useQuote } from "./QuoteContext";
import { fmt } from "@/lib/constants";

export default function RFQForm({ onSuccess }) {
  const { quote, subtotal, clear } = useQuote();
  const [form, setForm] = useState({
    contact_name: "",
    company: "",
    phone: "",
    email: "",
    project_ref: "",
    delivery_date: "",
    notes: "",
  });
  const [boq, setBoq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name.trim() || !form.phone.trim()) {
      setError("Contact name and phone are required.");
      return;
    }
    if (quote.length === 0) {
      setError("Quote basket is empty.");
      return;
    }
    setSubmitting(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    fd.set("items", JSON.stringify(quote));
    fd.set("subtotal", String(subtotal));
    if (boq) { fd.set("boq_url", boq.url); fd.set("boq_name", boq.name); }

    const result = await submitRFQ(fd);
    setSubmitting(false);

    if (result.ok) {
      clear();
      onSuccess(result.refId);
    } else {
      setError(result.error || "Submission failed — please try again.");
    }
  };

  const inputCls = "mt-1 w-full bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm font-mono text-slate-700";
  const labelCls = "font-mono text-[10px] uppercase text-slate-500 tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>Contact Name <span className="text-red-400">*</span></span>
          <input value={form.contact_name} onChange={set("contact_name")} placeholder="Ahmed Al-Rashid" className={inputCls} required />
        </label>
        <label className="block">
          <span className={labelCls}>Company</span>
          <input value={form.company} onChange={set("company")} placeholder="Maxgen Electric Co." className={inputCls} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>Phone <span className="text-red-400">*</span></span>
          <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+966 5X XXX XXXX" className={inputCls} required />
        </label>
        <label className="block">
          <span className={labelCls}>Email</span>
          <input type="email" value={form.email} onChange={set("email")} placeholder="ahmed@company.com" className={inputCls} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>Project Reference</span>
          <input value={form.project_ref} onChange={set("project_ref")} placeholder="PROJ-2025-001" className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Required By</span>
          <input type="date" value={form.delivery_date} onChange={set("delivery_date")} className={inputCls} />
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Notes / Special Requirements</span>
        <textarea
          value={form.notes}
          onChange={set("notes")}
          placeholder="Site location, cable specs, certifications required…"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </label>

      <BOQUpload value={boq} onChange={setBoq} />

      <div className="border-t border-slate-200 pt-4 space-y-3">
        <div className="flex justify-between font-mono text-sm text-slate-600">
          <span>Estimated Subtotal</span>
          <span className="text-amber-600 font-semibold">{fmt(subtotal)}</span>
        </div>

        {error && <p className="text-red-500 text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-mono uppercase text-sm tracking-wider py-3.5 flex items-center justify-center gap-2 transition-colors"
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Submit RFQ"}
        </button>

        <p className="font-mono text-[10px] text-slate-400 text-center">
          Prices are indicative. A formal quotation will follow within 24 hours.
        </p>
      </div>
    </form>
  );
}
