import type { PuzzleWord } from "@/types/game";

export interface WeekPuzzleConfig {
  weekNumber: number;
  label: string;
  imagePath: string;
  seed: number;
  gridSize: number;
  words: PuzzleWord[];
  /** ISO 8601 datetime — set when the week schedule is confirmed (null = TBD) */
  startsAt: string | null;
  /** ISO 8601 datetime — set when the week schedule is confirmed (null = TBD) */
  endsAt: string | null;
}
