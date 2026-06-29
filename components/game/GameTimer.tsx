"use client";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface GameTimerProps {
  elapsedMs: number;
}

export function GameTimer({ elapsedMs }: GameTimerProps) {
  return (
    <div className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      Time: {formatDuration(elapsedMs)}
    </div>
  );
}

export function formatMs(ms: number): string {
  return formatDuration(ms);
}
