import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();
        if (!idToken) {
            return NextResponse.json({ error: "Missing ID Token" }, { status: 400 });
        }

        // 5 Days
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        // Verify validity first
        await adminAuth.verifyIdToken(idToken, true);

        // Create Session Cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();
        cookieStore.set("session", sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Session creation failed", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
