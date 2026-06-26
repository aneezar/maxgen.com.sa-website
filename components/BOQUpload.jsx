"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const ACCEPTED = [".xlsx", ".xls", ".pdf", ".csv"];
const MAX_MB = 10;

export default function BOQUpload({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setError("");

    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported type. Accepted: ${ACCEPTED.join(", ")}`);
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safeName}`;

    const { data, error: uploadError } = await supabase.storage
      .from("boq-uploads")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    setUploading(false);

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      return;
    }

    const { data: urlData } = supabase.storage.from("boq-uploads").getPublicUrl(data.path);
    onChange({ url: urlData.publicUrl, name: file.name, size: file.size });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <p className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mb-2">
        BOQ / Specification File <span className="text-slate-400">(optional)</span>
      </p>

      {value ? (
        <div className="flex items-center gap-3 border border-emerald-300 bg-emerald-50 px-3 py-2.5">
          <FileText size={16} className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 font-medium truncate">{value.name}</p>
            <p className="font-mono text-[10px] text-slate-400">{(value.size / 1024).toFixed(0)} KB uploaded</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate-400 hover:text-red-500 flex-shrink-0"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
            dragging ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-400"
          }`}
        >
          {uploading
            ? <Loader2 size={20} className="text-amber-500 animate-spin mx-auto mb-2" />
            : <Upload size={20} className="text-slate-400 mx-auto mb-2" />}
          <p className="text-sm text-slate-500">
            {uploading ? "Uploading…" : "Drop BOQ file here or click to browse"}
          </p>
          <p className="font-mono text-[10px] text-slate-400 mt-1">
            Excel, PDF, CSV — max {MAX_MB} MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => upload(e.target.files[0])}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-xs font-mono mt-1.5">{error}</p>}
    </div>
  );
}
