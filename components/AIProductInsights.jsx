"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";

async function fetchGenerate(type, data) {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

function MarkdownInline({ text }) {
  return (
    <div className="text-sm text-slate-700 leading-relaxed space-y-1.5">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith("- ") || line.startsWith("• ")) return <li key={i} className="ml-4 list-disc text-slate-600">{line.slice(2)}</li>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-slate-800">{line.slice(2, -2)}</p>;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

function InsightPanel({ title, icon: Icon, content, loading, error, onLoad }) {
  const [expanded, setExpanded] = useState(false);

  const handleOpen = () => {
    if (!expanded && !content && !loading) onLoad();
    setExpanded((v) => !v);
  };

  return (
    <div className="border border-slate-200">
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-white transition-colors text-left"
      >
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-600">
          <Icon size={13} className="text-amber-500" /> {title}
        </span>
        {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {expanded && (
        <div className="px-4 py-4 bg-white border-t border-slate-100">
          {loading && (
            <div className="flex items-center gap-2 text-amber-600 font-mono text-xs">
              <Loader2 size={13} className="animate-spin" /> Generating…
            </div>
          )}
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          {content && <MarkdownInline text={content} />}
          {!loading && !content && !error && (
            <p className="text-slate-400 font-mono text-xs">Click to load AI insights.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIProductInsights({ product }) {
  const [summaryContent, setSummaryContent] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [submittalContent, setSubmittalContent] = useState("");
  const [submittalLoading, setSubmittalLoading] = useState(false);
  const [submittalError, setSubmittalError] = useState("");

  const [recommendContent, setRecommendContent] = useState("");
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState("");

  const loadSummary = async () => {
    setSummaryLoading(true); setSummaryError("");
    try {
      const productText = `Name: ${product.name}\nSKU: ${product.id}\nBrand: ${product.brand || "Maxgen"}\nSpec: ${product.spec || ""}\nPrice: SAR ${product.price}\nApplications: ${product.applications || ""}`;
      setSummaryContent(await fetchGenerate("summary", { product: productText }));
    } catch (e) { setSummaryError(e.message); }
    finally { setSummaryLoading(false); }
  };

  const loadSubmittal = async () => {
    setSubmittalLoading(true); setSubmittalError("");
    try {
      setSubmittalContent(await fetchGenerate("submittal", {
        name: product.name, sku: product.id, brand: product.brand,
        spec: product.spec, applications: product.applications,
      }));
    } catch (e) { setSubmittalError(e.message); }
    finally { setSubmittalLoading(false); }
  };

  const loadRecommend = async () => {
    setRecommendLoading(true); setRecommendError("");
    try {
      setRecommendContent(await fetchGenerate("recommend", {
        requirement: `I'm looking at ${product.name} (${product.id}). What similar or complementary products should I also consider for a typical installation?`,
      }));
    } catch (e) { setRecommendError(e.message); }
    finally { setRecommendLoading(false); }
  };

  return (
    <div className="mt-12 border-t border-slate-200 pt-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900 font-display">AI Product Insights</h2>
      </div>
      <p className="text-slate-500 text-sm mb-4">AI-generated summaries and recommendations for this product.</p>
      <div className="space-y-2">
        <InsightPanel
          title="AI Product Summary"
          icon={Sparkles}
          content={summaryContent}
          loading={summaryLoading}
          error={summaryError}
          onLoad={loadSummary}
        />
        <InsightPanel
          title="Generate Technical Submittal"
          icon={Sparkles}
          content={submittalContent}
          loading={submittalLoading}
          error={submittalError}
          onLoad={loadSubmittal}
        />
        <InsightPanel
          title="Complementary Product Recommendations"
          icon={Sparkles}
          content={recommendContent}
          loading={recommendLoading}
          error={recommendError}
          onLoad={loadRecommend}
        />
      </div>
    </div>
  );
}
