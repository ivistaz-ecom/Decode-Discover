export const ALLOWED_EMAIL_DOMAINS = [
  "ivistasolutions.com",
  "nautilusshipping.com",
] as const;

export type EmailDomain = (typeof ALLOWED_EMAIL_DOMAINS)[number];

export function isAllowedEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return ALLOWED_EMAIL_DOMAINS.includes(domain as EmailDomain);
}

export function allowedDomainsLabel(): string {
  return ALLOWED_EMAIL_DOMAINS.map((d) => `@${d}`).join(", ");
}

export const DISALLOWED_EMAIL_MESSAGE = `Only company emails (${allowedDomainsLabel()}) can sign in.`;

export function nameToEmailLocal(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.-]/g, "");
}

export function buildEmailFromNameAndDomain(
  name: string,
  domain: EmailDomain
): string {
  const local = nameToEmailLocal(name);
  if (!local) {
    throw new Error("Please enter a valid name.");
  }
  return `${local}@${domain}`;
}
