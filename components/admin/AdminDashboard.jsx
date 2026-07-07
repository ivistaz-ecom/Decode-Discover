"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardTable } from "@/components/admin/LeaderboardTable";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isAdminEmail } from "@/lib/config/admin";
import { getActiveWeekNumber } from "@/lib/config/weeks";
import { getLeaderboard } from "@/lib/firebase/sessions";
import { signOutUser } from "@/lib/firebase/auth";
import {
  glassButtonClass,
  glassHeaderClass,
  glassPrimaryButtonClass,
  pageSubtitleClass,
  pageTitleClass,
} from "@/lib/ui/app-theme";
import { useAuthStore } from "@/stores/useAuthStore";

function tabButtonClass(isActive) {
  return [
    "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-[#c4704a] text-[#fff8f2] shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
      : "border border-[#5c5348] bg-[#322e28] text-[#e8dfd3] hover:border-[#c4704a]/45 hover:bg-[#3a3530]",
  ].join(" ");
}

export function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [leaderboard, setLeaderboard] = useState({ weeks: [], overall: [] });
  const [viewMode, setViewMode] = useState("weekly");
  const [selectedWeek, setSelectedWeek] = useState(getActiveWeekNumber);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      router.replace("/game");
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch {
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isAdmin]);

  const selectedWeekData = useMemo(
    () => leaderboard.weeks.find((week) => week.weekNumber === selectedWeek),
    [leaderboard.weeks, selectedWeek]
  );

  const subtitle =
    viewMode === "overall"
      ? "Combined scores across all weeks (highest total first)"
      : `${selectedWeekData?.label ?? `Week ${selectedWeek}`} scores (highest first)`;

  if (authLoading || loading) {
    return (
      <AppShell className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading admin..." />
      </AppShell>
    );
  }

  if (!isAdmin) return null;

  return (
    <AppShell>
      <AnimateIn as="header" className={`${glassHeaderClass} px-4 py-4 sm:px-6`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className={pageTitleClass}>Admin Leaderboard</h1>
            <p className={pageSubtitleClass}>{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <InteractiveButton
              type="button"
              onClick={() => router.push("/game")}
              className={glassButtonClass}
            >
              Back to Game
            </InteractiveButton>
            <InteractiveButton
              type="button"
              onClick={() => void signOutUser()}
              className={glassPrimaryButtonClass}
            >
              Sign out
            </InteractiveButton>
          </div>
        </div>
      </AnimateIn>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <GlassPanel className="p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("weekly")}
              className={tabButtonClass(viewMode === "weekly")}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setViewMode("overall")}
              className={tabButtonClass(viewMode === "overall")}
            >
              Overall
            </button>
          </div>

          {viewMode === "weekly" && (
            <div className="mb-5 flex flex-wrap gap-2">
              {leaderboard.weeks.map((week) => (
                <button
                  key={week.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeek(week.weekNumber)}
                  className={tabButtonClass(selectedWeek === week.weekNumber)}
                >
                  {week.label}
                </button>
              ))}
            </div>
          )}

          {viewMode === "weekly" ? (
            <LeaderboardTable
              mode="weekly"
              entries={selectedWeekData?.entries ?? []}
            />
          ) : (
            <LeaderboardTable mode="overall" entries={leaderboard.overall} />
          )}
        </GlassPanel>
      </main>
    </AppShell>
  );
}
