import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await context.params;
        const updatedBy = "admin"; // Placeholder

        await adminDb.runTransaction(async (t) => {
            const orderRef = adminDb.collection("orders").doc(orderId);
            const orderDoc = await t.get(orderRef);

            if (!orderDoc.exists) {
                throw new Error("Order not found");
            }

            const customOrder = orderDoc.data() as Order;

            if (customOrder.status === 'CANCELED') {
                return; // Already canceled
            }

            // Restore Stock
            const items = customOrder.items || [];
            const productIds = new Set(items.map(i => i.productId));

            const productsToUpdate = new Map<string, any>();

            // 1. Load Data
            const uniqueIds = Array.from(productIds);
            const refs = uniqueIds.map(id => adminDb.collection("products").doc(id));
            if (refs.length > 0) {
                const docs = await t.getAll(...refs);
                docs.forEach(d => {
                    if (d.exists) productsToUpdate.set(d.id, { ref: d.ref, data: d.data() });
                });
            }

            // 2. Modify Data in Memory
            for (const item of items) {
                const entry = productsToUpdate.get(item.productId);
                if (entry && entry.data && entry.data.variants) {
                    const idx = entry.data.variants.findIndex((v: any) => v.size && v.size.includes(item.variantKey));
                    if (idx !== -1) {
                        const current = entry.data.variants[idx].stockQty || 0;
                        entry.data.variants[idx].stockQty = current + item.quantity;
                    }
                }
            }

            // 3. Write Back
            productsToUpdate.forEach((entry) => {
                t.set(entry.ref, { variants: entry.data.variants }, { merge: true });
            });

            // Update Order
            t.update(orderRef, {
                status: 'CANCELED',
                updatedAt: new Date().toISOString(),
                // Audit Trail
                history: FieldValue.arrayUnion({
                    action: 'CANCELED',
                    timestamp: new Date().toISOString(),
                    user: updatedBy,
                    details: `Canceled via Admin UI`
                })
            } as any);
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Cancel Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
