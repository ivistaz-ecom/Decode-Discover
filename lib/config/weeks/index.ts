import type { WeekPuzzleConfig } from "@/types/week";
import { WEEK_1_CONFIG } from "@/lib/config/weeks/week-1";
import { WEEK_2_CONFIG } from "@/lib/config/weeks/week-2";
import { WEEK_3_CONFIG } from "@/lib/config/weeks/week-3";
import { WEEK_4_CONFIG } from "@/lib/config/weeks/week-4";

export const WEEKS: WeekPuzzleConfig[] = [
  WEEK_1_CONFIG,
  WEEK_2_CONFIG,
  WEEK_3_CONFIG,
  WEEK_4_CONFIG,
];

export function getWeekConfig(
  weekNumber: number
): WeekPuzzleConfig | undefined {
  return WEEKS.find((week) => week.weekNumber === weekNumber);
}

function isWithinSchedule(week: WeekPuzzleConfig, now: Date): boolean {
  if (!week.startsAt || !week.endsAt) return false;
  const start = new Date(week.startsAt);
  const end = new Date(week.endsAt);
  return now >= start && now <= end;
}

/**
 * Returns the week that is open right now.
 * Weeks with scheduled dates take priority. Until dates are set, Week 1 stays open.
 */
export function getActiveWeek(now: Date = new Date()): WeekPuzzleConfig {
  const scheduled = WEEKS.find((week) => isWithinSchedule(week, now));
  if (scheduled) return scheduled;

  return WEEK_1_CONFIG;
}

export function getActiveWeekNumber(now: Date = new Date()): number {
  return getActiveWeek(now).weekNumber;
}

export function getWeekLabel(weekNumber: number): string {
  return getWeekConfig(weekNumber)?.label ?? `Week ${weekNumber}`;
}

export function formatWeekSchedule(weekNumber: number): string | null {
  const week = getWeekConfig(weekNumber);
  if (!week?.startsAt || !week?.endsAt) return null;

  const start = new Date(week.startsAt);
  const end = new Date(week.endsAt);

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}
