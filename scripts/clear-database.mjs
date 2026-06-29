/**
 * One-time cleanup: removes all game_sessions and all users except admin(s).
 * Usage: node scripts/clear-database.mjs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const content = readFileSync(path, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).replace(/\\n/g, "\n");
    }

    process.env[key] = value;
  }
}

function getAdminEmails() {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const emails = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length === 0) {
    throw new Error("NEXT_PUBLIC_ADMIN_EMAILS is not set in .env.local");
  }

  return emails;
}

function initFirebase() {
  if (getApps().length > 0) return;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials missing in .env.local");
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function deleteCollection(db, collectionName) {
  const snap = await db.collection(collectionName).get();
  if (snap.empty) return 0;

  let deleted = 0;
  const batchSize = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    batch.delete(doc.ref);
    batchCount++;
    deleted++;

    if (batchCount >= batchSize) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return deleted;
}

async function deleteFirestoreUsersExcept(db, keepUids) {
  const snap = await db.collection("users").get();
  if (snap.empty) return 0;

  let deleted = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    if (keepUids.has(doc.id)) continue;

    batch.delete(doc.ref);
    batchCount++;
    deleted++;

    if (batchCount >= 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return deleted;
}

async function deleteAuthUsersExcept(auth, keepUids) {
  let deleted = 0;
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);

    for (const user of result.users) {
      if (keepUids.has(user.uid)) continue;
      await auth.deleteUser(user.uid);
      deleted++;
      console.log(`  Deleted auth user: ${user.email ?? user.uid}`);
    }

    pageToken = result.pageToken;
  } while (pageToken);

  return deleted;
}

async function main() {
  loadEnvLocal();
  initFirebase();

  const adminEmails = getAdminEmails();
  const auth = getAuth();
  const db = getFirestore();

  console.log("Keeping admin account(s):", adminEmails.join(", "));

  const keepUids = new Set();

  for (const email of adminEmails) {
    try {
      const user = await auth.getUserByEmail(email);
      keepUids.add(user.uid);
      console.log(`  Found admin: ${email} (${user.uid})`);
    } catch {
      console.log(`  Admin not in Auth yet (will be created on first login): ${email}`);
    }
  }

  console.log("\nDeleting all game_sessions...");
  const sessionsDeleted = await deleteCollection(db, "game_sessions");
  console.log(`  Deleted ${sessionsDeleted} session(s)`);

  console.log("\nDeleting Firestore users (except admin)...");
  const usersDeleted = await deleteFirestoreUsersExcept(db, keepUids);
  console.log(`  Deleted ${usersDeleted} user document(s)`);

  console.log("\nDeleting Firebase Auth users (except admin)...");
  const authDeleted = await deleteAuthUsersExcept(auth, keepUids);
  console.log(`  Deleted ${authDeleted} auth user(s)`);

  console.log("\nDone. Database cleared except your admin account(s).");
}

main().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
