import type { LeaderboardEntry } from "@/types/session";
import { formatMs } from "@/components/game/GameTimer";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">No completed games yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-300">Rank</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-300">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-300">Score</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-300">
              Completion Time
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-300">Popup Opens</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-300">
              Total Image View Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {entries.map((entry, index) => (
            <tr key={`${entry.uid}-${index}`} className="text-slate-200">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{entry.name}</td>
              <td className="px-4 py-3 text-[#c9a86c]">{entry.score}</td>
              <td className="px-4 py-3">{formatMs(entry.completionTime)}</td>
              <td className="px-4 py-3">{entry.popupOpenCount}</td>
              <td className="px-4 py-3">{formatMs(entry.totalImageViewTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
