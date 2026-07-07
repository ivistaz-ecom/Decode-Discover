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
    return (<div className="rounded-md border border-[#5c5348] bg-[#322e28] px-2.5 py-1 text-center text-[11px] font-medium tabular-nums text-[#e8dfd3] sm:text-xs">
      {formatDuration(elapsedMs)}
    </div>);
});
export function formatMs(ms) {
    return formatDuration(ms);
}
