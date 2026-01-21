export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { parseKvOrderCookie, hashToken } from "@/lib/security/token";
import { Order, DeliverySlot } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, window } = body;

        if (!date || !window) {
            return NextResponse.json({ error: "Missing date or window" }, { status: 400 });
        }

        // Auth
        const cookieStore = await cookies();
        const kvOrderCookie = cookieStore.get("kv_order");
        const auth = parseKvOrderCookie(kvOrderCookie?.value);

        if (!auth) {
            return NextResponse.json({ error: "No active session" }, { status: 401 });
        }

        const slotId = `${date}_${window}`;
        const orderRef = adminDb.collection("orders").doc(auth.orderId);
        const slotRef = adminDb.collection("deliverySlots").doc(slotId);

        let snapshot: any;

        await adminDb.runTransaction(async (t) => {
            // READS
            const orderDoc = await t.get(orderRef);
            const slotDoc = await t.get(slotRef);

            let order = orderDoc.exists ? (orderDoc.data() as Order) : null;

            if (!order) {
                // Lazy Creation for Reservation
                order = {
                    id: auth.orderId,
                    status: 'NEW',
                    items: [],
                    totalCents: 0,
                    customer: { name: "Guest", phone: "", deliveryMethod: "delivery" },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    schedule: { date: null },
                    publicAccess: {
                        tokenHash: hashToken(auth.token),
                        revoked: false
                    }
                } as Order;

                t.set(orderRef, order);
            } else {
                // Verify existing
                if (order.publicAccess?.tokenHash !== hashToken(auth.token)) {
                    throw new Error("Unauthorized");
                }
            }

            // Check Slot Validity
            if (!slotDoc.exists) {
                // This implies lazy creation failure or race condition?
                // Or maybe the slot ID is mismatch?
                // We should probably allow creation if it respects rules?
                // But slots are seeded by API /slots.
                throw new Error("Slot does not exist (refresh page)");
            }
            const slot = slotDoc.data() as DeliverySlot;

            if (!slot.isOpen) {
                throw new Error("Slot is closed");
            }
            if (slot.reserved >= slot.capacity) {
                throw new Error("Slot is full");
            }

            // Decrement OLD slot if active
            const oldSlotId = order.deliveryReservation?.slotId;
            const oldStatus = order.deliveryReservation?.status;

            if (oldSlotId && oldStatus === 'HELD' && oldSlotId !== slotId) {
                const oldSlotRef = adminDb.collection("deliverySlots").doc(oldSlotId);
                t.update(oldSlotRef, {
                    reserved: FieldValue.increment(-1),
                    updatedAt: new Date().toISOString()
                });
            }

            // WRITES
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

            // Increment NEW slot
            t.update(slotRef, {
                reserved: slot.reserved + 1,
                updatedAt: new Date().toISOString()
            });

            // Update Order
            t.update(orderRef, {
                "delivery.type": "SCHEDULED",
                "delivery.date": date,
                "delivery.window": window,
                "deliveryReservation.slotId": slotId,
                "deliveryReservation.status": "HELD",
                "deliveryReservation.reservedAt": new Date().toISOString(),
                "deliveryReservation.expiresAt": expiresAt.toISOString(),
                updatedAt: new Date().toISOString()
            });

            snapshot = {
                slotId,
                expiresAt: expiresAt.toISOString()
            };
        });

        return NextResponse.json({ success: true, ...snapshot });

    } catch (error: any) {
        console.error("Reserve Error:", error);
        const msg = error.message || "Unknown error";
        if (msg.includes("Full") || msg.includes("Closed")) return NextResponse.json({ error: msg }, { status: 409 });
        if (msg.includes("Unauthorized")) return NextResponse.json({ error: msg }, { status: 401 });
        return NextResponse.json({
            error: "Reservation failed",
            details: msg,
            stack: error.stack
        }, { status: 500 });
    }
}
