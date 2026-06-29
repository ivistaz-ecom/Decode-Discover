"use client";

import Image from "next/image";

interface FullscreenImageScreenProps {
  imagePath: string;
  weekLabel: string;
  onSkip: () => void;
}

export function FullscreenImageScreen({
  imagePath,
  weekLabel,
  onSkip,
}: FullscreenImageScreenProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black">
      <div className="relative flex-1">
        <Image
          src={imagePath}
          alt={`${weekLabel} puzzle image`}
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/80 px-4 py-3 sm:px-6">
        <p className="text-sm text-white/70">
          Study the newsletter — answers are hidden inside.
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
