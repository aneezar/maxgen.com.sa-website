"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function StatusDot({ status }) {
  const color = status === "low" ? "bg-amber-400" : "bg-emerald-400";
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden="true">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ping`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

export function ProductImg({ src, alt, className, loading = "lazy" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-200 flex-shrink-0 ${className}`} aria-hidden="true">
        <ImageOff size={20} className="text-slate-400" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`block w-full object-cover flex-shrink-0 ${className}`}
      loading={loading}
      decoding="async"
    />
  );
}
