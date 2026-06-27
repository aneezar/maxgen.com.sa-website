"use client";

export default function ApplicationsTab({ applications }) {
  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">
        {applications.length} applications received
      </div>
      {applications.length === 0 ? (
        <p className="text-slate-400 font-mono text-sm text-center py-12">No applications yet.</p>
      ) : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {applications.map((a) => (
            <div key={a.id} className="px-4 py-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-900 text-sm font-medium">{a.name}</span>
                <span className="font-mono text-[11px] text-slate-500">{new Date(a.applied_at).toLocaleString()}</span>
              </div>
              <p className="font-mono text-amber-600 text-xs mb-1">{a.role}</p>
              <p className="text-slate-500 text-sm">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
