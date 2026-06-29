"use client";

import { formatMs } from "@/components/game/GameTimer";
import { ScoreBreakdownPanel } from "@/components/game/ScoreBreakdownPanel";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { ALREADY_PLAYED_MESSAGE } from "@/lib/config/tournament";
import { signOutUser } from "@/lib/firebase/auth";
import { useGameStore } from "@/stores/useGameStore";

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}

export function AlreadyPlayedScreen() {
  const { label, words } = useWeekPuzzle();
  const score = useGameStore((s) => s.score);
  const completionTime = useGameStore((s) => s.completionTime);
  const foundWordIds = useGameStore((s) => s.foundWordIds);
  const hintClickCount = useGameStore((s) => s.hintClickCount);
  const sessionId = useGameStore((s) => s.sessionId);

  const correctCount = foundWordIds.length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {label}
            </h1>
            <p className="text-sm text-zinc-500">Discover &amp; Decode</p>
          </div>
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-semibold">Already played this week</p>
          <p className="mt-1">{ALREADY_PLAYED_MESSAGE}</p>
        </div>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Your score so far</p>
          <p className="mt-1 text-5xl font-bold text-zinc-900 dark:text-zinc-100">
            {score ?? "—"}
          </p>

          {score !== null && (
            <ScoreBreakdownPanel
              correctAnswers={correctCount}
              hintCount={hintClickCount}
              finalScore={score}
            />
          )}

          <div className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800">
            <StatRow
              label="Time consumed"
              value={formatMs(completionTime ?? 0)}
            />
            <StatRow
              label="Words found"
              value={`${correctCount} / ${words.length}`}
            />
            <StatRow label="Hints used" value={hintClickCount} />
          </div>

          {sessionId && (
            <a
              href={`/game/results?session=${sessionId}`}
              className="mt-6 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              View full results
            </a>
          )}
        </section>
      </main>
    </div>
  );
}
