"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncompletePlayersTable } from "@/components/admin/IncompletePlayersTable";
import { LeaderboardTable } from "@/components/admin/LeaderboardTable";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isAdminEmail } from "@/lib/config/admin";
import { getActiveWeekNumber } from "@/lib/config/weeks";
import { getLeaderboard } from "@/lib/firebase/sessions";
import { signOutUser } from "@/lib/firebase/auth";
import {
  glassButtonClass,
  glassPrimaryButtonClass,
  inputClass,
} from "@/lib/ui/app-theme";
import { useAuthStore } from "@/stores/useAuthStore";

function tabButtonClass(isActive) {
  return [
    "cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-sky-500 text-white shadow-[0_8px_24px_rgba(56,189,248,0.35)]"
      : "border border-white/10 bg-white/5 text-slate-300 hover:border-sky-400/40 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-sky-400/30 hover:bg-sky-500/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-slate-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [leaderboard, setLeaderboard] = useState({ weeks: [], overall: [] });
  const [viewMode, setViewMode] = useState("weekly");
  const [selectedWeek, setSelectedWeek] = useState(getActiveWeekNumber);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isAdmin = isAdminEmail(user?.email);

  const loadLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch {
      setError("Failed to load leaderboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    void loadLeaderboard();
  }, [isAdmin, loadLeaderboard]);

  const selectedWeekData = useMemo(
    () => leaderboard.weeks.find((week) => week.weekNumber === selectedWeek),
    [leaderboard.weeks, selectedWeek]
  );

  const activeEntries =
    viewMode === "overall" ? leaderboard.overall : (selectedWeekData?.entries ?? []);
  const incompleteEntries = selectedWeekData?.incompleteEntries ?? [];

  const stats = useMemo(() => {
    const scores = activeEntries.map((entry) =>
      viewMode === "overall" ? entry.totalScore : entry.score
    );
    const totalPlayers = activeEntries.length;
    const topScore = scores.length ? Math.max(...scores) : 0;
    const avgScore = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
    const incompletePlayers = viewMode === "weekly" ? incompleteEntries.length : 0;

    return { totalPlayers, topScore, avgScore, incompletePlayers };
  }, [activeEntries, incompleteEntries.length, viewMode]);

  const subtitle =
    viewMode === "overall"
      ? "Combined scores across all weeks (highest total first)"
      : `${selectedWeekData?.label ?? `Week ${selectedWeek}`} scores (highest first)`;

  if (authLoading || loading) {
    return (
      <AppShell centered>
        <LoadingSpinner label="Loading admin..." />
      </AppShell>
    );
  }

  if (!isAdmin) return null;

  return (
    <AppShell>
      <AnimateIn>
        <PageHeader
          eyebrow="Admin"
          title="Leaderboard"
          subtitle={subtitle}
          actions={
            <>
              <InteractiveButton
                type="button"
                onClick={() => void loadLeaderboard(true)}
                disabled={refreshing}
                className={glassButtonClass}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </InteractiveButton>
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
            </>
          }
        />
      </AnimateIn>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className={`mb-5 grid gap-3 ${viewMode === "weekly" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
          <StatCard label="Submitted" value={stats.totalPlayers} hint="Completed this view" />
          <StatCard label="Top score" value={stats.topScore} hint="Highest in this list" />
          <StatCard label="Average score" value={stats.avgScore} hint="Across submitted players" />
          {viewMode === "weekly" ? (
            <StatCard
              label="Not submitted"
              value={stats.incompletePlayers}
              hint="Logged in, no submit"
            />
          ) : null}
        </div>

        <GlassPanel className="p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
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

            <div className="w-full lg:max-w-xs">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or email..."
                className={inputClass}
              />
            </div>
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
                  <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-[10px]">
                    {week.entries.length}
                    {(week.incompleteEntries?.length ?? 0) > 0
                      ? ` · ${week.incompleteEntries.length} open`
                      : ""}
                  </span>
                </button>
              ))}
            </div>
          )}

          <AnimateIn key={`${viewMode}-${selectedWeek}-${searchQuery}`}>
            <LeaderboardTable
              mode={viewMode}
              entries={activeEntries}
              searchQuery={searchQuery}
            />
          </AnimateIn>

          {viewMode === "weekly" ? (
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="mb-4">
                <h2 className="font-display text-lg font-semibold text-slate-100">
                  Logged in, not submitted
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Players who started {selectedWeekData?.label ?? `Week ${selectedWeek}`} but
                  never hit Submit — progress is still saved.
                </p>
              </div>
              <IncompletePlayersTable
                entries={incompleteEntries}
                searchQuery={searchQuery}
              />
            </div>
          ) : null}
        </GlassPanel>
      </main>
    </AppShell>
  );
}
