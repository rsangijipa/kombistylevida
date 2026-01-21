export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { DeliverySlot } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "14");
        const now = new Date();
        const WINDOWS = ["MORNING", "AFTERNOON", "EVENING"] as const;

        // 1. LAZY EXPIRY
        const expiredOrdersSnap = await adminDb.collection("orders")
            .where("deliveryReservation.status", "==", "HELD")
            .get();

        const nowIso = now.toISOString();

        if (!expiredOrdersSnap.empty) {
            const expiredDocs = expiredOrdersSnap.docs.filter(doc => {
                const data = doc.data();
                return data.deliveryReservation?.expiresAt && data.deliveryReservation.expiresAt < nowIso;
            });

            if (expiredDocs.length > 0) {
                console.log(`[Slots] Releasing ${expiredDocs.length} expired reservations.`);
                const batch = adminDb.batch();
                const decrements: Record<string, number> = {};

                expiredDocs.forEach(doc => {
                    const data = doc.data();
                    const slotId = data.deliveryReservation?.slotId;
                    if (slotId) decrements[slotId] = (decrements[slotId] || 0) + 1;

                    batch.update(doc.ref, {
                        "deliveryReservation.status": "EXPIRED",
                        "deliveryReservation.slotId": null,
                        updatedAt: new Date().toISOString()
                    });
                });

                for (const [slotId, count] of Object.entries(decrements)) {
                    const slotRef = adminDb.collection("deliverySlots").doc(slotId);
                    batch.update(slotRef, {
                        reserved: FieldValue.increment(-count),
                        updatedAt: new Date().toISOString()
                    });
                }
                await batch.commit();
            }
        }

        // 2. LAZY CREATION
        const slotsToReturn: DeliverySlot[] = [];
        const slotsBatch = adminDb.batch();
        let batchCount = 0;
        const slotRefs: any[] = [];

        for (let i = 1; i <= days; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            for (const win of WINDOWS) {
                slotRefs.push(adminDb.collection("deliverySlots").doc(`${dateStr}_${win}`));
            }
        }

        const slotSnaps = await adminDb.getAll(...slotRefs);

        for (const snap of slotSnaps) {
            if (snap.exists) {
                slotsToReturn.push(snap.data() as DeliverySlot);
            } else {
                const [date, window] = snap.id.split('_');
                const newSlot: DeliverySlot = {
                    id: snap.id,
                    date,
                    window: window as any,
                    capacity: 10,
                    reserved: 0,
                    isOpen: true,
                    updatedAt: new Date().toISOString()
                };
                slotsBatch.set(snap.ref, newSlot);
                slotsToReturn.push(newSlot);
                batchCount++;
            }
        }

        if (batchCount > 0) await slotsBatch.commit();

        return NextResponse.json({
            slots: slotsToReturn.filter(s => s.isOpen),
            meta: { generated: batchCount, range: `${days} days` }
        });

    } catch (e: any) {
        console.error("[Slots Error]", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

