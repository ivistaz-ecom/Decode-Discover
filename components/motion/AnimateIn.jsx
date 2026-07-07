"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { EASE_OUT } from "@/lib/animations/presets";
export function AnimateIn({ children, className, delay = 0, y = 28, duration = 0.65, as: Tag = "div", }) {
    const ref = useRef(null);
    useGSAP(() => {
        if (!ref.current)
            return;
        gsap.from(ref.current, {
            opacity: 0,
            y,
            duration,
            delay,
            ease: EASE_OUT,
        });
    }, { scope: ref, dependencies: [delay, y, duration] });
    return (<Tag ref={ref} className={className}>
      {children}
    </Tag>);
}
