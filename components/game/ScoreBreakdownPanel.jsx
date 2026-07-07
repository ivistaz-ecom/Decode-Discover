"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SCORING_CONFIG } from "@/lib/config/scoring";
import { getScoreBreakdown } from "@/lib/game/scoring";
import { EASE_OUT } from "@/lib/animations/presets";
export function ScoreBreakdownPanel({ correctAnswers, hintCount, finalScore, }) {
    const ref = useRef(null);
    const breakdown = getScoreBreakdown(correctAnswers, hintCount);
    const pointsPerWord = SCORING_CONFIG.pointsPerCorrectAnswer;
    const penaltyPerHint = SCORING_CONFIG.penaltyPerImagePopup;
    useGSAP(() => {
        const rows = ref.current?.querySelectorAll("[data-score-row]");
        if (!rows?.length)
            return;
        gsap.from(rows, {
            opacity: 0,
            x: -16,
            duration: 0.45,
            stagger: 0.1,
            delay: 0.5,
            ease: EASE_OUT,
        });
    }, { scope: ref, dependencies: [correctAnswers, hintCount, finalScore] });
    return (<div ref={ref} className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Score breakdown
      </p>
      <div className="mt-2 space-y-1.5 text-sm">
        <div data-score-row className="flex justify-between text-slate-300">
          <span>
            Words found ({correctAnswers} × {pointsPerWord} pts)
          </span>
          <span className="font-medium text-emerald-400">+{breakdown.wordPoints}</span>
        </div>
        <div data-score-row className="flex justify-between text-slate-300">
          <span>
            Hint penalty ({hintCount} × {penaltyPerHint} pts)
          </span>
          <span className="font-medium text-red-400">−{breakdown.hintPenalty}</span>
        </div>
        <div data-score-row className="flex justify-between border-t border-white/10 pt-1.5 text-slate-400">
          <span>Total before minimum</span>
          <span className="font-medium">{breakdown.rawScore}</span>
        </div>
        {breakdown.wasFloored && (<p data-score-row className="text-xs text-amber-300">
            Final score is 0 — scores cannot go below zero.
          </p>)}
        <div data-score-row className="flex justify-between border-t border-white/10 pt-1.5 font-semibold text-slate-100">
          <span>Final score</span>
          <span>{finalScore}</span>
        </div>
      </div>
    </div>);
}
