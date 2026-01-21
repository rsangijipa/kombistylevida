export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { parseKvOrderCookie, hashToken } from "@/lib/security/token";
import { Order, DeliverySlot } from "@/types/firestore";

export async function POST(request: Request) {
    try {
        const { type } = await request.json(); // "ASAP" | "SCHEDULED"

        if (type !== 'ASAP' && type !== 'SCHEDULED') {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const kvOrderCookie = cookieStore.get("kv_order");
        const auth = parseKvOrderCookie(kvOrderCookie?.value);

        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orderRef = adminDb.collection("orders").doc(auth.orderId);

        await adminDb.runTransaction(async (t) => {
            const orderDoc = await t.get(orderRef);
            if (!orderDoc.exists) throw new Error("Order not found");

            const order = orderDoc.data() as Order;

            // Verify Token
            if (order.publicAccess?.tokenHash !== hashToken(auth.token)) {
                throw new Error("Unauthorized Access");
            }

            // Implementation:
            // If switching TO ASAP, we must release any scheduled slot.
            // If switching TO SCHEDULED, we just update the type preference, reservation happens via /reserve

            if (type === 'ASAP') {
                const currentSlotId = order.deliveryReservation?.slotId;
                if (currentSlotId) {
                    const slotRef = adminDb.collection("deliverySlots").doc(currentSlotId);
                    const slotDoc = await t.get(slotRef);
                    if (slotDoc.exists) {
                        const slot = slotDoc.data() as DeliverySlot;
                        const newReserved = Math.max(0, slot.reserved - 1);
                        t.update(slotRef, { reserved: newReserved });
                    }
                }

                t.update(orderRef, {
                    "delivery.type": 'ASAP',
                    // Clear schedule details
                    "delivery.date": null,
                    "delivery.window": null,
                    // Clear reservation
                    "deliveryReservation.slotId": null,
                    "deliveryReservation.reservedAt": null,
                    "deliveryReservation.status": "RELEASED",
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Switching to SCHEDULED (just update intent)
                t.update(orderRef, {
                    "delivery.type": 'SCHEDULED',
                    updatedAt: new Date().toISOString()
                });
            }
        });

        return NextResponse.json({ success: true, type });

    } catch (error: unknown) {
        console.error("Set Delivery Type Error:", error);
        if ((error as Error).message === "Unauthorized Access") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }
}

