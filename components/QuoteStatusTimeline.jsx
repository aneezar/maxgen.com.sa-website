const STEPS = [
  { id: "pending",  label: "Received" },
  { id: "reviewed", label: "Reviewed" },
  { id: "quoted",   label: "Quoted" },
  { id: "accepted", label: "Accepted" },
];

const STEP_INDEX = { pending: 0, reviewed: 1, quoted: 2, accepted: 3, rejected: 3 };

export default function QuoteStatusTimeline({ status, adminNote, quotedAt }) {
  const currentIdx = STEP_INDEX[status] ?? 0;
  const isRejected = status === "rejected";

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const current = idx === currentIdx;
          const future  = idx > currentIdx;
          const terminal = idx === 3;
          const reject   = terminal && isRejected;

          const circleClass = reject
            ? "bg-red-500 border-red-500 text-white"
            : done
            ? "bg-amber-500 border-amber-500 text-slate-950"
            : current
            ? "border-amber-500 bg-white text-amber-600"
            : "border-slate-300 bg-white text-slate-400";

          const labelClass = reject
            ? "text-red-500"
            : current
            ? "text-amber-600 font-semibold"
            : done
            ? "text-slate-700"
            : "text-slate-400";

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold ${circleClass}`}>
                  {done ? "✓" : reject ? "✕" : idx + 1}
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-wider whitespace-nowrap ${labelClass}`}>
                  {reject ? "Rejected" : step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 ${done || (current && idx < currentIdx) ? "bg-amber-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Admin note */}
      {adminNote && (status === "quoted" || status === "accepted" || status === "rejected") && (
        <blockquote className="mt-6 border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
          <p className="font-mono text-[10px] uppercase text-amber-700 tracking-wider mb-1">Note from Maxgen</p>
          <p className="text-slate-700 text-sm leading-relaxed">{adminNote}</p>
        </blockquote>
      )}

      {quotedAt && status !== "pending" && status !== "reviewed" && (
        <p className="font-mono text-[10px] text-slate-400 mt-3">
          Quoted on {new Date(quotedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
    </div>
  );
}
