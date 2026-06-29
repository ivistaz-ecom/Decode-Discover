export type PuzzleDirection = "across" | "down";

export interface PuzzleWord {
  id: string;
  word: string;
  clue: string;
  direction: PuzzleDirection;
  number: number;
}

export interface PlacedWord extends PuzzleWord {
  startRow: number;
  startCol: number;
  dx: number;
  dy: number;
}

export interface GridCell {
  row: number;
  col: number;
  letter: string;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface PopupSession {
  openedAt: number;
  closedAt: number | null;
  duration: number;
}

export interface SubmittedAnswer {
  wordId: string;
  answer: string;
  correct: boolean;
}

export interface ScoringConfig {
  pointsPerCorrectAnswer: number;
  penaltyPerImagePopup: number;
  penaltyPerMinute: number;
  penaltyPerHintClick: number;
}

export type GamePhase = "intro" | "playing" | "submitted";

export type PlayStatus = "idle" | "loading" | "ready" | "already_played" | "error";
