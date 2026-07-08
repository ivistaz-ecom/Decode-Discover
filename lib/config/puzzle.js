import { getActiveWeek, getActiveWeekNumber, getWeekConfig, } from "@/lib/config/weeks";
export { getActiveWeek, getActiveWeekNumber, getWeekConfig };
export function getActivePuzzleConfig() {
    return getActiveWeek();
}
/** Fullscreen intro image duration before the word search starts. */
export const INTRO_IMAGE_DURATION_MS = 30000;

export { DEMO_INTRO_IMAGE_DURATION_MS } from "@/lib/config/demo";
