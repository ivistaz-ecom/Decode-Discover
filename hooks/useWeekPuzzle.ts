import { getActiveWeek, getWeekConfig } from "@/lib/config/weeks";
import { useGameStore } from "@/stores/useGameStore";
import type { PlacedWord } from "@/types/game";

export function useWeekPuzzle() {
  const weekNumber = useGameStore((s) => s.weekNumber);
  const imagePath = useGameStore((s) => s.imagePath);
  const questionOrder = useGameStore((s) => s.questionOrder);
  const placedWords = useGameStore((s) => s.placedWords);
  const config = getWeekConfig(weekNumber) ?? getActiveWeek();

  const orderedWords = questionOrder
    .map((id) => placedWords.find((word) => word.id === id))
    .filter((word): word is PlacedWord => Boolean(word));

  return {
    weekNumber: config.weekNumber,
    label: config.label,
    imagePath,
    words: config.words,
    orderedWords,
    gridSize: config.gridSize,
  };
}
