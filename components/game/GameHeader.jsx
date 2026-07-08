"use client";
import { memo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { signOutUser } from "@/lib/firebase/auth";
import { useGameStore } from "@/stores/useGameStore";
import { GameTimer } from "@/components/game/GameTimer";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { glassButtonClass } from "@/lib/ui/app-theme";
import { EASE_OUT } from "@/lib/animations/presets";

export const GameHeader = memo(function GameHeader() {
  const ref = useRef(null);
  const { label, words } = useWeekPuzzle();
  const phase = useGameStore((s) => s.phase);
  const foundWordIds = useGameStore((s) => s.foundWordIds);
  const persisting = useGameStore((s) => s.persisting);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: -12,
        duration: 0.45,
        ease: EASE_OUT,
      });
    },
    { scope: ref }
  );

  const progressSubtitle = `${foundWordIds.length} / ${words.length} words found${
    persisting ? " · Saving" : ""
  }`;

  return (
    <div ref={ref}>
      <PageHeader
        compact
        eyebrow="Discover & Decode"
        title={`${label} Puzzle`}
        subtitle={progressSubtitle}
        maxWidthClass="max-w-7xl"
        actions={
          <>
            {phase === "playing" && <GameTimer />}
            <InteractiveButton
              type="button"
              onClick={() => void signOutUser()}
              className={`${glassButtonClass} px-2.5 py-1.5 text-xs`}
            >
              Sign out
            </InteractiveButton>
          </>
        }
      />
    </div>
  );
});
