import type { GameSession } from "@/types/session";
import { getActiveWeekNumber } from "@/lib/config/tournament";
import { getAdminDb } from "@/lib/firebase/admin";

export function createEmptySession(uid: string, weekNumber = getActiveWeekNumber()): GameSession {
  return {
    uid,
    weekNumber,
    startedAt: Date.now(),
    completedAt: null,
    initialImageViewDuration: 0,
    popupOpenCount: 0,
    popupSessions: [],
    totalImageViewTime: 0,
    hintUsed: false,
    hintClickCount: 0,
    hintFirstClickedAt: null,
    hintLastClickedAt: null,
    gameStartedAt: null,
    gameEndedAt: null,
    completionTime: null,
    correctAnswers: 0,
    score: null,
    submittedAnswers: [],
    foundWordIds: [],
  };
}

export async function createGameSessionAdmin(
  sessionId: string,
  session: GameSession
): Promise<void> {
  await getAdminDb().collection("game_sessions").doc(sessionId).set(session);
}

export async function saveGameSessionAdmin(
  sessionId: string,
  data: Partial<GameSession>
): Promise<void> {
  await getAdminDb()
    .collection("game_sessions")
    .doc(sessionId)
    .set(data, { merge: true });
}

function sortSessions(
  docs: FirebaseFirestore.QueryDocumentSnapshot[]
): { id: string; session: GameSession }[] {
  return docs
    .map((docSnap) => ({
      id: docSnap.id,
      session: docSnap.data() as GameSession,
    }))
    .sort((a, b) => b.session.startedAt - a.session.startedAt);
}

function sessionWeekNumber(session: GameSession): number {
  return session.weekNumber ?? 1;
}

async function getSessionsForUser(
  uid: string
): Promise<{ id: string; session: GameSession }[]> {
  const snap = await getAdminDb()
    .collection("game_sessions")
    .where("uid", "==", uid)
    .limit(50)
    .get();

  if (snap.empty) return [];

  return sortSessions(snap.docs);
}

export async function getCompletedSessionForWeekAdmin(
  uid: string,
  weekNumber: number
): Promise<{ id: string; session: GameSession } | null> {
  const sessions = await getSessionsForUser(uid);

  return (
    sessions.find(
      ({ session }) =>
        sessionWeekNumber(session) === weekNumber &&
        session.completedAt != null &&
        session.score !== null
    ) ?? null
  );
}

export async function getActiveSessionForWeekAdmin(
  uid: string,
  weekNumber: number
): Promise<{ id: string; session: GameSession } | null> {
  const sessions = await getSessionsForUser(uid);

  return (
    sessions.find(
      ({ session }) =>
        sessionWeekNumber(session) === weekNumber &&
        session.completedAt == null
    ) ?? null
  );
}

export interface WeekSessionStatus {
  weekNumber: number;
  alreadyPlayed: boolean;
  completedSession: { id: string; session: GameSession } | null;
  activeSession: { id: string; session: GameSession } | null;
}

export async function getWeekSessionStatusAdmin(
  uid: string,
  weekNumber: number
): Promise<WeekSessionStatus> {
  const completed = await getCompletedSessionForWeekAdmin(uid, weekNumber);
  if (completed) {
    return {
      weekNumber,
      alreadyPlayed: true,
      completedSession: completed,
      activeSession: null,
    };
  }

  const active = await getActiveSessionForWeekAdmin(uid, weekNumber);

  return {
    weekNumber,
    alreadyPlayed: false,
    completedSession: null,
    activeSession: active,
  };
}
