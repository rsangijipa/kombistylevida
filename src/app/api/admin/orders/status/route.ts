export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { logEvent, logError } from "@/lib/logger";

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { orderId, status, actor } = body;

    if (!orderId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const ALLOWED_STATUSES = ['PENDING', 'PAID', 'CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status. Use CANCEL for cancellation." }, { status: 400 });
    }

    try {
        const orderRef = adminDb.collection("orders").doc(orderId);

        // Simple update - no stock changes allowed here
        const updateData: any = {
            status,
            updatedAt: new Date().toISOString(),
            lastStatusUpdateBy: actor || 'admin'
        };

        if (status === 'PAID') {
            updateData['payment.status'] = 'paid';
            updateData['payment.paidAt'] = new Date().toISOString();
        }

        await orderRef.update(updateData);

        logEvent('order_status_updated', { orderId, status, actor });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logError('order_status_update_failed', error, { orderId });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
