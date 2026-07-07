export function LoadingSpinner({ label = "Loading...", className = "", }) {
    return (<div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5c5348] border-t-[#c4704a]" role="status" aria-label={label}/>
      <p className="text-sm text-[#9c9185]">{label}</p>
    </div>);
}
