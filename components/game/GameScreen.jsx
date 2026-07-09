"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FullscreenImageScreen } from "@/components/game/FullscreenImageScreen";
import { HowToPlayScreen } from "@/components/game/HowToPlayScreen";
import { DemoResultsScreen } from "@/components/game/DemoResultsScreen";
import { AlreadyPlayedScreen } from "@/components/game/AlreadyPlayedScreen";
import { GameHeader } from "@/components/game/GameHeader";
import { GameActionBar } from "@/components/game/GameActionBar";
import { ImageReviewModal } from "@/components/game/ImageReviewModal";
import { QuestionList } from "@/components/game/QuestionList";
import { WordSearchGrid } from "@/components/game/WordSearchGrid";
import { WordFoundCelebration } from "@/components/game/WordFoundCelebration";
import { VictoryOverlay } from "@/components/game/VictoryOverlay";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { celebrateVictory } from "@/lib/animations/celebrate-victory";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { glassPrimaryButtonClass } from "@/lib/ui/app-theme";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
export function GameScreen() {
    const router = useRouter();
    const { label, imagePath } = useWeekPuzzle();
    const user = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.loading);
    const phase = useGameStore((s) => s.phase);
    const playStatus = useGameStore((s) => s.playStatus);
    const isDemo = useGameStore((s) => s.isDemo);
    const gameLoading = useGameStore((s) => s.loading);
    const error = useGameStore((s) => s.error);
    const showImageModal = useGameStore((s) => s.showImageModal);
    const foundWordIds = useGameStore((s) => s.foundWordIds);
    const placedWords = useGameStore((s) => s.placedWords);
    const submitting = useGameStore((s) => s.submitting);
    const initSession = useGameStore((s) => s.initSession);
    const dismissHowToPlay = useGameStore((s) => s.dismissHowToPlay);
    const startDemo = useGameStore((s) => s.startDemo);
    const replayDemo = useGameStore((s) => s.replayDemo);
    const resumeMainGame = useGameStore((s) => s.resumeMainGame);
    const skipIntro = useGameStore((s) => s.skipIntro);
    const closeImageModal = useGameStore((s) => s.closeImageModal);
    const submitAnswers = useGameStore((s) => s.submitAnswers);
    const resetError = useGameStore((s) => s.resetError);
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    const [celebratingVictory, setCelebratingVictory] = useState(false);
    const autoSubmitStarted = useRef(false);
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
        if (!gameLoading && phase === "submitted" && playStatus !== "already_played" && !isDemo) {
            const { sessionId } = useGameStore.getState();
            if (sessionId) {
                router.replace(`/game/results?session=${sessionId}`);
            }
        }
    }, [gameLoading, phase, playStatus, isDemo, router]);
    const handleSubmit = useCallback(async () => {
        await submitAnswers();
        if (useGameStore.getState().isDemo) {
            return;
        }
        const { sessionId } = useGameStore.getState();
        if (sessionId) {
            router.push(`/game/results?session=${sessionId}`);
        }
    }, [submitAnswers, router]);
    useEffect(() => {
        if ((playStatus === "ready" || playStatus === "demo") && foundWordIds.length === 0) {
            autoSubmitStarted.current = false;
            setCelebratingVictory(false);
        }
    }, [playStatus, foundWordIds.length]);
    useEffect(() => {
        if (phase !== "playing" || submitting || celebratingVictory)
            return;
        if (placedWords.length === 0)
            return;
        if (foundWordIds.length < placedWords.length)
            return;
        if (autoSubmitStarted.current)
            return;
        autoSubmitStarted.current = true;
        setCelebratingVictory(true);
        void (async () => {
            if (showImageModal) {
                closeImageModal(true);
            }
            await celebrateVictory();
            await submitAnswers();
            setCelebratingVictory(false);
        })();
    }, [
        phase,
        submitting,
        celebratingVictory,
        placedWords.length,
        foundWordIds.length,
        showImageModal,
        closeImageModal,
        submitAnswers,
    ]);
    useEffect(() => {
        const handleBeforeUnload = () => {
            void useGameStore.getState().persistSession();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);
    if (authLoading || gameLoading) {
        return (<AppShell centered>
        <div className="flex flex-col items-center gap-4 px-4">
        <LoadingSpinner label="Loading game..."/>
        {loadingTimedOut && (<div className="max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
            <p className="font-medium">Still loading?</p>
            <p className="mt-1 text-amber-200/90">
              Make sure <strong>Firestore Database</strong> is enabled in your
              Firebase project, then refresh this page.
            </p>
            <button type="button" onClick={() => window.location.reload()} className={`mt-3 ${glassPrimaryButtonClass}`}>
              Refresh
            </button>
          </div>)}
        </div>
      </AppShell>);
    }
    if (playStatus === "already_played") {
        return <AlreadyPlayedScreen />;
    }
    if (phase === "howToPlay" && playStatus === "ready") {
        return (<HowToPlayScreen onStartDemo={() => startDemo()} onStartMainGame={() => dismissHowToPlay()}/>);
    }
    if (phase === "demoComplete") {
        return (<DemoResultsScreen onStartMainGame={() => resumeMainGame()} onPlayDemoAgain={() => replayDemo()}/>);
    }
    if (playStatus === "error") {
        return (<AppShell className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-300">{error ?? "Something went wrong."}</p>
        <button type="button" onClick={() => window.location.reload()} className={glassPrimaryButtonClass}>
          Refresh
        </button>
      </AppShell>);
    }
    if (phase === "intro") {
        return (<FullscreenImageScreen imagePath={imagePath} weekLabel={label} onSkip={skipIntro} countdownVisibleAt={isDemo ? 5 : 10}/>);
    }
    return (<AppShell className="h-dvh overflow-hidden">
      <WordFoundCelebration />
      <VictoryOverlay show={celebratingVictory}/>
      <GameHeader />

      {error && (<AnimateIn className="shrink-0 px-3 pt-1 sm:px-4">
          <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">
            <span>{error}</span>
            <button type="button" onClick={resetError} className="cursor-pointer underline">
              Dismiss
            </button>
          </div>
        </AnimateIn>)}

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 px-3 py-2 lg:flex-row">
        <GlassPanel className="flex shrink-0 items-center justify-center p-2 sm:p-4 lg:min-h-0 lg:min-w-0 lg:flex-1">
          <div className="aspect-square w-full max-w-[min(100%,calc(100dvh-14rem))] min-h-0 min-w-0 lg:w-[84%] lg:max-h-[84%] lg:max-w-none">
            <WordSearchGrid />
          </div>
        </GlassPanel>

        <GlassPanel className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-3.5 lg:min-h-0">
          <p className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Clues
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <QuestionList />
          </div>
          <GameActionBar onSubmit={() => void handleSubmit()}/>
        </GlassPanel>
      </main>

      <ImageReviewModal open={showImageModal} imagePath={imagePath} onClose={() => closeImageModal(true)}/>
    </AppShell>);
}
