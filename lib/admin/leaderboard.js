import { WEEKS, getWeekLabel } from "@/lib/config/weeks";

function resolveUserInfo(uid, userCache, getUserData) {
  if (userCache.has(uid)) {
    return userCache.get(uid);
  }

  const userData = getUserData(uid);
  const userInfo = {
    name: userData?.name ?? "Unknown",
    email: userData?.email ?? "",
  };
  userCache.set(uid, userInfo);
  return userInfo;
}

function toWeeklyEntry(session, userInfo) {
  return {
    uid: session.uid,
    name: userInfo.name,
    email: userInfo.email,
    weekNumber: session.weekNumber ?? 1,
    score: session.score,
    completionTime: session.completionTime ?? 0,
    popupOpenCount: session.popupOpenCount ?? 0,
    totalImageViewTime: session.totalImageViewTime ?? 0,
  };
}

export function buildLeaderboardData(completedSessions, getUserData) {
  const userCache = new Map();
  const weeklyBuckets = new Map();

  for (const week of WEEKS) {
    weeklyBuckets.set(week.weekNumber, new Map());
  }

  const overallByUser = new Map();

  for (const session of completedSessions) {
    if (session.score == null) continue;

    const userInfo = resolveUserInfo(session.uid, userCache, getUserData);
    const weekNumber = session.weekNumber ?? 1;
    const weeklyEntry = toWeeklyEntry(session, userInfo);

    if (!weeklyBuckets.has(weekNumber)) {
      weeklyBuckets.set(weekNumber, new Map());
    }

    const weekMap = weeklyBuckets.get(weekNumber);
    const existingWeekEntry = weekMap.get(session.uid);
    if (!existingWeekEntry || weeklyEntry.score > existingWeekEntry.score) {
      weekMap.set(session.uid, weeklyEntry);
    }
  }

  for (const weekMap of weeklyBuckets.values()) {
    for (const weeklyEntry of weekMap.values()) {
      const existingOverall = overallByUser.get(weeklyEntry.uid);
      if (!existingOverall) {
        overallByUser.set(weeklyEntry.uid, {
          uid: weeklyEntry.uid,
          name: weeklyEntry.name,
          email: weeklyEntry.email,
          totalScore: weeklyEntry.score,
          weeksPlayed: 1,
          bestWeekScore: weeklyEntry.score,
          totalCompletionTime: weeklyEntry.completionTime,
          totalPopupOpens: weeklyEntry.popupOpenCount,
          totalImageViewTime: weeklyEntry.totalImageViewTime,
        });
        continue;
      }

      existingOverall.totalScore += weeklyEntry.score;
      existingOverall.weeksPlayed += 1;
      existingOverall.bestWeekScore = Math.max(
        existingOverall.bestWeekScore,
        weeklyEntry.score
      );
      existingOverall.totalCompletionTime += weeklyEntry.completionTime;
      existingOverall.totalPopupOpens += weeklyEntry.popupOpenCount;
      existingOverall.totalImageViewTime += weeklyEntry.totalImageViewTime;
    }
  }

  const weeks = WEEKS.map((week) => ({
    weekNumber: week.weekNumber,
    label: week.label ?? getWeekLabel(week.weekNumber),
    entries: Array.from(weeklyBuckets.get(week.weekNumber)?.values() ?? []).sort(
      (a, b) => b.score - a.score
    ),
  }));

  const overall = Array.from(overallByUser.values())
    .map((entry) => ({
      ...entry,
      averageScore: Math.round(entry.totalScore / entry.weeksPlayed),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return { weeks, overall };
}
