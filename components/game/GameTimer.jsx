"use client";
import { memo } from "react";
import { useGameStore } from "@/stores/useGameStore";
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
export const GameTimer = memo(function GameTimer() {
    const elapsedMs = useGameStore((s) => s.elapsedMs);
    return (<div className="rounded-md border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-center font-display text-[11px] font-semibold tabular-nums text-sky-100 sm:text-xs">
      {formatDuration(elapsedMs)}
    </div>);
});
export function formatMs(ms) {
    return formatDuration(ms);
}
