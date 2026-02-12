import "server-only";
import { headers } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

/**
 * Validates the request authentication for Admin routes.
 * Throws errors if unauthorized.
 * 
 * Usage:
 * try {
 *   await adminGuard();
 * } catch (error) {
 *   return NextResponse.json({ error: error.message }, { status: 401 | 403 });
 * }
 */
import { cookies } from "next/headers";

type AllowedRole = "admin" | "staff" | "content";
const DEV_ADMIN_UID = process.env.ADMIN_DEV_UID || "LLYbhjGPmTZL3N3FbgpuaDa1Agh2";

function extractRole(decodedToken: Record<string, unknown>): AllowedRole | null {
    const role = decodedToken.role;
    if (role === "admin" || role === "staff" || role === "content") return role;
    if (decodedToken.admin === true) return "admin";
    return null;
}

/**
 * Validates the request authentication for Admin routes.
 * Supports both Bearer Token (API clients) and Session Cookie (Browser/Middleware).
 * Throws errors if unauthorized.
 */
export async function adminGuard() {
    const headersList = await headers();
    const authorization = headersList.get("Authorization");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value || cookieStore.get("__session")?.value;

    let decodedToken;

    try {
        if (sessionCookie) {
            // Verify Session Cookie
            decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        } else if (authorization && authorization.startsWith("Bearer ")) {
            // Verify Bearer Token
            const token = authorization.split("Bearer ")[1];
            decodedToken = await adminAuth.verifyIdToken(token);
        } else {
            throw new Error("UNAUTHORIZED");
        }

        // RBAC only via claims (no email fallback)
        const role = extractRole(decodedToken as Record<string, unknown>);
        const isDevUidAdmin = process.env.NODE_ENV !== "production" && decodedToken.uid === DEV_ADMIN_UID;
        const isAdmin = role === "admin" || isDevUidAdmin;

        if (!isAdmin) {
            throw new Error("FORBIDDEN");
        }

        return decodedToken;

    } catch (error) {
        if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
            throw error;
        }

        console.error("Admin Guard Validation Failed:", error);
        // Log the specific error for debugging
        if (decodedToken) {
            console.error("User Context:", { email: decodedToken.email, role: decodedToken.role, admin: decodedToken.admin });
        } else {
            console.error("No decoded token available - Verification failed completely.");
        }
        throw new Error("UNAUTHORIZED");
    }
}
