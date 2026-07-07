import { getAdminAuth } from "@/lib/firebase/admin";
export class AuthError extends Error {
    constructor(message, status = 401) {
        super(message);
        this.status = status;
    }
}
export async function verifyRequestAuth(request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new AuthError("Missing auth token.");
    }
    const token = authHeader.slice(7);
    return getAdminAuth().verifyIdToken(token);
}
export async function verifyRequestUid(request) {
    const decoded = await verifyRequestAuth(request);
    return decoded.uid;
}
