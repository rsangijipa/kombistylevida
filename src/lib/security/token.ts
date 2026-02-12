import { randomBytes, timingSafeEqual, createHash } from "crypto";

const configuredPepper = process.env.ORDER_TOKEN_PEPPER;

if (!configuredPepper && process.env.NODE_ENV === "production") {
    throw new Error("ORDER_TOKEN_PEPPER is required in production");
}

const ORDER_TOKEN_PEPPER = configuredPepper || "dev-pepper-do-not-use-in-prod";

/**
 * Generates a strong, random 32-byte token encoded in base64url.
 * Safe for cookies and URL parameters.
 */
export function generateToken(): string {
    return randomBytes(32).toString('base64url');
}

/**
 * Hashes the token with a pepper using SHA-256.
 * This hash is safe to store in the public/client-accessible Firestore document.
 */
export function hashToken(token: string): string {
    const input = `${ORDER_TOKEN_PEPPER}:${token}`;
    return createHash('sha256').update(input).digest('hex');
}

/**
 * Verifies if a provided candidate token matches the stored hash.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyToken(candidateToken: string, storedHash: string): boolean {
    const candidateHash = hashToken(candidateToken);
    const candidateBuffer = Buffer.from(candidateHash);
    const storedBuffer = Buffer.from(storedHash);

    if (candidateBuffer.length !== storedBuffer.length) {
        return false;
    }

    return timingSafeEqual(candidateBuffer, storedBuffer);
}

/**
 * Parses the kv_order cookie value safely.
 * Expected format: `${orderId}.${token}`
 */
export function parseKvOrderCookie(cookieValue: string | undefined): { orderId: string; token: string } | null {
    if (!cookieValue) return null;

    const parts = cookieValue.split('.');

    // Validate format: must have exactly 2 parts
    if (parts.length !== 2) return null;

    const [orderId, token] = parts;

    // Basic sanity check: orderId usually alphanum, token base64url (alphanum + - _)
    // We can add regex if stricter validation is needed.
    if (!orderId || !token) return null;

    return { orderId, token };
}
