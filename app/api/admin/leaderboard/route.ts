import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/config/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { AuthError, verifyRequestAuth } from "@/lib/firebase/verify-request";
import type { GameSession, LeaderboardEntry } from "@/types/session";

export async function GET(request: Request) {
  try {
    const decoded = await verifyRequestAuth(request);
    const email = decoded.email;

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const snap = await getAdminDb()
      .collection("game_sessions")
      .where("score", "!=", null)
      .get();

    const userCache = new Map<string, { name: string; email: string }>();
    const entries: LeaderboardEntry[] = [];

    for (const docSnap of snap.docs) {
      const session = docSnap.data() as GameSession;
      if (session.score === null) continue;

      let userInfo = userCache.get(session.uid);
      if (!userInfo) {
        const userSnap = await getAdminDb()
          .collection("users")
          .doc(session.uid)
          .get();
        const userData = userSnap.data();
        userInfo = {
          name: (userData?.name as string) ?? "Unknown",
          email: (userData?.email as string) ?? "",
        };
        userCache.set(session.uid, userInfo);
      }

      entries.push({
        uid: session.uid,
        name: userInfo.name,
        email: userInfo.email,
        score: session.score,
        completionTime: session.completionTime ?? 0,
        popupOpenCount: session.popupOpenCount,
        totalImageViewTime: session.totalImageViewTime,
      });
    }

    entries.sort((a, b) => b.score - a.score);

    return NextResponse.json({ entries });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/admin/leaderboard error:", error);
    return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 });
  }
}
