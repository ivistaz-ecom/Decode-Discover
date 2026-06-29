export function isAdminEnvConfigured(): boolean {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim()) {
    return true;
  }

  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_PRIVATE_KEY?.trim()
  );
}

export function normalizePrivateKey(raw: string): string {
  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, "\n");
}

export const FIREBASE_ADMIN_MISSING_MESSAGE =
  "Server configuration error: Firebase Admin credentials are missing on Vercel. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_KEY) in Project Settings → Environment Variables, then redeploy.";
