"use client";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { ALREADY_PLAYED_MESSAGE } from "@/lib/config/tournament";
import { signOutUser } from "@/lib/firebase/auth";
import { bodyMutedClass, glassButtonClass } from "@/lib/ui/app-theme";
import { useGameStore } from "@/stores/useGameStore";
export function AlreadyPlayedScreen() {
    const { label, words } = useWeekPuzzle();
    const foundWordIds = useGameStore((s) => s.foundWordIds);
    const correctCount = foundWordIds.length;
    return (<AppShell>
      <AnimateIn>
        <PageHeader
          title={label}
          subtitle="Discover & Decode"
          maxWidthClass="max-w-2xl"
          actions={
            <InteractiveButton
              type="button"
              onClick={() => void signOutUser()}
              className={glassButtonClass}
            >
              Sign out
            </InteractiveButton>
          }
        />
      </AnimateIn>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <AnimateIn delay={0.1}>
          <div className="rounded-xl border border-amber-800/40 bg-amber-950/25 px-5 py-4 text-sm text-amber-100">
            <p className="font-semibold">Already played this week</p>
            <p className="mt-1 text-amber-200/90">{ALREADY_PLAYED_MESSAGE}</p>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.2}>
          <GlassPanel className="mt-6 p-6 text-center">
            <p className={`text-sm font-medium ${bodyMutedClass}`}>Submission recorded</p>
            <p className="mt-2 text-lg font-semibold text-[#f4efe6]">
              You&apos;ve already completed this week&apos;s puzzle.
            </p>
            <p className={`mt-3 leading-relaxed ${bodyMutedClass}`}>
              Scores are kept private and will be shared by the organizers later.
            </p>
            <p className="mt-6 text-sm text-[#d4cdc3]">
              Words found:{" "}
              <span className="font-semibold text-[#f4efe6]">
                {correctCount} / {words.length}
              </span>
            </p>
          </GlassPanel>
        </AnimateIn>
      </main>
    </AppShell>);
}
