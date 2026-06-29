"use client";

import Image from "next/image";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";

interface NewsletterImagePanelProps {
  className?: string;
  imagePath?: string;
  weekLabel?: string;
}

export function NewsletterImagePanel({
  className = "",
  imagePath: imagePathProp,
  weekLabel: weekLabelProp,
}: NewsletterImagePanelProps) {
  const puzzle = useWeekPuzzle();
  const imagePath = imagePathProp ?? puzzle.imagePath;
  const label = weekLabelProp ?? puzzle.label;

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <Image
        src={imagePath}
        alt={`${label} puzzle image`}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, 480px"
      />
    </div>
  );
}
