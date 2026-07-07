"use client";

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { attachHoverLift } from "@/lib/animations/presets";

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function InteractiveButton({
  children,
  className = "",
  ...props
}: InteractiveButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      return attachHoverLift(ref.current);
    },
    { scope: ref }
  );

  return (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  );
}
