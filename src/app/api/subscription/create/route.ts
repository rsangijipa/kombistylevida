export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        const authHeader = request.headers.get("authorization");
        const bearerPrefix = "Bearer ";

        if (!authHeader || !authHeader.startsWith(bearerPrefix)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.slice(bearerPrefix.length).trim();
        const decoded = await adminAuth.verifyIdToken(idToken);
        const userId = decoded.uid;

        // 1. Validate Session (Must be logged in or have a valid guest session linked to a user?)
        // For Subscription, we ideally want a User ID from Auth.
        // Checking custom cookie 'kv_order' for now as a fallback or if we rely on it.
        // Ideally, use Firebase Auth token in Authorization header.
        // Let's assume for MVP we might accept the `userId` in payload IF we trust it? NO.
        // We stick to the cookie pattern used in checkout/admin for now, or assume this is a protected route.
        // Security Note: Real app should use `request.headers.get('Authorization')` verified by adminAuth.verifyIdToken().
        // For this context, checking the `kv_order` is weak for "Subscription" which implies account.
        // Let's expect an ID Token in the Authorization header.

        // MVP simplified: Expect customer details in payload + check public cookie for session integrity if needed.
        // Actually, let's implement a verifyUser pattern if possible.
        // If not, we save it as "Pending Approval" logic.

        // Simple Validation
        if (!payload.items || !payload.frequency) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (payload.userId && payload.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const subscriptionRef = adminDb.collection("subscriptions").doc();

        const now = new Date();
        const nextDelivery = new Date();

        // Calculate next delivery based on frequency
        if (payload.frequency === 'weekly') nextDelivery.setDate(now.getDate() + 7);
        else if (payload.frequency === 'biweekly') nextDelivery.setDate(now.getDate() + 14);
        else if (payload.frequency === 'monthly') nextDelivery.setMonth(now.getMonth() + 1);

        await subscriptionRef.set({
            id: subscriptionRef.id,
            userId,
            customer: payload.customer, // snapshot of address/contact
            items: payload.items,
            frequency: payload.frequency,
            status: "active",
            nextDeliveryDate: nextDelivery.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            // Payment info would go here (e.g. stripe ID)
            paymentStatus: "awaiting_setup"
        });

        return NextResponse.json({ success: true, subscriptionId: subscriptionRef.id });

    } catch (error: unknown) {
        const isAuthError =
            (error instanceof Error && error.message.toLowerCase().includes("token")) ||
            (typeof (error as { code?: unknown })?.code === "string" &&
                (error as { code: string }).code.startsWith("auth/"));

        if (isAuthError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("Subscription Error:", error);
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
    }
}

