"use client";
import { formatMs } from "@/components/game/GameTimer";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { useGameStore } from "@/stores/useGameStore";
import {
  accentHeadlineClass,
  bodyMutedClass,
  glassButtonClass,
  glassPrimaryButtonClass,
} from "@/lib/ui/app-theme";

export function DemoResultsScreen({ onStartMainGame, onPlayDemoAgain }) {
  const foundWordIds = useGameStore((s) => s.foundWordIds);
  const placedWords = useGameStore((s) => s.placedWords);
  const score = useGameStore((s) => s.score);
  const completionTime = useGameStore((s) => s.completionTime);
  const popupOpenCount = useGameStore((s) => s.popupOpenCount);

  const totalWords = placedWords.length;
  const foundCount = foundWordIds.length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Practice complete"
        title="Demo finished 🎉"
        subtitle="Nice work — ready for the real puzzle?"
        maxWidthClass="max-w-2xl"
      />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <AnimateIn>
          <GlassPanel className="p-8 text-center sm:p-10">
            <p className={accentHeadlineClass}>Practice round</p>
            <div className="mt-6 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-white/10 py-4">
                <span className="text-slate-400">Words found</span>
                <span className="font-display text-2xl font-bold text-slate-50">
                  {foundCount} / {totalWords}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 py-4">
                <span className="text-slate-400">Practice score</span>
                <span className="font-display text-2xl font-bold text-sky-300">
                  {score ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-slate-400">Time</span>
                <span className="font-display text-xl font-bold text-slate-100">
                  {formatMs(completionTime ?? 0)}
                </span>
              </div>
            </div>

            <p className={`mt-6 leading-relaxed ${bodyMutedClass}`}>
              {foundCount === totalWords
                ? "Perfect! You nailed the practice puzzle. The real game has more words and a bigger grid — you've got this. 🚀"
                : `You found ${foundCount} of ${totalWords} words. Hints used: ${popupOpenCount}. Try again or jump into the main game! 💪`}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <InteractiveButton
                type="button"
                onClick={onPlayDemoAgain}
                className={`flex-1 ${glassButtonClass}`}
              >
                Play demo again
              </InteractiveButton>
              <InteractiveButton
                type="button"
                onClick={onStartMainGame}
                className={`flex-1 ${glassPrimaryButtonClass}`}
              >
                Start main game →
              </InteractiveButton>
            </div>
          </GlassPanel>
        </AnimateIn>
      </main>
    </AppShell>
  );
}
