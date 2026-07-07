"use client";
import { AppBackground } from "@/components/layout/AppBackground";
export function AppShell({ children, showCursor = false, className = "", }) {
    return (<div className={`relative flex min-h-screen flex-col text-[#e8dfd3] ${className}`}>
      <AppBackground showCursor={showCursor}/>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>);
}
