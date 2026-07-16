"use client";
import { useMemo } from "react";
import { formatMs } from "@/components/game/GameTimer";

function formatStartedAt(value) {
  if (value == null) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function IncompletePlayersTable({ entries = [], searchQuery = "" }) {
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      (entry) =>
        entry.name?.toLowerCase().includes(query) ||
        entry.email?.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center">
        <p className="text-sm text-slate-400">
          No players logged in without submitting for this week.
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center">
        <p className="text-sm text-slate-400">No incomplete players match your search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-amber-400/20 bg-slate-950/30">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10 bg-amber-400/[0.06]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Words found
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Hints
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Image time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Started
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filtered.map((entry) => (
              <tr
                key={entry.uid}
                className="text-slate-200 transition hover:bg-amber-400/[0.05]"
              >
                <td className="px-4 py-3.5 font-medium text-slate-100">{entry.name}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-400 sm:text-sm">
                  {entry.email || "—"}
                </td>
                <td className="px-4 py-3.5 tabular-nums text-amber-100">
                  {entry.totalWords > 0
                    ? `${entry.wordsFound ?? 0} / ${entry.totalWords}`
                    : (entry.wordsFound ?? 0)}
                </td>
                <td className="px-4 py-3.5">{entry.popupOpenCount ?? 0}</td>
                <td className="px-4 py-3.5 tabular-nums">
                  {formatMs(entry.totalImageViewTime ?? 0)}
                </td>
                <td className="px-4 py-3.5 text-slate-400">
                  {formatStartedAt(entry.startedAt ?? entry.gameStartedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
