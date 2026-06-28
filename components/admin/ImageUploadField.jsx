"use client";

import { useState, useMemo } from "react";
import { Upload, Loader2 } from "lucide-react";
import { ProductImg } from "@/components/UI";
import { validateAndResizeImage } from "@/lib/imageUtils";

export default function ImageUploadField({ value, onChange, label }) {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [processing, setProcessing] = useState(false);
  const inputId = useMemo(() => `img-upload-${Math.random().toString(36).slice(2)}`, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setInfo("");
    setProcessing(true);
    try {
      const result = await validateAndResizeImage(file);
      onChange(result.dataUrl);
      setInfo(`Resized to ${result.width}×${result.height}px, ${Math.round(result.bytes / 1024)}KB`);
    } catch (err) {
      setError(err.message || "Could not process that image — try again.");
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  };

  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase text-slate-500">{label || "Image"}</span>
      <div className="flex gap-2 mt-1">
        <input
          value={value && value.startsWith("data:") ? "" : value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            value && value.startsWith("data:")
              ? "Uploaded image in use — paste a URL to replace it"
              : "https://example.com/photo.jpg"
          }
          className="flex-1 bg-white border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 font-mono"
        />
        <label
          htmlFor={inputId}
          className={`flex items-center gap-1.5 border px-3 py-2 text-xs font-mono uppercase whitespace-nowrap cursor-pointer ${
            processing
              ? "border-slate-200 text-slate-300 cursor-wait"
              : "border-slate-300 hover:border-amber-500 text-slate-500"
          }`}
        >
          {processing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {processing ? "Processing…" : "Upload"}
        </label>
        <input id={inputId} type="file" accept="image/*" onChange={handleFile} disabled={processing} className="hidden" />
      </div>
      {error && <p className="text-red-500 text-xs font-mono mt-1">{error}</p>}
      {info && !error && <p className="text-emerald-600 text-xs font-mono mt-1">{info}</p>}
      <div className="mt-2">
        <ProductImg src={value} alt="Preview" className="w-full h-28 bg-slate-50" objectFit="contain" />
      </div>
    </label>
  );
}
