"use client";
import { memo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { signOutUser } from "@/lib/firebase/auth";
import { useGameStore } from "@/stores/useGameStore";
import { GameTimer } from "@/components/game/GameTimer";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { glassButtonClass, glassHeaderClass } from "@/lib/ui/app-theme";
import { EASE_OUT } from "@/lib/animations/presets";
export const GameHeader = memo(function GameHeader() {
    const ref = useRef(null);
    const { label, words } = useWeekPuzzle();
    const phase = useGameStore((s) => s.phase);
    const foundWordIds = useGameStore((s) => s.foundWordIds);
    const persisting = useGameStore((s) => s.persisting);
    useGSAP(() => {
        if (!ref.current)
            return;
        gsap.from(ref.current, {
            opacity: 0,
            y: -12,
            duration: 0.45,
            ease: EASE_OUT,
        });
    }, { scope: ref });
    return (<header ref={ref} className={`shrink-0 ${glassHeaderClass} px-3 py-2 sm:px-4`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-[#f4efe6] sm:text-base">
            {label} Puzzle
          </h1>
          <p className="text-[11px] text-[#9c9185] sm:text-xs">
            {foundWordIds.length} / {words.length} found
            {persisting && <span className="text-[#6b6358]"> · Saving</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {phase === "playing" && <GameTimer />}
          <InteractiveButton type="button" onClick={() => void signOutUser()} className={`${glassButtonClass} px-2.5 py-1.5 text-xs`}>
            Sign out
          </InteractiveButton>
        </div>
      </div>
    </header>);
});
