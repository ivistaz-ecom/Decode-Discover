import { getActiveWeek, getWeekConfig } from "@/lib/config/weeks";
import { useGameStore } from "@/stores/useGameStore";

export function useWeekPuzzle() {
  const weekNumber = useGameStore((s) => s.weekNumber);
  const imagePath = useGameStore((s) => s.imagePath);
  const config = getWeekConfig(weekNumber) ?? getActiveWeek();

  return {
    weekNumber: config.weekNumber,
    label: config.label,
    imagePath,
    words: config.words,
    gridSize: config.gridSize,
  };
}
