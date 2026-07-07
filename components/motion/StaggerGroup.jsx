"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { EASE_OUT } from "@/lib/animations/presets";
export function StaggerGroup({ children, className, childSelector = "[data-stagger]", delay = 0.1, stagger = 0.08, y = 20, }) {
    const ref = useRef(null);
    useGSAP(() => {
        const items = ref.current?.querySelectorAll(childSelector);
        if (!items?.length)
            return;
        gsap.from(items, {
            opacity: 0,
            y,
            duration: 0.55,
            delay,
            stagger,
            ease: EASE_OUT,
        });
    }, { scope: ref });
    return (<div ref={ref} className={className}>
      {children}
    </div>);
}
