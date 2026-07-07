"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { INTRO_IMAGE_DURATION_MS } from "@/lib/config/puzzle";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { useGameStore } from "@/stores/useGameStore";
function getIntroSecondsRemaining(introStartedAt) {
    if (!introStartedAt) {
        return Math.ceil(INTRO_IMAGE_DURATION_MS / 1000);
    }
    const elapsed = Date.now() - introStartedAt;
    const remaining = INTRO_IMAGE_DURATION_MS - elapsed;
    return Math.max(0, Math.ceil(remaining / 1000));
}
export function FullscreenImageScreen({ imagePath, weekLabel, onSkip, }) {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const footerRef = useRef(null);
    const introStartedAt = useGameStore((s) => s.introStartedAt);
    const [secondsLeft, setSecondsLeft] = useState(() => getIntroSecondsRemaining(introStartedAt));
    useEffect(() => {
        setSecondsLeft(getIntroSecondsRemaining(introStartedAt));
        const interval = setInterval(() => {
            setSecondsLeft(getIntroSecondsRemaining(introStartedAt));
        }, 250);
        return () => clearInterval(interval);
    }, [introStartedAt]);
    useGSAP(() => {
        if (!imageRef.current || !footerRef.current)
            return;
        gsap.from(imageRef.current, {
            opacity: 0,
            scale: 1.06,
            duration: 1,
            ease: "power2.out",
        });
        gsap.from(footerRef.current, {
            opacity: 0,
            y: 24,
            duration: 0.6,
            delay: 0.3,
            ease: "power3.out",
        });
        gsap.to(imageRef.current, {
            scale: 1.03,
            duration: 28,
            ease: "none",
            repeat: -1,
            yoyo: true,
        });
    }, { scope: containerRef });
    return (<div ref={containerRef} className="fixed inset-0 z-40 flex flex-col bg-black">
      <div className="absolute left-4 top-4 z-50 sm:left-6 sm:top-6">
        <div className="rounded-xl border border-white/15 bg-black/70 px-4 py-2 text-center backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Time remaining
          </p>
          <p className="mt-0.5 text-3xl font-bold tabular-nums text-white sm:text-4xl">
            {secondsLeft}
          </p>
        </div>
      </div>

      <div ref={imageRef} className="relative flex-1 origin-center">
        <Image src={imagePath} alt={`${weekLabel} puzzle image`} fill className="object-contain" priority sizes="100vw"/>
      </div>
      <div ref={footerRef} className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/80 px-4 py-3 sm:px-6">
        <p className="text-sm text-white/70">
          Study the image — answers are hidden inside.
        </p>
        <InteractiveButton type="button" onClick={onSkip} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">
          Skip
        </InteractiveButton>
      </div>
    </div>);
}
