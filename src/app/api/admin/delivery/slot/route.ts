import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
// import { headers } from "next/headers";

export async function PATCH(request: Request) {
    try {
        // TODO: Add Authentication Check here (e.g. check cookie or header)
        // const headerList = headers();
        // const secret = headerList.get("x-admin-secret");
        // if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

        const updates: any = {
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
