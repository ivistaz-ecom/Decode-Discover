"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { INTRO_IMAGE_DURATION_MS } from "@/lib/config/puzzle";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { useGameStore } from "@/stores/useGameStore";

function getIntroSecondsRemaining(introStartedAt, introDurationMs) {
    if (!introStartedAt) {
        return Math.ceil(introDurationMs / 1000);
    }
    const elapsed = Date.now() - introStartedAt;
    const remaining = introDurationMs - elapsed;
    return Math.max(0, Math.ceil(remaining / 1000));
}

export function FullscreenImageScreen({
    imagePath,
    weekLabel,
    onSkip,
    countdownVisibleAt = 10,
}) {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const footerRef = useRef(null);
    const introStartedAt = useGameStore((s) => s.introStartedAt);
    const introDurationMs = useGameStore((s) => s.introDurationMs) ?? INTRO_IMAGE_DURATION_MS;
    const isDemo = useGameStore((s) => s.isDemo);
    const [secondsLeft, setSecondsLeft] = useState(() =>
        getIntroSecondsRemaining(introStartedAt, introDurationMs)
    );

    useEffect(() => {
        setSecondsLeft(getIntroSecondsRemaining(introStartedAt, introDurationMs));
        const interval = setInterval(() => {
            setSecondsLeft(getIntroSecondsRemaining(introStartedAt, introDurationMs));
        }, 250);
        return () => clearInterval(interval);
    }, [introStartedAt, introDurationMs]);

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
            duration: Math.max(8, introDurationMs / 1000 - 2),
            ease: "none",
            repeat: -1,
            yoyo: true,
        });
    }, { scope: containerRef, dependencies: [introDurationMs] });

    const showCountdown = secondsLeft <= countdownVisibleAt;
    const displaySecondsLeft = showCountdown
        ? Math.max(0, Math.min(countdownVisibleAt, secondsLeft))
        : null;

    return (<div ref={containerRef} className="fixed inset-0 z-40 flex flex-col bg-black">
      {showCountdown && (<div className="absolute left-4 top-4 z-50 sm:left-6 sm:top-6">
          <div className="rounded-xl border border-white/15 bg-black/70 px-4 py-2 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Time remaining
            </p>
            <p className="mt-0.5 text-3xl font-bold tabular-nums text-white sm:text-4xl">
              {displaySecondsLeft}
            </p>
          </div>
        </div>)}

      <div ref={imageRef} className="relative flex-1 origin-center">
        <Image src={imagePath} alt={`${weekLabel} puzzle image`} fill className="object-contain" priority sizes="100vw"/>
      </div>
      <div ref={footerRef} className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/80 px-4 py-3 sm:px-6">
        <p className="text-sm text-white/70">
          {isDemo
              ? "Quick practice — study the image, then find the words."
              : "Study the image — answers are hidden inside."}
        </p>
        <InteractiveButton type="button" onClick={onSkip} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">
          Skip
        </InteractiveButton>
      </div>
    </div>);
}
