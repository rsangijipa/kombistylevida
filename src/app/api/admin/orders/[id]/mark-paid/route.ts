import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Transaction } from "firebase-admin/firestore";
import { Order, InventoryMovement } from "@/types/firestore";
import { CatalogProduct } from "@/lib/pricing/calculator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Next.js 15/16 await params
    const { id: orderId } = await params;

    let payload: { method: string } | undefined;
    try {
        payload = await request.json();
    } catch (e: unknown) {
        // payload optional, default to OTHER if not provided
    }
    const method = payload?.method || "OTHER";

    if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    try {
        await adminDb.runTransaction(async (t: Transaction) => {
            const orderRef = adminDb.collection("orders").doc(orderId);
            const orderDoc = await t.get(orderRef);

            if (!orderDoc.exists) throw new Error("Order not found");
            const order = orderDoc.data() as Order;

            if (order.status === "CANCELED") throw new Error("Cannot pay a canceled order");
            if (order.status === "PAID" || order.payment?.status === "PAID") {
                // Already paid, idempotency or error? 
                // If already paid, maybe just return success, but ensure we don't double decrement stock.
                // We'll throw to be safe/clear in UI.
                throw new Error("Order is already marked as PAID");
            }

            // 1. Prepare Stock Decrement (Read Catalog)
            // We need to read catalog for every item to get current stock and decrement it.
            const productIds = Array.from(new Set(order.items.map(i => i.productId)));
            const productRefs = productIds.map(id => adminDb.collection("catalog").doc(id));
            const productDocs = await Promise.all(productRefs.map(ref => t.get(ref)));

            const catalogMap: Record<string, CatalogProduct> = {};
            productDocs.forEach(doc => {
                if (doc.exists) catalogMap[doc.id] = { id: doc.id, ...doc.data() } as CatalogProduct;
            });

            // 2. Decrement Logic
            for (const item of order.items) {
                const prod = catalogMap[item.productId];
                if (!prod) throw new Error(`Product ${item.productId} not found in catalog`);

                const variantKey = item.size === '500ml' ? '500ml' : (item.size === '300ml' ? '300ml' : (item.variantKey || '300ml'));
                // Note: item.variantKey should be present from our new checkout. If legacy order, might be missing.
                // We try to infer.

                const currentStock = prod.variants?.[variantKey]?.stockQty || 0;

                // Warn/Block if negative? "Traditional operation" allows negative if physical inventory exists but system is behind.
                // But better to allow it to go negative than block a payment that actually happened.
                // We will decrement.

                t.update(adminDb.collection("catalog").doc(item.productId), {
                    [`variants.${variantKey}.stockQty`]: currentStock - (item.quantity || (item as any).qty || 1)
                });

                // 3. Log Movement
                const moveRef = adminDb.collection("stockMovements").doc();
                const movement: InventoryMovement = {
                    id: moveRef.id,
                    productId: item.productId,
                    type: 'SALE', // Out
                    quantity: item.quantity || (item as any).qty || 1,
                    reason: `Order ${orderId} PAID`,
                    orderId: orderId,
                    createdAt: new Date().toISOString()
                };
                t.set(moveRef, movement);
            }

            // 4. Update Order Status
            t.update(orderRef, {
                status: "PAID",
                "payment.status": "PAID",
                "payment.paidAt": new Date().toISOString(),
                "payment.method": method,
                "logistics.status": "TO_PREPARE", // Ready for production
                updatedAt: new Date().toISOString()
            });

            // 5. Update Agenda Item (if exists)
            // Agenda path: agenda/{YYYY-MM-DD}/items/{orderId}
            // Use scheduled date or created date?
            // If we saved it to agenda, we likely used `order.schedule.date` or `order.delivery.date`.
            // We can try to update it if we know the date.
            // If we can't find it easily, we might skip or rely on a function trigger.
            // For strict correctness, we should try.
            const date = order.schedule?.date || order.delivery?.date;
            if (date) {
                const agendaRef = adminDb.collection("agenda").doc(date).collection("items").doc(orderId);
                // We use set merge just in case
                t.set(agendaRef, { status: "PAID" }, { merge: true }); // Update status in agenda view
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error("Mark Paid Error:", error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
