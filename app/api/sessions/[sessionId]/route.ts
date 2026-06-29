import { NextResponse } from "next/server";
import type { GameSession } from "@/types/session";
import { saveGameSessionAdmin } from "@/lib/firebase/sessions-admin";
import { AuthError, verifyRequestUid } from "@/lib/firebase/verify-request";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const uid = await verifyRequestUid(request);
    const { sessionId } = await params;

    const snap = await getAdminDb().collection("game_sessions").doc(sessionId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const session = snap.data() as GameSession;
    if (session.uid !== uid) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/sessions/[sessionId] error:", error);
    return NextResponse.json({ error: "Failed to load session." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const uid = await verifyRequestUid(request);
    const { sessionId } = await params;
    const data = (await request.json()) as Partial<GameSession>;

    const snap = await getAdminDb().collection("game_sessions").doc(sessionId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const existing = snap.data() as GameSession;
    if (existing.uid !== uid) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (existing.completedAt != null) {
      return NextResponse.json(
        { error: "This game has already been completed." },
        { status: 409 }
      );
    }

    await saveGameSessionAdmin(sessionId, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("PATCH /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to save session." }, { status: 500 });
  }
}
