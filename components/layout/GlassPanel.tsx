"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { glassPanelClass } from "@/lib/ui/app-theme";
import { EASE_OUT } from "@/lib/animations/presets";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  stagger?: boolean;
}

export function GlassPanel({
  children,
  className = "",
  animate = false,
  stagger = false,
}: GlassPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!animate || !ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: EASE_OUT,
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      {...(stagger ? { "data-stagger": true } : {})}
      className={`relative overflow-hidden ${glassPanelClass} ${className}`}
    >
      {children}
    </div>
  );
}
