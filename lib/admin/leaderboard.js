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

function wordsFoundCount(session) {
  if (Array.isArray(session.foundWordIds) && session.foundWordIds.length > 0) {
    return session.foundWordIds.length;
  }
  if (typeof session.correctAnswers === "number") {
    return session.correctAnswers;
  }
  if (Array.isArray(session.submittedAnswers)) {
    return session.submittedAnswers.filter((answer) => answer.correct).length;
  }
  return 0;
}

function totalWordsCount(session, weekNumber) {
  if (Array.isArray(session.submittedAnswers) && session.submittedAnswers.length > 0) {
    return session.submittedAnswers.length;
  }
  const week = WEEKS.find((entry) => entry.weekNumber === weekNumber);
  return week?.words?.length ?? 0;
}

function isCompletedSession(session) {
  return session.score != null && session.completedAt != null;
}

function toWeeklyEntry(session, userInfo) {
  const weekNumber = session.weekNumber ?? 1;
  return {
    uid: session.uid,
    name: userInfo.name,
    email: userInfo.email,
    weekNumber,
    score: session.score,
    wordsFound: wordsFoundCount(session),
    totalWords: totalWordsCount(session, weekNumber),
    completionTime: session.completionTime ?? 0,
    popupOpenCount: session.popupOpenCount ?? 0,
    totalImageViewTime: session.totalImageViewTime ?? 0,
  };
}

function toIncompleteEntry(session, userInfo) {
  const weekNumber = session.weekNumber ?? 1;
  return {
    uid: session.uid,
    name: userInfo.name,
    email: userInfo.email,
    weekNumber,
    wordsFound: wordsFoundCount(session),
    totalWords: totalWordsCount(session, weekNumber),
    popupOpenCount: session.popupOpenCount ?? session.hintClickCount ?? 0,
    totalImageViewTime: session.totalImageViewTime ?? 0,
    startedAt: session.startedAt ?? session.gameStartedAt ?? null,
    gameStartedAt: session.gameStartedAt ?? null,
  };
}

/**
 * @param {Array} sessions - all game_sessions (completed + incomplete)
 * @param {(uid: string) => { name?: string, email?: string } | undefined} getUserData
 */
export function buildLeaderboardData(sessions, getUserData) {
  const userCache = new Map();
  const weeklyBuckets = new Map();
  const incompleteBuckets = new Map();

  for (const week of WEEKS) {
    weeklyBuckets.set(week.weekNumber, new Map());
    incompleteBuckets.set(week.weekNumber, new Map());
  }

  const overallByUser = new Map();
  const completedUidsByWeek = new Map();

  for (const session of sessions) {
    if (!isCompletedSession(session)) continue;

    const userInfo = resolveUserInfo(session.uid, userCache, getUserData);
    const weekNumber = session.weekNumber ?? 1;
    const weeklyEntry = toWeeklyEntry(session, userInfo);

    if (!weeklyBuckets.has(weekNumber)) {
      weeklyBuckets.set(weekNumber, new Map());
    }
    if (!completedUidsByWeek.has(weekNumber)) {
      completedUidsByWeek.set(weekNumber, new Set());
    }
    completedUidsByWeek.get(weekNumber).add(session.uid);

    const weekMap = weeklyBuckets.get(weekNumber);
    const existingWeekEntry = weekMap.get(session.uid);
    if (!existingWeekEntry || weeklyEntry.score > existingWeekEntry.score) {
      weekMap.set(session.uid, weeklyEntry);
    }
  }

  for (const session of sessions) {
    if (isCompletedSession(session)) continue;

    const weekNumber = session.weekNumber ?? 1;
    if (completedUidsByWeek.get(weekNumber)?.has(session.uid)) continue;

    const userInfo = resolveUserInfo(session.uid, userCache, getUserData);
    const incompleteEntry = toIncompleteEntry(session, userInfo);

    if (!incompleteBuckets.has(weekNumber)) {
      incompleteBuckets.set(weekNumber, new Map());
    }

    const weekMap = incompleteBuckets.get(weekNumber);
    const existing = weekMap.get(session.uid);
    const existingWords = existing?.wordsFound ?? -1;
    const existingStarted = existing?.startedAt ?? 0;
    const nextStarted = incompleteEntry.startedAt ?? 0;

    if (
      !existing ||
      incompleteEntry.wordsFound > existingWords ||
      (incompleteEntry.wordsFound === existingWords && nextStarted > existingStarted)
    ) {
      weekMap.set(session.uid, incompleteEntry);
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
    incompleteEntries: Array.from(
      incompleteBuckets.get(week.weekNumber)?.values() ?? []
    ).sort((a, b) => {
      if (b.wordsFound !== a.wordsFound) return b.wordsFound - a.wordsFound;
      return (b.startedAt ?? 0) - (a.startedAt ?? 0);
    }),
  }));

  const overall = Array.from(overallByUser.values())
    .map((entry) => ({
      ...entry,
      averageScore: Math.round(entry.totalScore / entry.weeksPlayed),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return { weeks, overall };
}
