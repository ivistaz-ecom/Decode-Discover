"use client";
import { AppBackground } from "@/components/layout/AppBackground";
export function AppShell({ children, showCursor = false, className = "", centered = false, }) {
    return (<div className={`relative flex min-h-dvh flex-col text-slate-200 ${className}`}>
      <AppBackground showCursor={showCursor}/>
      <div className={`relative z-10 flex min-h-0 flex-1 flex-col ${centered ? "items-center justify-center" : ""}`}>{children}</div>
    </div>);
}
