"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { submitLead } from "@/lib/actions";

export default function LeadCaptureBlock() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const handleSubmit = async (formData) => {
    setError("");
    setStatus("saving");
    const res = await submitLead(formData);
    if (res.ok) {
      setStatus("sent");
      formRef.current?.reset();
    } else {
      setStatus("idle");
      setError(res.error);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-5 py-14">
      <div className="border border-slate-200 bg-white shadow-sm px-6 py-10 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-2">Stay In The Loop</p>
          <h3 className="text-2xl font-bold text-slate-900 font-display">Get stock alerts and quotes by email or phone.</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Leave your details and our team will reach out — no spam, just order updates and availability.</p>
        </div>

        {status === "sent" ? (
          <div className="flex items-center gap-2 text-emerald-600 font-medium flex-shrink-0">
            <CheckCircle2 size={20} /> Thanks — we'll be in touch.
          </div>
        ) : (
          <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2 w-full sm:w-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-2">
              <input name="email" type="email" placeholder="Email address" aria-label="Email address" className="bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700 sm:w-52" />
              <input name="phone" type="tel" placeholder="Phone number" aria-label="Phone number" className="bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700 sm:w-44" />
              <button disabled={status === "saving"} className="bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider px-5 py-2.5 flex items-center justify-center gap-1.5 whitespace-nowrap">
                {status === "saving" ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Notify Me
              </button>
            </div>
            {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
