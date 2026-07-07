"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMs } from "@/components/game/GameTimer";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getWeekLabel } from "@/lib/config/weeks";
import { getCompletionCopy } from "@/lib/game/completion-message";
import { signOutUser } from "@/lib/firebase/auth";
import { getGameSessionById } from "@/lib/firebase/sessions";
import { accentHeadlineClass, bodyMutedClass, glassButtonClass, glassHeaderClass, glassPrimaryButtonClass, pageSubtitleClass, pageTitleClass, } from "@/lib/ui/app-theme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
function StatRow({ label, value }) {
    return (<div data-stagger className="flex items-center justify-between border-b border-[#4a4238] py-[18px] last:border-0">
      <span className="text-base text-[#9c9185]">{label}</span>
      <span className="text-xl font-bold tabular-nums text-[#f4efe6] sm:text-2xl">
        {value}
      </span>
    </div>);
}
export function ResultsScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionParam = searchParams.get("session");
    const user = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.loading);
    const storeSessionId = useGameStore((s) => s.sessionId);
    const storeSubmittedAnswers = useGameStore((s) => s.submittedAnswers);
    const storeFoundWordIds = useGameStore((s) => s.foundWordIds);
    const phase = useGameStore((s) => s.phase);
    const storeWeekNumber = useGameStore((s) => s.weekNumber);
    const storeCompletedAt = useGameStore((s) => s.completedAt);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sessionId = sessionParam ?? storeSessionId;
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);
    useEffect(() => {
        if (authLoading || !user)
            return;
        const useStoreData = phase === "submitted" &&
            storeSessionId &&
            (!sessionParam || sessionParam === storeSessionId) &&
            storeCompletedAt !== null;
        if (useStoreData) {
            setSession({
                uid: user.uid,
                weekNumber: storeWeekNumber,
                startedAt: 0,
                completedAt: storeCompletedAt,
                initialImageViewDuration: useGameStore.getState().initialImageViewDuration,
                popupOpenCount: useGameStore.getState().popupOpenCount,
                popupSessions: useGameStore.getState().popupSessions,
                totalImageViewTime: useGameStore.getState().totalImageViewTime,
                hintUsed: useGameStore.getState().hintUsed,
                hintClickCount: useGameStore.getState().hintClickCount,
                hintFirstClickedAt: useGameStore.getState().hintFirstClickedAt,
                hintLastClickedAt: useGameStore.getState().hintLastClickedAt,
                gameStartedAt: useGameStore.getState().gameStartedAt,
                gameEndedAt: storeCompletedAt,
                completionTime: useGameStore.getState().completionTime,
                correctAnswers: storeFoundWordIds.length,
                score: useGameStore.getState().score,
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
                const data = await getGameSessionById(sessionId);
                if (!data?.completedAt) {
                    setError("This game has not been completed yet.");
                    return;
                }
                setSession(data);
            }
            catch {
                setError("Failed to load results.");
            }
            finally {
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
        storeCompletedAt,
        storeSubmittedAnswers,
        storeWeekNumber,
        storeFoundWordIds,
    ]);
    if (authLoading || loading) {
        return (<AppShell className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading results..."/>
      </AppShell>);
    }
    if (error || !session) {
        return (<AppShell className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-300">{error ?? "Results unavailable."}</p>
        <InteractiveButton type="button" onClick={() => router.push("/game")} className={glassPrimaryButtonClass}>
          Back to game
        </InteractiveButton>
      </AppShell>);
    }
    const totalWords = session.submittedAnswers.length;
    const correctCount = session.correctAnswers ??
        session.submittedAnswers.filter((a) => a.correct).length;
    const weekLabel = getWeekLabel(session.weekNumber ?? 1);
    const copy = getCompletionCopy(correctCount, totalWords, session.weekNumber ?? 1, session.score ?? 0);
    return (<AppShell>
      <AnimateIn as="header" className={`${glassHeaderClass} px-4 py-5 sm:px-6`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <h1 className={pageTitleClass}>Game Complete</h1>
            <p className={pageSubtitleClass}>{weekLabel} — Discover &amp; Decode</p>
          </div>
          <InteractiveButton type="button" onClick={() => void signOutUser()} className={glassButtonClass}>
            Sign out
          </InteractiveButton>
        </div>
      </AnimateIn>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <AnimateIn delay={0.1}>
          <GlassPanel className="p-9 sm:p-12">
            <StaggerGroup className="divide-y divide-[#4a4238]" delay={0.2} stagger={0.08}>
              <StatRow label="Words found" value={totalWords > 0 ? `${correctCount} / ${totalWords}` : correctCount}/>
              <StatRow label="Time consumed" value={formatMs(session.completionTime ?? 0)}/>
            </StaggerGroup>
          </GlassPanel>
        </AnimateIn>

        <AnimateIn delay={0.35}>
          <GlassPanel className="mt-6 p-6 text-center sm:p-8">
            <p className={accentHeadlineClass}>{copy.headline}</p>
            <p className="mt-4 text-base leading-relaxed text-[#d4cdc3]">
              {copy.encouragement}
            </p>
            <p className={`mt-5 leading-relaxed ${bodyMutedClass}`}>
              {copy.weeklyReminder}
            </p>
          </GlassPanel>
        </AnimateIn>
      </main>
    </AppShell>);
}
