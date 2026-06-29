import type { LeaderboardEntry } from "@/types/session";
import { formatMs } from "@/components/game/GameTimer";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No completed games yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Rank</th>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Score</th>
            <th className="px-4 py-3 text-left font-semibold">
              Completion Time
            </th>
            <th className="px-4 py-3 text-left font-semibold">Popup Opens</th>
            <th className="px-4 py-3 text-left font-semibold">
              Total Image View Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
          {entries.map((entry, index) => (
            <tr key={`${entry.uid}-${index}`}>
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{entry.name}</td>
              <td className="px-4 py-3">{entry.score}</td>
              <td className="px-4 py-3">{formatMs(entry.completionTime)}</td>
              <td className="px-4 py-3">{entry.popupOpenCount}</td>
              <td className="px-4 py-3">
                {formatMs(entry.totalImageViewTime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
