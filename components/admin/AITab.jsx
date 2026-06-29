"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, FileText, ClipboardList, Send } from "lucide-react";

async function callGenerate(type, data) {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 font-mono text-[10px] uppercase border border-slate-300 hover:border-amber-500 text-slate-500 hover:text-amber-600 px-2 py-1.5 transition-colors">
      {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
}

function ResultBox({ result, loading, error }) {
  if (loading) return (
    <div className="border border-slate-200 bg-slate-50 px-4 py-8 flex items-center justify-center gap-2 text-amber-600 font-mono text-sm">
      <Loader2 size={16} className="animate-spin" /> Generating…
    </div>
  );
  if (error) return <div className="border border-red-200 bg-red-50 px-4 py-3 text-red-600 font-mono text-sm">{error}</div>;
  if (!result) return null;
  return (
    <div className="border border-amber-200 bg-amber-50/40">
      <div className="flex items-center justify-between px-4 py-2 border-b border-amber-200">
        <span className="font-mono text-[10px] uppercase text-amber-700 flex items-center gap-1.5"><Sparkles size={10} /> AI Output</span>
        <CopyButton text={result} />
      </div>
      <pre className="px-4 py-4 text-xs text-slate-700 whitespace-pre-wrap font-mono overflow-x-auto">{result}</pre>
    </div>
  );
}

const FIELD = "w-full bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700";
const LABEL = "block font-mono text-[10px] uppercase text-slate-500 mb-1";

function ProposalForm() {
  const [f, setF] = useState({ project: "", client: "", scope: "", location: "Riyadh, Saudi Arabia", budget: "" });
  const [result, setResult] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const run = async (e) => {
    e.preventDefault(); if (!f.project.trim()) { setError("Project required."); return; }
    setLoading(true); setError("");
    try { setResult(await callGenerate("proposal", f)); } catch (ex) { setError(ex.message); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <form onSubmit={run} className="space-y-3">
        <div><label className={LABEL}>Project Description *</label><textarea rows={3} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} className={FIELD} placeholder="e.g. Complete electrical and ELV fit-out for a 20-floor commercial tower…" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={LABEL}>Client</label><input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} className={FIELD} placeholder="ABC Contracting" /></div>
          <div><label className={LABEL}>Location</label><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className={FIELD} /></div>
        </div>
        <div><label className={LABEL}>Scope of Work</label><textarea rows={2} value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} className={FIELD} placeholder="Supply of wiring devices, MCBs, fire alarm, CCTV, access control…" /></div>
        <div><label className={LABEL}>Budget (SAR)</label><input value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} className={FIELD} placeholder="1,500,000" /></div>
        {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
        <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />} Generate Proposal
        </button>
      </form>
      <ResultBox result={result} loading={loading} error={error && !loading ? error : ""} />
    </div>
  );
}

function BOQForm() {
  const [f, setF] = useState({ project: "", area: "", systems: "" });
  const [result, setResult] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const run = async (e) => {
    e.preventDefault(); if (!f.project.trim()) { setError("Project required."); return; }
    setLoading(true); setError("");
    try { setResult(await callGenerate("boq", f)); } catch (ex) { setError(ex.message); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <form onSubmit={run} className="space-y-3">
        <div><label className={LABEL}>Project Type *</label><textarea rows={2} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} className={FIELD} placeholder="5-star hotel, 150 keys, Jeddah" /></div>
        <div><label className={LABEL}>Area / Scale</label><input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} className={FIELD} placeholder="12,000 sqm GFA, G+8 floors" /></div>
        <div><label className={LABEL}>Systems Required</label><input value={f.systems} onChange={(e) => setF({ ...f, systems: e.target.value })} className={FIELD} placeholder="Wiring devices, MCBs, fire alarm, CCTV, access control, structured cabling" /></div>
        {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
        <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <ClipboardList size={13} />} Generate BOQ
        </button>
      </form>
      <ResultBox result={result} loading={loading} error={error && !loading ? error : ""} />
    </div>
  );
}

function SubmittalForm({ products }) {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const product = products.find((p) => p.id === selected);
  const run = async (e) => {
    e.preventDefault(); if (!product) { setError("Select a product."); return; }
    setLoading(true); setError("");
    try { setResult(await callGenerate("submittal", { name: product.name, sku: product.id, brand: product.brand, spec: product.spec, applications: product.applications })); }
    catch (ex) { setError(ex.message); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <form onSubmit={run} className="space-y-3">
        <div>
          <label className={LABEL}>Select Product *</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className={FIELD}>
            <option value="">— choose a product —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
        </div>
        {product && <div className="bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-xs text-slate-500">{product.id} · {product.spec?.slice(0, 80)}…</div>}
        {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
        <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-1.5">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Generate Submittal
        </button>
      </form>
      <ResultBox result={result} loading={loading} error={error && !loading ? error : ""} />
    </div>
  );
}

const ADMIN_TOOLS = [
  { id: "proposal", label: "Proposal Generator", icon: FileText },
  { id: "boq",      label: "BOQ Generator",       icon: ClipboardList },
  { id: "submittal",label: "Tech Submittal",       icon: Send },
];

export default function AITab({ products = [], hasAI = false }) {
  const [tool, setTool] = useState("proposal");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
      {/* Sidebar */}
      <div className="space-y-1">
        {ADMIN_TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-left font-mono text-xs uppercase tracking-wider border transition-colors ${tool === t.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
        <div className="pt-4 px-1">
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-2">More AI Tools</p>
          <a href="/ai-tools" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-amber-600 hover:underline">Open AI Tools Hub →</a>
        </div>
      </div>

      {/* Panel */}
      <div className="border border-slate-200 bg-slate-50 px-5 py-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles size={15} className="text-amber-500" />
          {ADMIN_TOOLS.find((t) => t.id === tool)?.label}
        </h3>
        {tool === "proposal"  && <ProposalForm />}
        {tool === "boq"       && <BOQForm />}
        {tool === "submittal" && <SubmittalForm products={products} />}
      </div>
    </div>
  );
}
