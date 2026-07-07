export const ALLOWED_EMAIL_DOMAINS = [
    "ivistasolutions.com",
    "nautilusshipping.com",
];
export function isAllowedEmail(email) {
    const domain = email.trim().toLowerCase().split("@")[1];
    return ALLOWED_EMAIL_DOMAINS.includes(domain);
}
export function allowedDomainsLabel() {
    return ALLOWED_EMAIL_DOMAINS.map((d) => `@${d}`).join(", ");
}
export const DISALLOWED_EMAIL_MESSAGE = `Only company emails (${allowedDomainsLabel()}) can sign in.`;
export function nameToEmailLocal(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ".")
        .replace(/[^a-z0-9.-]/g, "");
}
export function buildEmailFromNameAndDomain(name, domain) {
    const local = nameToEmailLocal(name);
    if (!local) {
        throw new Error("Please enter a valid name.");
    }
    return `${local}@${domain}`;
}
