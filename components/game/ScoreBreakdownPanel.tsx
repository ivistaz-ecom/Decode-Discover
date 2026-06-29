"use client";

import { SCORING_CONFIG } from "@/lib/config/scoring";
import { getScoreBreakdown } from "@/lib/game/scoring";

interface ScoreBreakdownPanelProps {
  correctAnswers: number;
  hintCount: number;
  finalScore: number;
}

export function ScoreBreakdownPanel({
  correctAnswers,
  hintCount,
  finalScore,
}: ScoreBreakdownPanelProps) {
  const breakdown = getScoreBreakdown(correctAnswers, hintCount);
  const pointsPerWord = SCORING_CONFIG.pointsPerCorrectAnswer;
  const penaltyPerHint = SCORING_CONFIG.penaltyPerImagePopup;

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Score breakdown
      </p>
      <div className="mt-2 space-y-1.5 text-sm">
        <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
          <span>
            Words found ({correctAnswers} × {pointsPerWord} pts)
          </span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            +{breakdown.wordPoints}
          </span>
        </div>
        <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
          <span>
            Hint penalty ({hintCount} × {penaltyPerHint} pts)
          </span>
          <span className="font-medium text-red-600 dark:text-red-400">
            −{breakdown.hintPenalty}
          </span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-1.5 text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
          <span>Total before minimum</span>
          <span className="font-medium">{breakdown.rawScore}</span>
        </div>
        {breakdown.wasFloored && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Final score is 0 — scores cannot go below zero.
          </p>
        )}
        <div className="flex justify-between border-t border-zinc-200 pt-1.5 font-semibold text-zinc-900 dark:border-zinc-600 dark:text-zinc-100">
          <span>Final score</span>
          <span>{finalScore}</span>
        </div>
      </div>
    </div>
  );
}
