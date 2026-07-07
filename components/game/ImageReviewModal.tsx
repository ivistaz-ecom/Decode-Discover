"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";

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
  return (
    <Modal open={open} onClose={onClose} title="Puzzle Image" maxWidth="xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={imagePath}
          alt="Puzzle reference image"
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
