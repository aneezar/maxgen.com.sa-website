"use client";

export default function LeadsTab({ leads }) {
  const exportCsv = () => {
    const rows = [
      ["email", "phone", "capturedAt"],
      ...leads.map((l) => [l.email || "", l.phone || "", l.captured_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "maxgen-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider flex justify-between">
        <span>{leads.length} leads captured</span>
        <button onClick={exportCsv} className="text-amber-600">Export CSV</button>
      </div>
      {leads.length === 0 ? (
        <p className="text-slate-400 font-mono text-sm text-center py-12">No leads yet.</p>
      ) : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {leads.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-4 py-3">
              <div>
                {l.email && <p className="text-slate-900 text-sm font-medium">{l.email}</p>}
                {l.phone && <p className="font-mono text-[12px] text-slate-500">{l.phone}</p>}
              </div>
              <span className="font-mono text-[11px] text-slate-500">{new Date(l.captured_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
