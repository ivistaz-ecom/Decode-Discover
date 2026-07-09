"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMs } from "@/components/game/GameTimer";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getWeekLabel } from "@/lib/config/weeks";
import { getCompletionCopy } from "@/lib/game/completion-message";
import { signOutUser } from "@/lib/firebase/auth";
import { getGameSessionById } from "@/lib/firebase/sessions";
import { accentHeadlineClass, glassButtonClass, glassPrimaryButtonClass, } from "@/lib/ui/app-theme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
function StatRow({ label, value }) {
    return (<div data-stagger className="flex items-center justify-between border-b border-white/10 py-[18px] last:border-0">
      <span className="text-base text-slate-400">{label}</span>
      <span className="text-xl font-bold tabular-nums text-slate-100 sm:text-2xl">
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
      <AnimateIn>
        <PageHeader
          title="Game Complete 🎉"
          subtitle={`${weekLabel} — Discover & Decode`}
          maxWidthClass="max-w-4xl"
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
          <GlassPanel className="p-8 sm:p-10">
            <StaggerGroup className="divide-y divide-white/10" delay={0.2} stagger={0.08}>
              <StatRow label="Words found" value={totalWords > 0 ? `${correctCount} / ${totalWords}` : correctCount}/>
              <StatRow label="Time consumed" value={formatMs(session.completionTime ?? 0)}/>
            </StaggerGroup>
            <div className="mt-7 border-t border-white/10 pt-7 text-center">
              <p className={accentHeadlineClass}>{copy.headline}</p>
              <p className="mt-4 text-base leading-relaxed text-slate-200/90">
                {copy.encouragement}
              </p>
              <div className="mt-5 rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 py-3.5 text-sm leading-relaxed text-sky-100 sm:text-base">
                {copy.weeklyReminder}
              </div>
            </div>
          </GlassPanel>
        </AnimateIn>
      </main>
    </AppShell>);
}
