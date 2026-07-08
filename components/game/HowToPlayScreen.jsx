"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { SCORING_CONFIG } from "@/lib/config/scoring";
import { formatWeekSchedule } from "@/lib/config/weeks";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { glassButtonClass, glassPrimaryButtonClass } from "@/lib/ui/app-theme";

function RuleItem({ icon, children }) {
  return (
    <li className="flex items-start justify-center gap-2.5 text-center text-[14px] leading-relaxed text-slate-200 sm:text-[15px]">
      <span className="shrink-0" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function HowToPlayScreen({ onStartDemo, onStartMainGame }) {
  const { label, weekNumber } = useWeekPuzzle();
  const schedule = formatWeekSchedule(weekNumber);
  const pointsPerWord = SCORING_CONFIG.pointsPerCorrectAnswer;
  const hintPenalty = SCORING_CONFIG.penaltyPerImagePopup;

  return (
    <AppShell className="h-dvh overflow-hidden">
      <PageHeader
        compact
        title="How to play"
        subtitle={schedule ? `${label} — ${schedule}` : label}
        maxWidthClass="max-w-[35.8rem]"
      />

      <main className="mx-auto flex min-h-0 w-full max-w-[35.8rem] flex-1 items-center justify-center px-3 py-3 sm:px-4">
        <AnimateIn className="flex w-full justify-center">
          <GlassPanel className="flex min-h-[56dvh] w-full flex-col p-5 sm:p-6">
            <div className="flex flex-1 flex-col justify-end pt-8">
              <p className="text-center text-[14px] leading-relaxed text-slate-400 sm:text-[15px]">
                Study the puzzle image, then find hidden words in the grid.
              </p>

              <ul className="mx-auto mt-5 max-w-md space-y-3">
                <RuleItem icon="🖼️">
                  <strong>Study the image</strong> — 30s before the grid unlocks.
                </RuleItem>
                <RuleItem icon="👆">
                  <strong>Drag across letters</strong> — right, down, or ↘.
                </RuleItem>
                <RuleItem icon="💡">
                  <strong>Hint</strong> reopens the image — <strong>-{hintPenalty} pts</strong>{" "}
                  each.
                </RuleItem>
                <RuleItem icon="🏁">
                  <strong>One attempt per week.</strong> Find all words to auto-submit.
                </RuleItem>
              </ul>

              <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[14px] text-amber-100 sm:text-[15px]">
                <p className="text-center font-semibold">
                  ⚠️ Submit only after finding all words.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-sky-400/25 bg-sky-500/10 px-4 py-3.5 text-[14px] text-slate-200 sm:text-[15px]">
                <p className="text-center font-semibold uppercase tracking-wide text-sky-200">
                  Scoring
                </p>
                <p className="mt-2 text-center">
                  ✅ +{pointsPerWord} per word · 💡 -{hintPenalty} per hint · Overall = sum of
                  all weeks
                </p>
                <p className="mt-1 text-center text-[13px] text-slate-400 sm:text-[14px]">
                  e.g. 10 words, 1 hint → {10 * pointsPerWord - hintPenalty} pts
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-2.5 sm:grid-cols-2">
              <InteractiveButton
                type="button"
                onClick={onStartDemo}
                className={`rounded-lg px-3 py-2.5 text-center text-[14px] sm:text-[15px] ${glassPrimaryButtonClass}`}
              >
                <span className="block font-display font-semibold">▶️ Play Demo</span>
                <span className="mt-1 block text-[12px] font-normal text-sky-50/85 sm:text-[13px]">
                  5×5 practice · 4 words
                </span>
              </InteractiveButton>

              <InteractiveButton
                type="button"
                onClick={onStartMainGame}
                className={`rounded-lg px-3 py-2.5 text-center text-[14px] font-semibold sm:text-[15px] ${glassButtonClass}`}
              >
                Start Main Game
              </InteractiveButton>
            </div>
          </GlassPanel>
        </AnimateIn>
      </main>
    </AppShell>
  );
}
