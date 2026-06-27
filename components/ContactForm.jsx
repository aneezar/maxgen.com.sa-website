"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContactForm } from "@/lib/actions";

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const handleSubmit = async (formData) => {
    setError("");
    setStatus("saving");
    const res = await submitContactForm(formData);
    if (res.ok) {
      setStatus("sent");
      formRef.current?.reset();
    } else {
      setStatus("idle");
      setError(res.error);
    }
  };

  if (status === "sent") {
    return (
      <div className="border border-emerald-200 bg-emerald-50 px-5 py-8 flex flex-col items-center text-center gap-3">
        <CheckCircle2 className="text-emerald-600" size={32} />
        <p className="text-slate-900 font-medium">Message sent.</p>
        <p className="text-slate-500 text-sm">We&apos;ll get back to you shortly.</p>
        <button onClick={() => setStatus("idle")} className="font-mono text-xs uppercase text-amber-600 mt-2">Send another</button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input name="name" placeholder="Your name" className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700" />
      <input name="phone" placeholder="Phone number" className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700" />
      <input name="email" placeholder="Email (optional)" className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700" />
      <textarea name="message" placeholder="What do you need?" rows={4} className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700 resize-none" />
      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
      <button disabled={status === "saving"} className="w-full bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-sm tracking-wider py-3 flex items-center justify-center gap-2">
        {status === "saving" ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : "Send Message"}
      </button>
    </form>
  );
}
