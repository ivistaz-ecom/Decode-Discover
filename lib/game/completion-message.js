function weekLabel(weekNumber) {
    return weekNumber === 1 ? "Week 1" : `Week ${weekNumber}`;
}
/**
 * Positive player-facing copy based on performance (score is never shown).
 */
export function getCompletionCopy(correctCount, totalWords, weekNumber, score) {
    const ratio = totalWords > 0 ? correctCount / totalWords : 0;
    const week = weekLabel(weekNumber);
    const weeklyReminder = "A new puzzle drops every week — sharpen your eye, trust the clues, and come back stronger next time.";
    if (ratio >= 1) {
        return {
            headline: "Outstanding!",
            encouragement: score >= 90
                ? `You cracked every word in ${week} with sharp focus. That kind of attention to detail is exactly what this challenge is about — brilliant work.`
                : `You found every hidden word in ${week}! A clean sweep — you studied the image like a pro.`,
            weeklyReminder,
        };
    }
    if (ratio >= 0.7) {
        return {
            headline: "Great effort!",
            encouragement: `You solved most of the puzzle in ${week}. You were clearly on the right track — a little more patience with the image and you'll be unstoppable.`,
            weeklyReminder,
        };
    }
    if (ratio >= 0.4) {
        return {
            headline: "Nice try!",
            encouragement: weekNumber === 1
                ? `${week} is just the beginning. You got a solid start — every puzzle trains your eye. Stick with it and you'll pick up speed fast.`
                : `You made real progress in ${week}. The clues are tricky by design — each week builds your skills a little more.`,
            weeklyReminder,
        };
    }
    return {
        headline: "Good start!",
        encouragement: weekNumber === 1
            ? `Welcome to ${week}! Puzzles like this take practice, and showing up is half the battle. Study the image, take your time, and you'll improve with every round.`
            : `${week} was a tough one — don't be discouraged. Every great solver started exactly where you are. Review the clues and come back ready.`,
        weeklyReminder,
    };
}
