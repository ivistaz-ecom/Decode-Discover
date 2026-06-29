import { SCORING_CONFIG } from "@/lib/config/scoring";
import type { ScoringConfig } from "@/types/game";

export interface ScoreBreakdown {
  correctAnswers: number;
  hintCount: number;
  wordPoints: number;
  hintPenalty: number;
  rawScore: number;
  finalScore: number;
  wasFloored: boolean;
}

export function getScoreBreakdown(
  correctAnswers: number,
  hintCount: number,
  config: ScoringConfig = SCORING_CONFIG
): ScoreBreakdown {
  const wordPoints = correctAnswers * config.pointsPerCorrectAnswer;
  const hintPenalty = hintCount * config.penaltyPerImagePopup;
  const rawScore = wordPoints - hintPenalty;
  const finalScore = Math.max(0, rawScore);

  return {
    correctAnswers,
    hintCount,
    wordPoints,
    hintPenalty,
    rawScore,
    finalScore,
    wasFloored: rawScore < 0,
  };
}

export function calculateScore(
  correctAnswers: number,
  hintCount: number,
  config: ScoringConfig = SCORING_CONFIG
): number {
  return getScoreBreakdown(correctAnswers, hintCount, config).finalScore;
}
