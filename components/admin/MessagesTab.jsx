"use client";

export default function MessagesTab({ messages }) {
  return (
    <div className="border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 tracking-wider">
        {messages.length} messages received
      </div>
      {messages.length === 0 ? (
        <p className="text-slate-400 font-mono text-sm text-center py-12">No messages yet.</p>
      ) : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-200">
          {messages.map((m) => (
            <div key={m.id} className="px-4 py-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-900 text-sm font-medium">{m.name} · {m.phone}</span>
                <span className="font-mono text-[11px] text-slate-500">{new Date(m.submitted_at).toLocaleString()}</span>
              </div>
              {m.email && <p className="font-mono text-[11px] text-slate-500 mb-1">{m.email}</p>}
              <p className="text-slate-500 text-sm">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
