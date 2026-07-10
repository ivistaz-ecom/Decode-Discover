import { WEEK_1_CONFIG } from "@/lib/config/weeks/week-1";
import { WEEK_2_CONFIG } from "@/lib/config/weeks/week-2";
import { WEEK_3_CONFIG } from "@/lib/config/weeks/week-3";
import { WEEK_4_CONFIG } from "@/lib/config/weeks/week-4";
import { DEMO_CONFIG } from "@/lib/config/demo";
export const WEEKS = [
    WEEK_1_CONFIG,
    WEEK_2_CONFIG,
    WEEK_3_CONFIG,
    WEEK_4_CONFIG,
];
export function getWeekConfig(weekNumber) {
    if (weekNumber === DEMO_CONFIG.weekNumber) {
        return DEMO_CONFIG;
    }
    return WEEKS.find((week) => week.weekNumber === weekNumber);
}
function isWithinSchedule(week, now) {
    if (!week.startsAt || !week.endsAt)
        return false;
    const start = new Date(week.startsAt);
    const end = new Date(week.endsAt);
    return now >= start && now <= end;
}
/**
 * Returns the week that is open right now (scheduled windows in IST).
 * Before Week 1 opens, returns Week 1. After Week 4 closes, returns Week 4.
 */
export function getActiveWeek(now = new Date()) {
    const scheduled = WEEKS.find((week) => isWithinSchedule(week, now));
    if (scheduled)
        return scheduled;

    const firstWeek = WEEKS[0];
    const lastWeek = WEEKS[WEEKS.length - 1];
    const firstStart = firstWeek?.startsAt ? new Date(firstWeek.startsAt) : null;
    const lastEnd = lastWeek?.endsAt ? new Date(lastWeek.endsAt) : null;

    if (firstStart && now < firstStart)
        return firstWeek;
    if (lastEnd && now > lastEnd)
        return lastWeek;

    return firstWeek;
}
export function getActiveWeekNumber(now = new Date()) {
    return getActiveWeek(now).weekNumber;
}
export function getWeekLabel(weekNumber) {
    return getWeekConfig(weekNumber)?.label ?? `Week ${weekNumber}`;
}
export function formatWeekSchedule(weekNumber) {
    const week = getWeekConfig(weekNumber);
    if (!week?.startsAt || !week?.endsAt)
        return null;
    const start = new Date(week.startsAt);
    const end = new Date(week.endsAt);
    const formatter = new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
    });
    return `${formatter.format(start)} – ${formatter.format(end)}`;
}
