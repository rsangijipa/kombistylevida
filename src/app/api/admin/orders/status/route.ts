export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { logEvent, logError } from "@/lib/logger";
import { adminGuard } from "@/lib/auth/adminGuard";

export async function POST(request: Request) {
    try {
        await adminGuard();
    } catch {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { orderId, status, actor } = body;

    if (!orderId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const ALLOWED_STATUSES = ['PENDING', 'PAID', 'CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status. Use CANCEL for cancellation." }, { status: 400 });
    }

    try {
        await adminDb.runTransaction(async (t) => {
            const orderRef = adminDb.collection("orders").doc(orderId);
            const orderDoc = await t.get(orderRef);

            if (!orderDoc.exists) {
                throw new Error("Order not found");
            }

            const orderData = orderDoc.data();
            const alreadyAwarded = orderData?.ecoPointsAwarded || false;

            // Simple update - no stock changes allowed here
            const updateData: Record<string, unknown> = {
                status,
                updatedAt: new Date().toISOString(),
                lastStatusUpdateBy: actor || 'admin'
            };

            if (status === 'PAID') {
                updateData['payment.status'] = 'paid';
                updateData['payment.paidAt'] = new Date().toISOString();
            }

            // GAMIFICATION LOGIC
            // Rule: 1 Point per R$ 10,00 spent
            if (status === 'DELIVERED' && !alreadyAwarded) {
                const totalCents = orderData?.totalCents || 0;
                const pointsToAward = Math.floor(totalCents / 1000); // 1 per 1000 cents (R$ 10)

                if (pointsToAward > 0 && orderData?.customer?.phone) {
                    const customerRef = adminDb.collection("customers").doc(orderData.customer.phone);

                    t.update(customerRef, {
                        ecoPoints: FieldValue.increment(pointsToAward),
                        // LTV and OrderCount are updated at checkout, do not double count here.
                    });

                    updateData.ecoPointsAwarded = true;
                    updateData.ecoPointsEarned = pointsToAward;
                    logEvent('points_awarded', { orderId, points: pointsToAward, customer: orderData.customer.phone });
                }
            }

            t.update(orderRef, updateData);
        });

        logEvent('order_status_updated', { orderId, status, actor });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        logError('order_status_update_failed', error, { orderId });
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
