"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardTable } from "@/components/admin/LeaderboardTable";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { InteractiveButton } from "@/components/motion/InteractiveButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isAdminEmail } from "@/lib/config/admin";
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
import type { LeaderboardEntry } from "@/types/session";

export function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setEntries(data);
      } catch {
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isAdmin]);

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
            <p className={pageSubtitleClass}>Sorted by score (highest first)</p>
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
          <LeaderboardTable entries={entries} />
        </GlassPanel>
      </main>
    </AppShell>
  );
}
