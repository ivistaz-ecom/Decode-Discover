import {
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  buildEmailFromNameAndDomain,
  DISALLOWED_EMAIL_MESSAGE,
  isAllowedEmail,
  type EmailDomain,
} from "@/lib/config/auth";
import { resetGameStore } from "@/stores/useGameStore";
import { getFirebaseAuth, getFirebaseDb } from "./client";
import type { AppUser } from "@/types/user";

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), async (user) => {
    if (user?.email && !isAllowedEmail(user.email)) {
      await signOut(getFirebaseAuth());
      callback(null);
      return;
    }
    callback(user);
  });
}

export async function signInWithNameAndEmail(name: string, domain: EmailDomain) {
  const normalizedEmail = buildEmailFromNameAndDomain(name, domain);

  if (!isAllowedEmail(normalizedEmail)) {
    throw new Error(DISALLOWED_EMAIL_MESSAGE);
  }

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim(), email: normalizedEmail }),
  });

  const raw = await response.text();
  let data: { token?: string; error?: string; code?: string };

  try {
    data = JSON.parse(raw) as { token?: string; error?: string; code?: string };
  } catch {
    throw new Error(
      "Server error while signing in. If this is a Vercel deployment, add Firebase Admin environment variables and redeploy."
    );
  }

  if (!response.ok || !data.token) {
    throw new Error(data.error ?? "Authentication failed.");
  }

  const result = await signInWithCustomToken(
    getFirebaseAuth(),
    data.token
  );

  try {
    await ensureUserDocument(result.user, name.trim(), normalizedEmail);
  } catch (error) {
    console.warn("Client user profile sync failed (server already saved):", error);
  }

  return result.user;
}

export async function signOutUser() {
  resetGameStore();
  await signOut(getFirebaseAuth());
}

async function ensureUserDocument(
  user: User,
  nameOverride?: string,
  emailOverride?: string
) {
  const ref = doc(getFirebaseDb(), "users", user.uid);
  const snap = await getDoc(ref);
  const name =
    nameOverride ??
    user.displayName ??
    user.email?.split("@")[0] ??
    "Player";
  const email = emailOverride ?? user.email ?? "";

  if (!snap.exists()) {
    const userData: AppUser = {
      uid: user.uid,
      name,
      email,
      createdAt: Date.now(),
    };
    await setDoc(ref, {
      ...userData,
      createdAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(
    ref,
    {
      name,
      email: email || (snap.data().email ?? ""),
    },
    { merge: true }
  );
}

export async function getAppUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : data.createdAt,
  };
}
