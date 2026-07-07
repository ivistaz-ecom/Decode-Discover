"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
export function MagneticTarget({ children, className = "", strength = 0.28, as: Tag = "div", }) {
    const ref = useRef(null);
    useGSAP(() => {
        const el = ref.current;
        if (!el)
            return;
        const onMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            gsap.to(el, {
                x: x * strength,
                y: y * strength,
                duration: 0.45,
                ease: "power2.out",
            });
        };
        const onLeave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, { scope: ref });
    return (<Tag ref={ref} className={className}>
      {children}
    </Tag>);
}
