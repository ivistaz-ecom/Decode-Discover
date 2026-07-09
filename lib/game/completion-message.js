import { getWeekConfig, getWeekLabel, WEEKS } from "@/lib/config/weeks";

function weekLabel(weekNumber) {
    return getWeekLabel(weekNumber);
}

function formatComebackDate(date) {
    return new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Asia/Kolkata",
    }).format(date);
}

/** When the next week's puzzle opens, e.g. after finishing Week 1. */
export function getComebackMessage(weekNumber) {
    const nextWeek = getWeekConfig(weekNumber + 1);
    if (nextWeek?.startsAt) {
        const comebackDate = formatComebackDate(new Date(nextWeek.startsAt));
        return `You've completed ${weekLabel(weekNumber)}! Come back on ${comebackDate} to play ${nextWeek.label}. 📅`;
    }
    if (weekNumber >= WEEKS.length) {
        return "You've completed all 4 weeks — thank you for playing the full challenge! 🏆";
    }
    return "A new puzzle drops every week — keep that detective energy and come back for the next one. 🔍✨";
}

/**
 * Positive player-facing copy based on performance (score is never shown).
 */
export function getCompletionCopy(correctCount, totalWords, weekNumber, score) {
    const ratio = totalWords > 0 ? correctCount / totalWords : 0;
    const week = weekLabel(weekNumber);
    const comebackMessage = getComebackMessage(weekNumber);
    if (ratio >= 1) {
        return {
            headline: "Outstanding! 🎉",
            encouragement: score >= 90
                ? `You cracked every word in ${week} with laser focus. That attention to detail is exactly what this challenge is about — brilliant work. 🧠⚡`
                : `You found every hidden word in ${week}! A clean sweep — you studied the image like a pro. ✅👀`,
            weeklyReminder: comebackMessage,
        };
    }
    if (ratio >= 0.7) {
        return {
            headline: "Great effort! 🙌",
            encouragement: `You solved most of the puzzle in ${week}. You were clearly on the right track — a little more patience with the image and you’ll be unstoppable. 🚀`,
            weeklyReminder: comebackMessage,
        };
    }
    if (ratio >= 0.4) {
        return {
            headline: "Nice try! 👏",
            encouragement: weekNumber === 1
                ? `${week} is just the beginning. Solid start — every puzzle trains your eye. Stick with it and you’ll pick up speed fast. 🧩👀`
                : `You made real progress in ${week}. The clues are tricky by design — each week builds your skills a little more. 📈`,
            weeklyReminder: comebackMessage,
        };
    }
    return {
        headline: "Good start! 🌟",
        encouragement: weekNumber === 1
            ? `Welcome to ${week}! Puzzles like this take practice, and showing up is half the battle. Take your time with the image — you’ll improve every round. 💪`
            : `${week} was a tough one — don’t be discouraged. Every great solver started exactly where you are. Review the clues and come back ready. 😄`,
        weeklyReminder: comebackMessage,
    };
}
