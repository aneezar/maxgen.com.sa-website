"use client";

import { useState } from "react";
import { Briefcase, ChevronRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { submitApplication } from "@/lib/actions";

export default function CareerClient({ roles }) {
  const [openRole, setOpenRole] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (formData, roleTitle) => {
    setError("");
    setStatus("saving");
    const res = await submitApplication(formData, roleTitle);
    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("idle");
      setError(res.error);
    }
  };

  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <div key={role.title} className="border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => { setOpenRole(openRole === role.title ? null : role.title); setStatus("idle"); setError(""); }}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Briefcase size={16} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-slate-900 font-semibold text-[15px]">{role.title}</p>
                <p className="font-mono text-[11px] text-slate-500">{role.location} · {role.type}</p>
              </div>
            </div>
            <ChevronRight size={16} className={`text-slate-400 transition-transform ${openRole === role.title ? "rotate-90" : ""}`} />
          </button>

          {openRole === role.title && (
            <div className="border-t border-slate-200 px-5 py-5">
              <p className="text-slate-500 text-sm mb-5">{role.desc}</p>

              {status === "sent" ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 size={16} /> Application received — we&apos;ll be in touch.
                </div>
              ) : (
                <form action={(fd) => handleSubmit(fd, role.title)} className="flex flex-col sm:flex-row gap-2">
                  <input name="name" placeholder="Your name" className="flex-1 bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700" />
                  <input name="email" type="email" placeholder="Email" className="flex-1 bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700" />
                  <input name="phone" type="tel" placeholder="Phone (optional)" className="flex-1 bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700" />
                  <button disabled={status === "saving"} className="bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider px-4 py-2.5 flex items-center justify-center gap-1.5 whitespace-nowrap">
                    {status === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Apply
                  </button>
                </form>
              )}
              {error && <p className="text-red-500 text-xs font-mono mt-2">{error}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
