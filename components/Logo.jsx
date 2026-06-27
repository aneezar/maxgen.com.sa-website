export default function Logo({ small, dark }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-icon.png"
        alt="Maxgen logo"
        className={`${small ? "h-9 w-9" : "h-11 w-11"} object-contain flex-shrink-0`}
      />
      <div>
        <h1
          className={`${small ? "text-lg" : "text-2xl"} font-bold ${dark ? "text-white" : "text-slate-900"} tracking-tight leading-none font-display`}
        >
          MAXGEN
        </h1>
        {!small && (
          <p className={`font-mono text-[10px] ${dark ? "text-slate-400" : "text-slate-500"} tracking-widest uppercase`}>
            Electrical Accessories
          </p>
        )}
      </div>
    </div>
  );
}
