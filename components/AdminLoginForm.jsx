"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect PIN.");
      }
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setLoading(false);
      setPin("");
    }
  };

  return (
    <section className="max-w-sm mx-auto px-5 py-24">
      <div className="border border-slate-200 bg-slate-50 px-6 py-8 text-center">
        <Lock className="text-amber-600 mx-auto mb-3" size={26} />
        <h2 className="text-slate-900 font-semibold text-lg mb-1">Admin Access</h2>
        <p className="text-slate-500 text-sm mb-5">Enter the admin PIN to manage the catalog.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setPin(e.target.value.trim())}
            placeholder="PIN"
            className="w-full bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2.5 text-sm text-slate-700 text-center font-mono"
          />
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 text-slate-950 font-mono uppercase text-sm tracking-wider py-2.5 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    </section>
  );
}
