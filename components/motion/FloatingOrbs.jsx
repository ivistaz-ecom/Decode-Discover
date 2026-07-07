"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
export function FloatingOrbs() {
    const ref = useRef(null);
    useGSAP(() => {
        const orbs = ref.current?.querySelectorAll("[data-orb]");
        if (!orbs?.length)
            return;
        orbs.forEach((orb, index) => {
            gsap.to(orb, {
                x: index % 2 === 0 ? 40 : -36,
                y: index % 2 === 0 ? -28 : 34,
                duration: 5 + index * 0.9,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
            gsap.to(orb, {
                scale: 1.2,
                opacity: 0.9,
                duration: 3.5 + index * 0.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: index * 0.35,
            });
        });
    }, { scope: ref });
    return (<div ref={ref} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <div data-orb className="absolute -left-20 top-[18%] h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl"/>
      <div data-orb className="absolute -right-16 top-[28%] h-80 w-80 rounded-full bg-indigo-500/22 blur-3xl"/>
      <div data-orb className="absolute bottom-[18%] left-[28%] h-64 w-64 rounded-full bg-blue-500/18 blur-3xl"/>
      <div data-orb className="absolute left-1/2 top-[8%] h-48 w-48 -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl"/>
    </div>);
}
