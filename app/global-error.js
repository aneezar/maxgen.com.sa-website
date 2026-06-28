"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "monospace", background: "#f8fafc", color: "#0f172a" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ef4444", marginBottom: 12 }}>Critical Error</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, fontFamily: "sans-serif" }}>
            Maxgen encountered an error
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            The application could not load. Please refresh the page. If this keeps happening,
            email us at <a href="mailto:info@maxgen.com.sa" style={{ color: "#d97706" }}>info@maxgen.com.sa</a>.
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#f59e0b", color: "#0f172a", border: "none",
              padding: "12px 24px", fontSize: 12, letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace",
            }}
          >
            <RefreshCw size={14} /> Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
