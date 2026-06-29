import { getAuthHeaders } from "@/lib/api/auth-headers";
import type { GameSession, LeaderboardEntry } from "@/types/session";

export interface WeekSessionStatus {
  weekNumber: number;
  alreadyPlayed: boolean;
  completedSession: { id: string; session: GameSession } | null;
  activeSession: { id: string; session: GameSession } | null;
}

export async function getWeekSessionStatus(
  uid: string
): Promise<WeekSessionStatus> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/sessions", { headers });

  if (!response.ok) {
    throw new Error("Failed to load game session.");
  }

  const data = (await response.json()) as WeekSessionStatus;

  const belongsToUser = (session: GameSession | undefined) =>
    session?.uid === uid;

  if (
    data.completedSession &&
    !belongsToUser(data.completedSession.session)
  ) {
    data.completedSession = null;
  }

  if (data.activeSession && !belongsToUser(data.activeSession.session)) {
    data.activeSession = null;
  }

  return data;
}

export async function createGameSession(
  uid: string
): Promise<{ id: string; session: GameSession }> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers,
  });

  const data = (await response.json()) as {
    id?: string;
    session?: GameSession;
    error?: string;
    completedSession?: { id: string; session: GameSession };
  };

  if (response.status === 409 && data.completedSession) {
    const err = new Error(data.error ?? "Already played this week.");
    (err as Error & { completedSession?: typeof data.completedSession }).completedSession =
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

export async function saveGameSession(
  sessionId: string,
  data: Partial<GameSession>
): Promise<void> {
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

export async function getGameSessionById(
  sessionId: string
): Promise<GameSession | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/sessions/${sessionId}`, { headers });

  if (!response.ok) {
    throw new Error("Failed to load game session.");
  }

  const data = (await response.json()) as { session: GameSession | null };
  return data.session;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/admin/leaderboard", { headers });

  if (!response.ok) {
    throw new Error("Failed to load leaderboard.");
  }

  const data = (await response.json()) as { entries: LeaderboardEntry[] };
  return data.entries;
}
