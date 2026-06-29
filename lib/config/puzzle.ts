import {
  getActiveWeek,
  getActiveWeekNumber,
  getWeekConfig,
} from "@/lib/config/weeks";

export { getActiveWeek, getActiveWeekNumber, getWeekConfig };

export function getActivePuzzleConfig() {
  return getActiveWeek();
}

/** Fullscreen intro image duration before the word search starts. */
export const INTRO_IMAGE_DURATION_MS = 30_000;

/** How long the image popup stays open before auto-closing. */
export const POPUP_IMAGE_DURATION_MS = 10_000;
