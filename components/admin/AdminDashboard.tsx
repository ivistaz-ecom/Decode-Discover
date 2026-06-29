"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardTable } from "@/components/admin/LeaderboardTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isAdminEmail } from "@/lib/config/admin";
import { getLeaderboard } from "@/lib/firebase/sessions";
import { signOutUser } from "@/lib/firebase/auth";
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
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading admin..." />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Admin Leaderboard</h1>
            <p className="text-sm text-zinc-500">
              Sorted by score (highest first)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/game")}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
            >
              Back to Game
            </button>
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <LeaderboardTable entries={entries} />
      </main>
    </div>
  );
}
