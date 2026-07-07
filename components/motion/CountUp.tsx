"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface CountUpProps {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
}

export function CountUp({
  value,
  className,
  duration = 1.4,
  delay = 0.35,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const counter = { val: 0 };
      gsap.to(counter, {
        val: value,
        duration,
        delay,
        ease: "power2.out",
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = String(Math.round(counter.val));
          }
        },
      });
    },
    { dependencies: [value, duration, delay] }
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
