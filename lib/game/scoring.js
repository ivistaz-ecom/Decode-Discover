import { SCORING_CONFIG } from "@/lib/config/scoring";
export function getScoreBreakdown(correctAnswers, hintCount, config = SCORING_CONFIG) {
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
export function calculateScore(correctAnswers, hintCount, config = SCORING_CONFIG) {
    return getScoreBreakdown(correctAnswers, hintCount, config).finalScore;
}
