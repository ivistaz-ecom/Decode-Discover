"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMs } from "@/components/game/GameTimer";
import { NewsletterImagePanel } from "@/components/game/NewsletterImagePanel";
import { ReviewAnswersModal } from "@/components/game/ReviewAnswersModal";
import { ScoreBreakdownPanel } from "@/components/game/ScoreBreakdownPanel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getWeekConfig, getWeekLabel } from "@/lib/config/weeks";
import { signOutUser } from "@/lib/firebase/auth";
import { getGameSessionById } from "@/lib/firebase/sessions";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import type { GameSession } from "@/types/session";

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

export function ResultsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  const storeSessionId = useGameStore((s) => s.sessionId);
  const storeScore = useGameStore((s) => s.score);
  const storeCompletionTime = useGameStore((s) => s.completionTime);
  const storeSubmittedAnswers = useGameStore((s) => s.submittedAnswers);
  const storeHintClickCount = useGameStore((s) => s.hintClickCount);
  const storePopupOpenCount = useGameStore((s) => s.popupOpenCount);
  const storeTotalImageViewTime = useGameStore((s) => s.totalImageViewTime);
  const storeFoundWordIds = useGameStore((s) => s.foundWordIds);
  const phase = useGameStore((s) => s.phase);
  const storeWeekNumber = useGameStore((s) => s.weekNumber);

  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  const sessionId = sessionParam ?? storeSessionId;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    const useStoreData =
      phase === "submitted" &&
      storeSessionId &&
      (!sessionParam || sessionParam === storeSessionId) &&
      storeScore !== null;

    if (useStoreData) {
      setSession({
        uid: user.uid,
        weekNumber: storeWeekNumber,
        startedAt: 0,
        completedAt: Date.now(),
        initialImageViewDuration: useGameStore.getState().initialImageViewDuration,
        popupOpenCount: storePopupOpenCount,
        popupSessions: useGameStore.getState().popupSessions,
        totalImageViewTime: storeTotalImageViewTime,
        hintUsed: useGameStore.getState().hintUsed,
        hintClickCount: storeHintClickCount,
        hintFirstClickedAt: useGameStore.getState().hintFirstClickedAt,
        hintLastClickedAt: useGameStore.getState().hintLastClickedAt,
        gameStartedAt: useGameStore.getState().gameStartedAt,
        gameEndedAt: useGameStore.getState().completedAt,
        completionTime: storeCompletionTime,
        correctAnswers: storeFoundWordIds.length,
        score: storeScore,
        submittedAnswers: storeSubmittedAnswers,
        foundWordIds: storeFoundWordIds,
      });
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setError("No completed game found.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getGameSessionById(sessionId!);
        if (!data?.completedAt || data.score === null) {
          setError("This game has not been completed yet.");
          return;
        }
        setSession(data);
      } catch {
        setError("Failed to load results.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [
    authLoading,
    user,
    sessionId,
    sessionParam,
    phase,
    storeSessionId,
    storeScore,
    storeCompletionTime,
    storeSubmittedAnswers,
    storeHintClickCount,
    storePopupOpenCount,
    storeTotalImageViewTime,
    storeWeekNumber,
  ]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading results..." />
      </div>
    );
  }

  if (error || !session || session.score === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-600">{error ?? "Results unavailable."}</p>
        <button
          type="button"
          onClick={() => router.push("/game")}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Back to game
        </button>
      </div>
    );
  }

  const weekConfig = getWeekConfig(session.weekNumber ?? 1);
  const weekWords = weekConfig?.words ?? [];
  const missedCount = session.submittedAnswers.filter((a) => !a.correct).length;
  const hasMissed = missedCount > 0;
  const totalWords = weekWords.length;
  const correctCount =
    session.correctAnswers ?? session.submittedAnswers.filter((a) => a.correct).length;
  const weekLabel = getWeekLabel(session.weekNumber ?? 1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Game Complete
            </h1>
            <p className="text-sm text-zinc-500">Here&apos;s how you did</p>
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {weekLabel} Image
            </h2>
            <NewsletterImagePanel
              imagePath={weekConfig?.imagePath}
              weekLabel={weekLabel}
            />
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">Final score</p>
            <p className="mt-1 text-5xl font-bold text-zinc-900 dark:text-zinc-100">
              {session.score}
            </p>

            <ScoreBreakdownPanel
              correctAnswers={correctCount}
              hintCount={session.hintClickCount}
              finalScore={session.score}
            />

            <div className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800">
              <StatRow
                label="Time consumed"
                value={formatMs(session.completionTime ?? 0)}
              />
              <StatRow
                label="Words found"
                value={`${correctCount} / ${totalWords}`}
              />
              <StatRow label="Hints used" value={session.hintClickCount} />
              <StatRow
                label="Initial newsletter view"
                value={formatMs(session.initialImageViewDuration)}
              />
            </div>

            {hasMissed && (
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="mt-6 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Review answers ({missedCount} missed)
              </button>
            )}

            {!hasMissed && (
              <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                Perfect score — you found every word!
              </p>
            )}
          </section>
        </div>
      </main>

      <ReviewAnswersModal
        open={showReview}
        onClose={() => setShowReview(false)}
        submittedAnswers={session.submittedAnswers}
        words={weekWords}
      />
    </div>
  );
}
