import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { parseKvOrderCookie, hashToken } from "@/lib/security/token";
import { Order, DeliverySlot } from "@/types/firestore";

export async function POST(_request: Request) {
    try {
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

            if (order.publicAccess?.tokenHash !== hashToken(auth.token)) {
                throw new Error("Unauthorized Access");
            }

            const currentSlotId = order.deliveryReservation?.slotId;
            if (!currentSlotId) return; // Nothing to release

            const slotRef = adminDb.collection("deliverySlots").doc(currentSlotId);
            const slotDoc = await t.get(slotRef);

            if (slotDoc.exists) {
                const slot = slotDoc.data() as DeliverySlot;
                const newReserved = Math.max(0, slot.reserved - 1);
                t.update(slotRef, { reserved: newReserved });
            }

            t.update(orderRef, {
                "delivery.type": 'ASAP', // Revert to ASAP by default on release
                "delivery.date": null,
                "delivery.window": null,
                "deliveryReservation.slotId": null,
                "deliveryReservation.reservedAt": null,
                "deliveryReservation.status": "RELEASED",
                updatedAt: new Date().toISOString()
            });
        });

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error("Release Slot Error:", error);
        if ((error as Error).message === "Unauthorized Access") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.json({ error: "Release failed" }, { status: 500 });
    }
}
