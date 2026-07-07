"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { attachHoverLift } from "@/lib/animations/presets";
export function InteractiveButton({ children, className = "", ...props }) {
    const ref = useRef(null);
    useGSAP(() => {
        if (!ref.current)
            return;
        return attachHoverLift(ref.current);
    }, { scope: ref });
    return (<button ref={ref} className={className} {...props}>
      {children}
    </button>);
}
