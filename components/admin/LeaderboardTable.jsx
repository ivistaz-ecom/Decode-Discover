"use client";
import { useMemo, useState } from "react";
import { formatMs } from "@/components/game/GameTimer";

function rankBadgeClass(rank) {
  if (rank === 1) return "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/40";
  if (rank === 2) return "bg-slate-300/15 text-slate-200 ring-1 ring-slate-300/30";
  if (rank === 3) return "bg-orange-400/15 text-orange-200 ring-1 ring-orange-400/35";
  return "bg-white/5 text-slate-300";
}

function SortHeader({ label, sortKey, activeKey, direction, onSort }) {
  const isActive = activeKey === sortKey;
  return (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:text-sky-300"
      >
        {label}
        <span className={`text-[10px] ${isActive ? "text-sky-300" : "text-slate-600 group-hover:text-slate-400"}`}>
          {isActive ? (direction === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function compareEntries(a, b, key, direction, mode) {
  const factor = direction === "asc" ? 1 : -1;

  if (key === "rank") {
    return 0;
  }

  const getValue = (entry) => {
    if (key === "name" || key === "email") {
      return String(entry[key] ?? "").toLowerCase();
    }
    return entry[key] ?? 0;
  };

  const aVal = getValue(a);
  const bVal = getValue(b);

  if (typeof aVal === "string") {
    return aVal.localeCompare(bVal) * factor;
  }

  return (aVal - bVal) * factor;
}

export function LeaderboardTable({ entries, mode = "weekly", searchQuery = "" }) {
  const [sortKey, setSortKey] = useState(mode === "overall" ? "totalScore" : "score");
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let rows = entries;

    if (query) {
      rows = rows.filter(
        (entry) =>
          entry.name?.toLowerCase().includes(query) ||
          entry.email?.toLowerCase().includes(query)
      );
    }

    const sorted = [...rows].sort((a, b) => compareEntries(a, b, sortKey, sortDirection, mode));
    return sorted;
  }, [entries, searchQuery, sortKey, sortDirection, mode]);

  function handleSort(key) {
    if (key === "rank") return;
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "name" || key === "email" ? "asc" : "desc");
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
        <p className="font-display text-lg font-semibold text-slate-200">No completed games yet</p>
        <p className="mt-1 text-sm text-slate-500">Scores will appear here once players finish a puzzle.</p>
      </div>
    );
  }

  if (filteredAndSorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm text-slate-400">No players match your search.</p>
      </div>
    );
  }

  const weeklyColumns = [
    { key: "rank", label: "Rank" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "score", label: "Score" },
    { key: "completionTime", label: "Time" },
    { key: "popupOpenCount", label: "Hints" },
    { key: "totalImageViewTime", label: "Image Time" },
  ];

  const overallColumns = [
    { key: "rank", label: "Rank" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "totalScore", label: "Total" },
    { key: "weeksPlayed", label: "Weeks" },
    { key: "averageScore", label: "Avg" },
    { key: "bestWeekScore", label: "Best" },
    { key: "totalCompletionTime", label: "Time" },
    { key: "totalPopupOpens", label: "Hints" },
    { key: "totalImageViewTime", label: "Image Time" },
  ];

  const columns = mode === "overall" ? overallColumns : weeklyColumns;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/30">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04]">
            <tr>
              {columns.map((column) =>
                column.key === "rank" ? (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {column.label}
                  </th>
                ) : (
                  <SortHeader
                    key={column.key}
                    label={column.label}
                    sortKey={column.key}
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filteredAndSorted.map((entry, index) => {
              const rank = index + 1;
              const scoreValue = mode === "overall" ? entry.totalScore : entry.score;

              return (
                <tr
                  key={mode === "overall" ? entry.uid : `${entry.uid}-${entry.weekNumber}`}
                  className="text-slate-200 transition hover:bg-sky-500/[0.06]"
                >
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold ${rankBadgeClass(rank)}`}
                    >
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-100">{entry.name}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400 sm:text-sm">
                    {entry.email || "—"}
                  </td>
                  <td className="px-4 py-3.5 font-display text-base font-bold text-sky-300">
                    {scoreValue}
                  </td>
                  {mode === "overall" ? (
                    <>
                      <td className="px-4 py-3.5">{entry.weeksPlayed}</td>
                      <td className="px-4 py-3.5">{entry.averageScore}</td>
                      <td className="px-4 py-3.5 text-sky-200/90">{entry.bestWeekScore}</td>
                      <td className="px-4 py-3.5 tabular-nums">{formatMs(entry.totalCompletionTime)}</td>
                      <td className="px-4 py-3.5">{entry.totalPopupOpens}</td>
                      <td className="px-4 py-3.5 tabular-nums">{formatMs(entry.totalImageViewTime)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3.5 tabular-nums">{formatMs(entry.completionTime)}</td>
                      <td className="px-4 py-3.5">{entry.popupOpenCount}</td>
                      <td className="px-4 py-3.5 tabular-nums">{formatMs(entry.totalImageViewTime)}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
