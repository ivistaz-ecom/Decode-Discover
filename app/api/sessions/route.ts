import { NextResponse } from "next/server";
import { getActiveWeekNumber, ALREADY_PLAYED_MESSAGE } from "@/lib/config/tournament";
import { AuthError, verifyRequestUid } from "@/lib/firebase/verify-request";
import {
  createEmptySession,
  createGameSessionAdmin,
  getWeekSessionStatusAdmin,
} from "@/lib/firebase/sessions-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const uid = await verifyRequestUid(request);
    const status = await getWeekSessionStatusAdmin(uid, getActiveWeekNumber());
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to load session." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const uid = await verifyRequestUid(request);
    const status = await getWeekSessionStatusAdmin(uid, getActiveWeekNumber());

    if (status.alreadyPlayed && status.completedSession) {
      return NextResponse.json(
        {
          error: ALREADY_PLAYED_MESSAGE,
          completedSession: status.completedSession,
        },
        { status: 409 }
      );
    }

    if (status.activeSession) {
      return NextResponse.json(status.activeSession);
    }

    const sessionId = `${uid}_w${getActiveWeekNumber()}_${Date.now()}`;
    const session = createEmptySession(uid, getActiveWeekNumber());

    await createGameSessionAdmin(sessionId, session);

    return NextResponse.json({ id: sessionId, session });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }
}
