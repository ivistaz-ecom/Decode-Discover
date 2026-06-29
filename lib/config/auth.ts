export const ALLOWED_EMAIL_DOMAINS = [
  "ivistasolutions.com",
  "nautilusshipping.com",
] as const;

export function isAllowedEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return ALLOWED_EMAIL_DOMAINS.includes(
    domain as (typeof ALLOWED_EMAIL_DOMAINS)[number]
  );
}

export function allowedDomainsLabel(): string {
  return ALLOWED_EMAIL_DOMAINS.map((d) => `@${d}`).join(", ");
}

export const DISALLOWED_EMAIL_MESSAGE = `Only company emails (${allowedDomainsLabel()}) can sign in.`;
