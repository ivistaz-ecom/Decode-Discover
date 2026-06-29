import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  FIREBASE_ADMIN_MISSING_MESSAGE,
  isAdminEnvConfigured,
  normalizePrivateKey,
} from "@/lib/firebase/admin-config";

function getServiceAccount() {
  if (!isAdminEnvConfigured()) {
    throw new Error(FIREBASE_ADMIN_MISSING_MESSAGE);
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (json) {
    const parsed = JSON.parse(json) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
    };
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!.trim();
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY!);

  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey,
  };
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
