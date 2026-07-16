import { NextResponse } from "next/server";
import { buildLeaderboardData } from "@/lib/admin/leaderboard";
import { isAdminEmail } from "@/lib/config/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { AuthError, verifyRequestAuth } from "@/lib/firebase/verify-request";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const decoded = await verifyRequestAuth(request);
    const email = decoded.email;

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const db = getAdminDb();
    const snap = await db.collection("game_sessions").get();
    const sessions = snap.docs.map((docSnap) => docSnap.data());
    const allUids = new Set(sessions.map((session) => session.uid).filter(Boolean));
    const userCache = new Map();

    await Promise.all(
      Array.from(allUids).map(async (uid) => {
        const userSnap = await db.collection("users").doc(uid).get();
        const userData = userSnap.data();
        userCache.set(uid, {
          name: userData?.name ?? "Unknown",
          email: userData?.email ?? "",
        });
      })
    );

    const data = buildLeaderboardData(sessions, (uid) => userCache.get(uid));

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/admin/leaderboard error:", error);
    return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 });
  }
}
