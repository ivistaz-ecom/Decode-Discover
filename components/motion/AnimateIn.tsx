"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { EASE_OUT } from "@/lib/animations/presets";

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  as?: "div" | "section" | "header" | "main" | "article" | "li";
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.65,
  as: Tag = "div",
}: AnimateInProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        y,
        duration,
        delay,
        ease: EASE_OUT,
      });
    },
    { scope: ref, dependencies: [delay, y, duration] }
  );

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
