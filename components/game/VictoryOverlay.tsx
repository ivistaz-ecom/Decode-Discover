"use client";

import { AnimateIn } from "@/components/motion/AnimateIn";

interface VictoryOverlayProps {
  show: boolean;
}

export function VictoryOverlay({ show }: VictoryOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <AnimateIn className="mx-4 max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#c9a86c]">
          Puzzle complete
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          All words found!
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Celebrating your win — submitting your answers…
        </p>
      </AnimateIn>
    </div>
  );
}
