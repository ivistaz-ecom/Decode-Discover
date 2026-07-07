import { formatMs } from "@/components/game/GameTimer";

function tableShell(children) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#4a4238]">
      <table className="min-w-full divide-y divide-[#4a4238] text-sm">{children}</table>
    </div>
  );
}

function headerCell(label) {
  return (
    <th className="px-4 py-3 text-left font-semibold text-[#9c9185]">{label}</th>
  );
}

function scoreCell(value) {
  return <td className="px-4 py-3 text-[#c9a86c]">{value}</td>;
}

export function LeaderboardTable({ entries, mode = "weekly" }) {
  if (entries.length === 0) {
    return <p className="text-sm text-[#9c9185]">No completed games yet.</p>;
  }

  if (mode === "overall") {
    return tableShell(
      <>
        <thead className="bg-[#322e28]/60">
          <tr>
            {headerCell("Rank")}
            {headerCell("Name")}
            {headerCell("Total Score")}
            {headerCell("Weeks Played")}
            {headerCell("Average Score")}
            {headerCell("Best Week")}
            {headerCell("Total Time")}
            {headerCell("Popup Opens")}
            {headerCell("Image View Time")}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#4a4238]">
          {entries.map((entry, index) => (
            <tr key={entry.uid} className="text-[#e8dfd3]">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{entry.name}</td>
              {scoreCell(entry.totalScore)}
              <td className="px-4 py-3">{entry.weeksPlayed}</td>
              <td className="px-4 py-3">{entry.averageScore}</td>
              {scoreCell(entry.bestWeekScore)}
              <td className="px-4 py-3">{formatMs(entry.totalCompletionTime)}</td>
              <td className="px-4 py-3">{entry.totalPopupOpens}</td>
              <td className="px-4 py-3">{formatMs(entry.totalImageViewTime)}</td>
            </tr>
          ))}
        </tbody>
      </>
    );
  }

  return tableShell(
    <>
      <thead className="bg-[#322e28]/60">
        <tr>
          {headerCell("Rank")}
          {headerCell("Name")}
          {headerCell("Score")}
          {headerCell("Completion Time")}
          {headerCell("Popup Opens")}
          {headerCell("Image View Time")}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#4a4238]">
        {entries.map((entry, index) => (
          <tr key={`${entry.uid}-${entry.weekNumber}`} className="text-[#e8dfd3]">
            <td className="px-4 py-3">{index + 1}</td>
            <td className="px-4 py-3 font-medium">{entry.name}</td>
            {scoreCell(entry.score)}
            <td className="px-4 py-3">{formatMs(entry.completionTime)}</td>
            <td className="px-4 py-3">{entry.popupOpenCount}</td>
            <td className="px-4 py-3">{formatMs(entry.totalImageViewTime)}</td>
          </tr>
        ))}
      </tbody>
    </>
  );
}
