import { getActiveWeekNumber } from "@/lib/config/tournament";
import { getAdminDb } from "@/lib/firebase/admin";
export function createEmptySession(uid, weekNumber = getActiveWeekNumber()) {
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
export async function createGameSessionAdmin(sessionId, session) {
    await getAdminDb().collection("game_sessions").doc(sessionId).set(session);
}
export async function saveGameSessionAdmin(sessionId, data) {
    await getAdminDb()
        .collection("game_sessions")
        .doc(sessionId)
        .set(data, { merge: true });
}
function sortSessions(docs) {
    return docs
        .map((docSnap) => ({
        id: docSnap.id,
        session: docSnap.data(),
    }))
        .sort((a, b) => b.session.startedAt - a.session.startedAt);
}
function sessionWeekNumber(session) {
    return session.weekNumber ?? 1;
}
async function getSessionsForUser(uid) {
    const snap = await getAdminDb()
        .collection("game_sessions")
        .where("uid", "==", uid)
        .limit(50)
        .get();
    if (snap.empty)
        return [];
    return sortSessions(snap.docs);
}
export async function getCompletedSessionForWeekAdmin(uid, weekNumber) {
    const sessions = await getSessionsForUser(uid);
    return (sessions.find(({ session }) => sessionWeekNumber(session) === weekNumber &&
        session.completedAt != null &&
        session.score !== null) ?? null);
}
export async function getActiveSessionForWeekAdmin(uid, weekNumber) {
    const sessions = await getSessionsForUser(uid);
    return (sessions.find(({ session }) => sessionWeekNumber(session) === weekNumber &&
        session.completedAt == null) ?? null);
}
export async function getWeekSessionStatusAdmin(uid, weekNumber) {
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
