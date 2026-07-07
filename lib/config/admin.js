const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ??
    [];
export function isAdminEmail(email) {
    if (!email)
        return false;
    return adminEmails.includes(email.toLowerCase());
}
