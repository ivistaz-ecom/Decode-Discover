import { NextResponse } from "next/server";
import {
  FIREBASE_ADMIN_MISSING_MESSAGE,
  isAdminEnvConfigured,
} from "@/lib/firebase/admin-config";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isAuthNotConfiguredError } from "@/lib/firebase/errors";

export const runtime = "nodejs";

export async function GET() {
  if (!isAdminEnvConfigured()) {
    return NextResponse.json({
      configured: false,
      reason: "missing-server-env",
      message: FIREBASE_ADMIN_MISSING_MESSAGE,
    });
  }

  try {
    await getAdminAuth().listUsers(1);
    return NextResponse.json({ configured: true });
  } catch (error) {
    if (isAuthNotConfiguredError(error)) {
      return NextResponse.json({
        configured: false,
        reason: "firebase-auth-not-enabled",
      });
    }

    const message =
      error instanceof Error ? error.message : "Firebase Admin check failed.";

    return NextResponse.json({
      configured: false,
      reason: "admin-error",
      message,
    });
  }
}
