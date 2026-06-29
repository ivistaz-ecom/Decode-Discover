import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { DISALLOWED_EMAIL_MESSAGE, isAllowedEmail } from "@/lib/config/auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import {
  AUTH_NOT_CONFIGURED_MESSAGE,
  isAuthNotConfiguredError,
} from "@/lib/firebase/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (!isAllowedEmail(email)) {
      return NextResponse.json({ error: DISALLOWED_EMAIL_MESSAGE }, { status: 403 });
    }

    const adminAuth = getAdminAuth();
    let uid: string;

    try {
      const created = await adminAuth.createUser({
        email,
        displayName: name,
        emailVerified: true,
      });
      uid = created.uid;
    } catch (error: unknown) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "";

      if (code === "auth/email-already-exists") {
        const existing = await adminAuth.getUserByEmail(email);
        uid = existing.uid;
        await adminAuth.updateUser(uid, { displayName: name, email });
      } else {
        throw error;
      }
    }

    await getAdminDb()
      .collection("users")
      .doc(uid)
      .set(
        {
          uid,
          name,
          email,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    const token = await adminAuth.createCustomToken(uid);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Login API error:", error);

    if (isAuthNotConfiguredError(error)) {
      return NextResponse.json(
        { error: AUTH_NOT_CONFIGURED_MESSAGE, code: "auth-not-configured" },
        { status: 503 }
      );
    }

    const message =
      error instanceof Error && error.message.includes("Firebase Admin")
        ? error.message
        : "Unable to sign in. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
