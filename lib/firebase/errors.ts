export function getFirebaseErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }
  return "";
}

export function isAuthNotConfiguredError(error: unknown): boolean {
  const code = getFirebaseErrorCode(error);
  if (code === "auth/configuration-not-found") return true;

  const message =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : "";

  return (
    message.includes("CONFIGURATION_NOT_FOUND") ||
    message.includes("no configuration corresponding") ||
    message.includes("Firebase Admin credentials are missing") ||
    message.includes("Firebase Admin is not configured")
  );
}

export const AUTH_NOT_CONFIGURED_MESSAGE =
  "Firebase Authentication is not set up yet. Open Firebase Console → Authentication → Get started, enable at least one sign-in method (e.g. Email/Password), then try again.";
