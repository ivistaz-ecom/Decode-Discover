"use client";

import type { ReactNode } from "react";
import { AppBackground } from "@/components/layout/AppBackground";

interface AppShellProps {
  children: ReactNode;
  showCursor?: boolean;
  className?: string;
}

export function AppShell({
  children,
  showCursor = false,
  className = "",
}: AppShellProps) {
  return (
    <div className={`relative flex min-h-screen flex-col text-[#e8dfd3] ${className}`}>
      <AppBackground showCursor={showCursor} />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
