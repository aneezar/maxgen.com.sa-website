"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function StatusDot({ status }) {
  const color = status === "low" ? "bg-amber-400" : "bg-emerald-400";
  const label = status === "low" ? "Low stock" : "In stock";
  return (
    <span role="img" aria-label={label} className="relative inline-flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ping`} aria-hidden="true" />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
    </span>
  );
}

export function ProductImg({ src, alt, className, loading = "lazy", objectFit = "cover" }) {
  const [failed, setFailed] = useState(false);
  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 flex-shrink-0 ${className}`} aria-hidden="true">
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
      className={`block w-full ${fitClass} flex-shrink-0 ${className}`}
      loading={loading}
      decoding="async"
    />
  );
}
