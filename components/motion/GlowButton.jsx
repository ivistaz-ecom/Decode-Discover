"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
export function GlowButton({ children, className = "", disabled, interactive = true, ...props }) {
    const ref = useRef(null);
    const shineRef = useRef(null);
    useGSAP(() => {
        const el = ref.current;
        const shine = shineRef.current;
        if (!el || !interactive || disabled)
            return;
        const onMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            gsap.to(el, {
                x: x * 0.18,
                y: y * 0.22,
                scale: 1.02,
                duration: 0.4,
                ease: "power2.out",
            });
            if (shine) {
                const localX = ((e.clientX - rect.left) / rect.width) * 100;
                gsap.to(shine, {
                    left: `${localX}%`,
                    opacity: 0.55,
                    duration: 0.25,
                });
            }
        };
        const onEnter = () => {
            gsap.to(el, { boxShadow: "0 12px 40px rgba(34,211,238,0.35)", duration: 0.3 });
        };
        const onLeave = () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                scale: 1,
                boxShadow: "0 8px 32px rgba(14,116,144,0.25)",
                duration: 0.55,
                ease: "elastic.out(1, 0.55)",
            });
            if (shine) {
                gsap.to(shine, { opacity: 0, duration: 0.3 });
            }
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, { scope: ref, dependencies: [interactive, disabled] });
    return (<button ref={ref} disabled={disabled} className={`relative cursor-pointer overflow-hidden ${className}`} {...props}>
      <span ref={shineRef} className="pointer-events-none absolute top-0 h-full w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0" aria-hidden/>
      <span className="relative z-10">{children}</span>
    </button>);
}
