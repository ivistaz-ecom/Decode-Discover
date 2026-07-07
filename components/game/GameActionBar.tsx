"use client";

import { memo } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { GlowButton } from "@/components/motion/GlowButton";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { glassButtonClass, glassPrimaryButtonClass } from "@/lib/ui/app-theme";

interface GameActionBarProps {
  onSubmit: () => void;
}

export const GameActionBar = memo(function GameActionBar({
  onSubmit,
}: GameActionBarProps) {
  const phase = useGameStore((s) => s.phase);
  const submitting = useGameStore((s) => s.submitting);
  const openHintModal = useGameStore((s) => s.openHintModal);

  return (
    <div className="mt-3 flex shrink-0 gap-2">
      <InteractiveButton
        type="button"
        onClick={openHintModal}
        disabled={phase === "submitted"}
        className={`${glassButtonClass} flex-1 px-3 py-2 text-xs sm:text-sm disabled:opacity-50`}
      >
        Hint
      </InteractiveButton>
      <GlowButton
        type="button"
        onClick={onSubmit}
        disabled={phase === "submitted" || submitting}
        className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm ${glassPrimaryButtonClass}`}
      >
        {submitting ? "Submitting…" : "Submit"}
      </GlowButton>
    </div>
  );
});
