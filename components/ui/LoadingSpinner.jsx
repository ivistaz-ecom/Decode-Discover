export function LoadingSpinner({ label = "Loading...", className = "", }) {
    return (<div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-sky-400" role="status" aria-label={label}/>
      <p className="text-sm text-slate-400">{label}</p>
    </div>);
}
