"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { SCORING_CONFIG } from "@/lib/config/scoring";
import { useGameStore } from "@/stores/useGameStore";

interface ImageReviewModalProps {
  open: boolean;
  imagePath: string;
  onClose: () => void;
}

export function ImageReviewModal({
  open,
  imagePath,
  onClose,
}: ImageReviewModalProps) {
  const popupOpenCount = useGameStore((s) => s.popupOpenCount);
  const penalty = SCORING_CONFIG.penaltyPerImagePopup;
  const totalDeducted = popupOpenCount * penalty;

  return (
    <Modal open={open} onClose={onClose} title="Newsletter Image" maxWidth="xl">
      <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-semibold">
          −{penalty} points for this image view
        </p>
        <p className="mt-1">
          Every time you view this image, {penalty} points will be deducted from
          your final score.
          {popupOpenCount > 0 && (
            <span className="mt-1 block">
              Total deducted so far: <strong>{totalDeducted} points</strong> (
              {popupOpenCount} {popupOpenCount === 1 ? "view" : "views"})
            </span>
          )}
        </p>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={imagePath}
          alt="Newsletter puzzle image"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 672px"
        />
      </div>

      <p className="mt-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
        All the answers are hidden in this image. Look closely to find every
        word.
      </p>
    </Modal>
  );
}
