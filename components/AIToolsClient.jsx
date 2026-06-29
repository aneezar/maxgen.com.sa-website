"use client";

import { useState } from "react";
import { FileText, ClipboardList, Send, Sparkles, GitCompare, Loader2, Copy, Check, ChevronDown } from "lucide-react";

const FIELD = "block w-full mt-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700";
const LABEL = "font-mono text-[10px] uppercase text-slate-500 tracking-wider";

const TOOLS = [
  { id: "proposal",  label: "Proposal Generator",    icon: FileText,     desc: "Generate a professional project proposal in seconds." },
  { id: "boq",       label: "BOQ Generator",          icon: ClipboardList, desc: "Build a detailed Bill of Quantities from a project brief." },
  { id: "submittal", label: "Technical Submittal",    icon: Send,         desc: "Create a product technical submittal for consultant approval." },
  { id: "recommend", label: "Product Recommendation", icon: Sparkles,     desc: "Describe your project — get specific product recommendations." },
  { id: "compare",   label: "Product Comparison",     icon: GitCompare,   desc: "Compare two or more products with an AI-generated analysis." },
];

async function callGenerate(type, data) {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || "AI error");
  return json.result;
}

function MarkdownOutput({ text }) {
  const lines = text.split("\n");
  return (
    <div className="text-sm text-slate-700 leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-slate-900 mt-4 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-slate-800 mt-3 mb-0.5">{line.slice(4)}</h3>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-slate-800">{line.slice(2, -2)}</p>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        if (line.match(/^\d+\. /)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
        if (line.startsWith("|") && line.endsWith("|")) return <p key={i} className="font-mono text-xs text-slate-600 border-b border-slate-100 py-0.5">{line}</p>;
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-slate-500 hover:text-amber-600 border border-slate-300 hover:border-amber-500 px-2.5 py-1.5 transition-colors">
      {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
}

// ---- Tool panels ----

function ProposalPanel({ onResult }) {
  const [f, setF] = useState({ project: "", client: "", scope: "", location: "Riyadh, Saudi Arabia", budget: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!f.project.trim()) { setErr("Project description is required."); return; }
    setLoading(true); setErr("");
    try { onResult(await callGenerate("proposal", f)); }
    catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block"><span className={LABEL}>Project Description *</span>
        <textarea rows={3} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} placeholder="e.g. Complete electrical and ELV installation for a 10-floor commercial tower in Riyadh" className={FIELD} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className={LABEL}>Client / Company</span><input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} placeholder="ABC Real Estate" className={FIELD} /></label>
        <label className="block"><span className={LABEL}>Location</span><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className={FIELD} /></label>
      </div>
      <label className="block"><span className={LABEL}>Project Scope</span>
        <textarea rows={2} value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} placeholder="Supply and installation of wiring devices, distribution boards, fire alarm, CCTV…" className={FIELD} />
      </label>
      <label className="block"><span className={LABEL}>Budget Range (SAR, optional)</span>
        <input value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} placeholder="500,000" className={FIELD} />
      </label>
      {err && <p className="text-red-500 text-xs font-mono">{err}</p>}
      <GenerateButton loading={loading} />
    </form>
  );
}

function BOQPanel({ onResult }) {
  const [f, setF] = useState({ project: "", area: "", systems: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!f.project.trim()) { setErr("Project description is required."); return; }
    setLoading(true); setErr("");
    try { onResult(await callGenerate("boq", f)); }
    catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block"><span className={LABEL}>Project Type *</span>
        <textarea rows={2} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} placeholder="e.g. 5-star hotel, 200 rooms, Jeddah — complete electrical and ELV systems" className={FIELD} />
      </label>
      <label className="block"><span className={LABEL}>Area / Scale</span>
        <input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} placeholder="e.g. 15,000 sqm GFA, G+10 floors, 200 rooms" className={FIELD} />
      </label>
      <label className="block"><span className={LABEL}>Systems to Include</span>
        <input value={f.systems} onChange={(e) => setF({ ...f, systems: e.target.value })} placeholder="Wiring devices, DB boards, fire alarm, CCTV, access control, PA, structured cabling" className={FIELD} />
      </label>
      {err && <p className="text-red-500 text-xs font-mono">{err}</p>}
      <GenerateButton loading={loading} />
    </form>
  );
}

function SubmittalPanel({ products, onResult }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const product = products.find((p) => p.id === selected);
  const submit = async (e) => {
    e.preventDefault();
    if (!product) { setErr("Select a product first."); return; }
    setLoading(true); setErr("");
    try {
      onResult(await callGenerate("submittal", {
        name: product.name, sku: product.id, brand: product.brand,
        spec: product.spec, applications: product.applications,
      }));
    }
    catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block"><span className={LABEL}>Select Product *</span>
        <div className="relative mt-1">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className={`${FIELD} appearance-none pr-8`}>
            <option value="">— choose a product —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </label>
      {product && (
        <div className="bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600 font-mono">
          {product.id} — {product.spec?.slice(0, 100)}{product.spec?.length > 100 ? "…" : ""}
        </div>
      )}
      {err && <p className="text-red-500 text-xs font-mono">{err}</p>}
      <GenerateButton loading={loading} label="Generate Submittal" />
    </form>
  );
}

