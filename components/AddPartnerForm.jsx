"use client";

import { useState, useRef } from "react";
import { Lock, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { submitPartner } from "@/lib/actions";
import { ADMIN_PIN } from "@/lib/auth";

export default function AddPartnerForm() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const checkPin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN.");
    }
  };

  const handleSubmit = async (formData) => {
    setError("");
    setStatus("saving");
    const res = await submitPartner(formData);
    if (res.ok) {
      setStatus("sent");
      formRef.current?.reset();
    } else {
      setStatus("idle");
      setError(res.error);
    }
  };

  if (!unlocked) {
    return (
      <div className="border border-slate-200 bg-slate-50 px-5 py-5 max-w-xs">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
          <Lock size={14} /> <span className="font-mono text-[11px] uppercase tracking-wider">Admin only</span>
        </div>
        <form onSubmit={checkPin} className="flex gap-2">
          <input
            type="text" inputMode="numeric" autoComplete="off"
            value={pin} onChange={(e) => setPin(e.target.value.trim())}
            placeholder="PIN"
            className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono"
          />
          <button className="bg-slate-900 text-white font-mono uppercase text-xs px-4">Unlock</button>
        </form>
        {pinError && <p className="text-red-500 text-xs font-mono mt-2">{pinError}</p>}
      </div>
    );
  }

  return (
    <div className="border border-slate-200 bg-slate-50 px-5 py-5 max-w-md">
      <h3 className="text-slate-900 font-semibold text-sm mb-3">Add a Partner</h3>
      {status === "sent" ? (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <CheckCircle2 size={16} /> Partner added.
          <button onClick={() => setStatus("idle")} className="font-mono text-xs uppercase text-amber-600 ml-2">Add another</button>
        </div>
      ) : (
        <form ref={formRef} action={handleSubmit} className="space-y-2">
          <input name="name" placeholder="Partner / brand name" className="w-full bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          <input name="type" placeholder="Type (e.g. Technology Partner)" className="w-full bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          <input name="focus" placeholder="Focus area (e.g. CCTV hardware)" className="w-full bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700" />
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          <button disabled={status === "saving"} className="bg-amber-500 disabled:bg-slate-300 hover:bg-amber-400 text-slate-950 font-mono uppercase text-xs tracking-wider px-4 py-2.5 flex items-center gap-1.5">
            {status === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Partner
          </button>
        </form>
      )}
    </div>
  );
}
