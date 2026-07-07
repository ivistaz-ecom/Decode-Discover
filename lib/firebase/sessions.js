import { getAuthHeaders } from "@/lib/api/auth-headers";
export async function getWeekSessionStatus(uid) {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/sessions", { headers });
    if (!response.ok) {
        throw new Error("Failed to load game session.");
    }
    const data = (await response.json());
    const belongsToUser = (session) => session?.uid === uid;
    if (data.completedSession &&
        !belongsToUser(data.completedSession.session)) {
        data.completedSession = null;
    }
    if (data.activeSession && !belongsToUser(data.activeSession.session)) {
        data.activeSession = null;
    }
    return data;
}
export async function createGameSession(uid) {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/sessions", {
        method: "POST",
        headers,
    });
    const data = (await response.json());
    if (response.status === 409 && data.completedSession) {
        const err = new Error(data.error ?? "Already played this week.");
        err.completedSession =
            data.completedSession;
        throw err;
    }
    if (!response.ok || !data.id || !data.session) {
        throw new Error(data.error ?? "Failed to create game session.");
    }
    if (data.session.uid !== uid) {
        throw new Error("Invalid session owner.");
    }
    return { id: data.id, session: data.session };
}
export async function saveGameSession(sessionId, data) {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to save game session.");
    }
}
export async function getGameSessionById(sessionId) {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/sessions/${sessionId}`, { headers });
    if (!response.ok) {
        throw new Error("Failed to load game session.");
    }
    const data = (await response.json());
    return data.session;
}
export async function getLeaderboard() {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/admin/leaderboard", { headers });
    if (!response.ok) {
        throw new Error("Failed to load leaderboard.");
    }
    return response.json();
}
