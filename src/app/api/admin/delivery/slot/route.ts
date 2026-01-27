export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { adminGuard } from "@/lib/auth/adminGuard";

import { DeliverySlot } from "@/types/firestore";

export async function PATCH(request: Request) {
    try {
        await adminGuard();

        const body = await request.json();
        const { slotId, capacity, isOpen } = body;

        if (!slotId) {
            return NextResponse.json({ error: "Missing slotId" }, { status: 400 });
        }

        const slotRef = adminDb.collection("deliverySlots").doc(slotId);
        const slotDoc = await slotRef.get();

        if (!slotDoc.exists) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }

        const updates: Partial<DeliverySlot> = {
            updatedAt: new Date().toISOString()
        };

        if (typeof capacity === 'number') {
            updates.capacity = capacity;
        }

        if (typeof isOpen === 'boolean') {
            updates.isOpen = isOpen;
        }

        await slotRef.update(updates);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Update Slot Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
