import type { PopupSession, SubmittedAnswer } from "./game";

export interface GameSession {
  id?: string;
  uid: string;
  weekNumber: number;
  startedAt: number;
  completedAt: number | null;
  initialImageViewDuration: number;
  popupOpenCount: number;
  popupSessions: PopupSession[];
  totalImageViewTime: number;
  hintUsed: boolean;
  hintClickCount: number;
  hintFirstClickedAt: number | null;
  hintLastClickedAt: number | null;
  gameStartedAt: number | null;
  gameEndedAt: number | null;
  completionTime: number | null;
  correctAnswers: number;
  score: number | null;
  submittedAnswers: SubmittedAnswer[];
  foundWordIds: string[];
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  email: string;
  score: number;
  completionTime: number;
  popupOpenCount: number;
  totalImageViewTime: number;
}
