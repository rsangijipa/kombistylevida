export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { logEvent, logError } from "@/lib/logger";
import { Order } from "@/types/firestore";
import { adminGuard } from "@/lib/auth/adminGuard";

export async function POST(request: Request) {
    try {
        await adminGuard();
        const { days = 30 } = await request.json().catch(() => ({}));

        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - 1); // Start from yesterday to include active today
        const endDate = new Date();
        endDate.setDate(now.getDate() + days);

        // 1. Fetch ALL Active Orders in Range
        // Querying strictly by schedule.date string
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        const ordersSnap = await adminDb.collection("orders")
            .where("schedule.date", ">=", startStr)
            .where("schedule.date", "<=", endStr)
            .get();

        const counters: Record<string, { daily: number, slots: Record<string, number>, mode: string }> = {};

        ordersSnap.forEach(doc => {
            const order = doc.data() as Order;
            if (order.status === 'CANCELED') return;

            const date = order.schedule.date;
            const slotId = order.schedule.slotId;
            if (!date || !slotId) return;

            // Normalized Mode
            const mode = order.customer.deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY';
            const key = `${date}_${mode}`;

            if (!counters[key]) {
                counters[key] = { daily: 0, slots: {}, mode };
            }

            counters[key].daily++;
            counters[key].slots[slotId] = (counters[key].slots[slotId] || 0) + 1;
        });

        // 2. Batch Update DeliveryDays
        const batch = adminDb.batch();
        let count = 0;

        for (const [key, data] of Object.entries(counters)) {
            const ref = adminDb.collection("deliveryDays").doc(key);

            // We need to be careful not to overwrite 'overrideClosed' or 'capacitySnapshot'
            // But we MUST overwrite 'dailyBooked' and 'slots.X.booked'
            // We can't do deep merge on just one field of a map easily without dot notation, 
            // and we need to reset others to 0 if no orders?
            // "Sync" implies we trust the orders more than the counters.
            // But if a slot has 0 orders, we won't even find it here!
            // So we strictly UPDATE what we found. 
            // Limitation: If a slot HAD orders and now has 0 (all canceled), this loop won't clear it to 0.
            // However, Cancel API handles decrement. This Sync is for "Disappeared" orders (added but not counted).
            // So Updates are safe.

            const updateData: Record<string, unknown> = {
                dailyBooked: data.daily,
                updatedAt: new Date().toISOString()
            };

            for (const [slotId, qty] of Object.entries(data.slots)) {
                updateData[`slots.${slotId}.booked`] = qty;
            }

            batch.set(ref, updateData, { merge: true });
            count++;
        }

        await batch.commit();

        logEvent('schedule_sync_success', { processedDays: count, ordersScanned: ordersSnap.size });

        return NextResponse.json({ success: true, processed: count });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        }
        logError('schedule_sync_failed', error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
