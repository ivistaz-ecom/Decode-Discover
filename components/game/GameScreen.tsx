"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FullscreenImageScreen } from "@/components/game/FullscreenImageScreen";
import { AlreadyPlayedScreen } from "@/components/game/AlreadyPlayedScreen";
import { GameTimer } from "@/components/game/GameTimer";
import { ImageReviewModal } from "@/components/game/ImageReviewModal";
import { QuestionList } from "@/components/game/QuestionList";
import { WordList } from "@/components/game/WordList";
import { WordSearchGrid } from "@/components/game/WordSearchGrid";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { signOutUser } from "@/lib/firebase/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

export function GameScreen() {
  const router = useRouter();
  const { label, words, imagePath } = useWeekPuzzle();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const phase = useGameStore((s) => s.phase);
  const playStatus = useGameStore((s) => s.playStatus);
  const gameLoading = useGameStore((s) => s.loading);
  const saving = useGameStore((s) => s.saving);
  const error = useGameStore((s) => s.error);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const foundWordIds = useGameStore((s) => s.foundWordIds);
  const showImageModal = useGameStore((s) => s.showImageModal);

  const initSession = useGameStore((s) => s.initSession);
  const skipIntro = useGameStore((s) => s.skipIntro);
  const openHintModal = useGameStore((s) => s.openHintModal);
  const closeImageModal = useGameStore((s) => s.closeImageModal);
  const submitAnswers = useGameStore((s) => s.submitAnswers);
  const resetError = useGameStore((s) => s.resetError);

  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !gameLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setLoadingTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [authLoading, gameLoading]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      void initSession(user.uid);
    }
  }, [user, initSession]);

  useEffect(() => {
    if (!gameLoading && phase === "submitted" && playStatus !== "already_played") {
      const { sessionId } = useGameStore.getState();
      if (sessionId) {
        router.replace(`/game/results?session=${sessionId}`);
      }
    }
  }, [gameLoading, phase, playStatus, router]);

  const handleSubmit = async () => {
    await submitAnswers();
    const { sessionId } = useGameStore.getState();
    if (sessionId) {
      router.push(`/game/results?session=${sessionId}`);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      void useGameStore.getState().persistSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (authLoading || gameLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <LoadingSpinner label="Loading game..." />
        {loadingTimedOut && (
          <div className="max-w-md rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            <p className="font-medium">Still loading?</p>
            <p className="mt-1">
              Make sure <strong>Firestore Database</strong> is enabled in your
              Firebase project, then refresh this page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-white"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    );
  }

  if (playStatus === "already_played") {
    return <AlreadyPlayedScreen />;
  }

  if (playStatus === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-600">{error ?? "Something went wrong."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <FullscreenImageScreen imagePath={imagePath} weekLabel={label} onSkip={skipIntro} />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {label} Puzzle
            </h1>
            <p className="text-sm text-zinc-500">
              {foundWordIds.length} / {words.length} words found
              {saving && " · Saving..."}
            </p>
          </div>
          {phase === "playing" && <GameTimer elapsedMs={elapsedMs} />}
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            <span>{error}</span>
            <button type="button" onClick={resetError} className="underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Word Search
          </h2>
          <WordSearchGrid />
          <WordList />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Clues
          </h2>
          <QuestionList />

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openHintModal}
              disabled={phase === "submitted"}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Hint (−5 pts)
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={phase === "submitted" || saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {saving ? "Submitting..." : "Submit Answers"}
            </button>
          </div>
        </section>
      </main>

      <ImageReviewModal
        open={showImageModal}
        imagePath={imagePath}
        onClose={() => closeImageModal(true)}
      />
    </div>
  );
}