function RecommendPanel({ onResult }) {
  const [req, setReq] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!req.trim()) { setErr("Describe your requirement."); return; }
    setLoading(true); setErr("");
    try { onResult(await callGenerate("recommend", { requirement: req })); }
    catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block"><span className={LABEL}>Describe your project requirement *</span>
        <textarea rows={4} value={req} onChange={(e) => setReq(e.target.value)}
          placeholder="e.g. I need to equip a 100-room hotel with switches, sockets, and a complete CCTV system with 64 cameras, access control for 10 doors, and a fire alarm system…" className={FIELD} />
      </label>
      {err && <p className="text-red-500 text-xs font-mono">{err}</p>}
      <GenerateButton loading={loading} label="Get Recommendations" />
    </form>
  );
}

function ComparePanel({ products, onResult }) {
  const [ids, setIds] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const toggle = (i, v) => { const next = [...ids]; next[i] = v; setIds(next); };
  const addSlot = () => { if (ids.length < 4) setIds([...ids, ""]); };
  const submit = async (e) => {
    e.preventDefault();
    const selected = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
    if (selected.length < 2) { setErr("Select at least 2 products."); return; }
    const productsList = selected.map((p, i) =>
      `Product ${i + 1}: ${p.name} (${p.id}) — Brand: ${p.brand || "N/A"} — ${p.spec || ""} — SAR ${p.price}`).join("\n");
    setLoading(true); setErr("");
    try { onResult(await callGenerate("compare", { products: productsList })); }
    catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      {ids.map((id, i) => (
        <label key={i} className="block">
          <span className={LABEL}>Product {i + 1}</span>
          <div className="relative mt-1">
            <select value={id} onChange={(e) => toggle(i, e.target.value)} className={`${FIELD} appearance-none pr-8`}>
              <option value="">— choose a product —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </label>
      ))}
      {ids.length < 4 && (
        <button type="button" onClick={addSlot} className="font-mono text-[11px] text-amber-600 hover:underline">+ Add another product</button>
      )}
      {err && <p className="text-red-500 text-xs font-mono">{err}</p>}
      <GenerateButton loading={loading} label="Compare Products" />
    </form>
  );
}

function GenerateButton({ loading, label = "Generate" }) {
  return (
    <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-mono uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-2 transition-colors">
      {loading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> {label}</>}
    </button>
  );
}

export default function AIToolsClient({ products, hasAI }) {
  const [activeTool, setActiveTool] = useState("proposal");
  const [result, setResult] = useState("");

  const handleResult = (text) => { setResult(text); window.scrollTo({ top: document.getElementById("ai-result")?.offsetTop - 80, behavior: "smooth" }); };

  return (
    <section className="max-w-7xl mx-auto px-5 py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">AI-Powered</p>
        <h1 className="text-4xl font-bold text-slate-900 font-display mb-4">AI Project Tools</h1>
        <p className="text-slate-500 text-[15px] max-w-2xl">
          Generate professional proposals, BOQs, technical submittals, and get instant product recommendations — powered by AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Tool selector */}
        <div className="space-y-1.5">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => { setActiveTool(t.id); setResult(""); }}
              className={`w-full text-left border px-4 py-3.5 transition-all ${activeTool === t.id ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-slate-400"}`}>
              <div className="flex items-center gap-2.5 mb-1">
                <t.icon size={14} className={activeTool === t.id ? "text-amber-600" : "text-slate-400"} />
                <span className={`font-mono text-xs uppercase tracking-wider ${activeTool === t.id ? "text-amber-700" : "text-slate-600"}`}>{t.label}</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Active tool panel */}
        <div className="space-y-6">
          <div className="border border-slate-200 bg-white px-6 py-6">
            <h2 className="font-semibold text-slate-900 mb-4">{TOOLS.find((t) => t.id === activeTool)?.label}</h2>
            <>
              {activeTool === "proposal"  && <ProposalPanel onResult={handleResult} />}
              {activeTool === "boq"       && <BOQPanel onResult={handleResult} />}
              {activeTool === "submittal" && <SubmittalPanel products={products} onResult={handleResult} />}
              {activeTool === "recommend" && <RecommendPanel onResult={handleResult} />}
              {activeTool === "compare"   && <ComparePanel products={products} onResult={handleResult} />}
            </>
          </div>

          {/* Result area */}
          {result && (
            <div id="ai-result" className="border border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between px-5 py-3 border-b border-amber-200">
                <span className="font-mono text-[11px] uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> AI Output
                </span>
                <CopyButton text={result} />
              </div>
              <div className="px-5 py-5">
                <MarkdownOutput text={result} />
              </div>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
