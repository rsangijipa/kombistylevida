export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { logEvent, logError } from "@/lib/logger";
import { Order, Product } from "@/types/firestore";
import { adminGuard } from "@/lib/auth/adminGuard";

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { orderId, reason, actor } = body;

    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    try {
        await adminGuard();
        await adminDb.runTransaction(async (t) => {
            const orderRef = adminDb.collection("orders").doc(orderId);
            const orderDoc = await t.get(orderRef);

            if (!orderDoc.exists) throw new Error("Pedido não encontrado");

            const order = orderDoc.data() as Order;

            if (order.status === 'CANCELED') {
                return; // Idempotent
            }

            // 1. Revert Stock
            // We need to fetch products to update stock
            const productIds = new Set<string>();
            order.items.forEach(item => {
                if (!item.subItems) {
                    productIds.add(item.productId);
                } else {
                    // Pack: subItems have productId
                    item.subItems.forEach(sub => productIds.add(sub.productId));
                }
            });

            // If products are deleted, we can't restore stock easily, but let's try
            const pRefs = Array.from(productIds).map(id => adminDb.collection("products").doc(id));
            const pDocs = await t.getAll(...pRefs);
            const pMap = new Map<string, Product>();
            pDocs.forEach(d => { if (d.exists) pMap.set(d.id, d.data() as Product); });

            order.items.forEach(item => {
                // Check if it's a bundle/pack with subItems
                if (item.subItems && item.subItems.length > 0) {
                    // It's a Pack or Bundle -> Restore the sub-components
                    item.subItems.forEach(sub => {
                        const pid = sub.productId;
                        // For packs, the sub-items usually follow the pack's variant size (e.g. 300ml)
                        // or default to '300ml' if not specified.
                        const variantKey = item.variantKey || '300ml';
                        // Total quantity to restore = (qty per pack) * (number of packs)
                        const quantityToRestore = sub.quantity * item.quantity;

                        const pData = pMap.get(pid);
                        if (pData && pData.variants) {
                            // Find the variant to restore (e.g. '300ml')
                            const vIdx = pData.variants.findIndex((v) => v.size.includes(variantKey));
                            if (vIdx !== -1) {
                                // Restore Stock
                                pData.variants[vIdx].stockQty = (pData.variants[vIdx].stockQty || 0) + quantityToRestore;
                                // Queue the update (will be batched if multiple items hit same doc, 
                                // but here we are setting effectively last-write-wins per doc in this loop. 
                                // Ideally we should aggregate updates per doc first, but since order items are usually distinct products, this is acceptable for now.
                                // If a pack contains A and B, and another item is A, we might have a race in this local map if not careful.
                                // Better approach: Update the object in pMap, then write all pMap changes at the end? 
                                // No, pData is a reference to the object in the Map. So updating pData.variants updates the Map.
                                // We just need to make sure we write the Map back to Firestore.

                                // Log Movement
                                const mvId = adminDb.collection("stockMovements").doc().id;
                                t.set(adminDb.collection("stockMovements").doc(mvId), {
                                    productId: pid,
                                    variantKey,
                                    type: 'IN', // Revert
                                    quantity: quantityToRestore,
                                    reason: `Cancellation: ${reason || 'Admin'} (Pack Item)`,
                                    orderId,
                                    createdAt: new Date().toISOString()
                                });
                            }
                        }
                    });
                } else {
                    // Simple Product (Single)
                    const pid = item.productId;
                    const variantKey = item.variantKey || (item.size || '300ml');
                    const quantityToRestore = item.quantity;

                    const pData = pMap.get(pid);
                    if (pData && pData.variants) {
                        const vIdx = pData.variants.findIndex((v) => v.size.includes(variantKey));
                        if (vIdx !== -1) {
                            pData.variants[vIdx].stockQty = (pData.variants[vIdx].stockQty || 0) + quantityToRestore;

                            // Log Movement
                            const mvId = adminDb.collection("stockMovements").doc().id;
                            t.set(adminDb.collection("stockMovements").doc(mvId), {
                                productId: pid,
                                variantKey,
                                variant: variantKey, // Legacy campatibility
                                type: 'IN', // Revert
                                quantity: quantityToRestore,
                                reason: `Cancellation: ${reason || 'Admin'}`,
                                orderId,
                                createdAt: new Date().toISOString()
                            });
                        }
                    }
                }
            });

            // Write back all modified products from pMap
            pMap.forEach((product, pid) => {
                t.set(adminDb.collection("products").doc(pid), { variants: product.variants }, { merge: true });
            });


            // 2. Revert Schedule (DeliveryDays)
            if (order.schedule?.date && order.schedule?.slotId) {
                // If pickup, mode = PICKUP
                const isPickup = order.customer.deliveryMethod === 'pickup'; // CHECK EXACT STRING
                // In checkout we used: payload.customer.deliveryMethod === 'PICKUP' ? 'PICKUP' : 'DELIVERY';
                // Firestore type: 'delivery' | 'pickup' (lowercase)
                // Let's normalize.
                const mode = order.customer.deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY';

                const dayDocId = `${order.schedule.date}_${mode}`;
                const dayRef = adminDb.collection('deliveryDays').doc(dayDocId);

                // Decrement
                t.set(dayRef, {
                    dailyBooked: FieldValue.increment(-1),
                    slots: {
                        [order.schedule.slotId]: {
                            booked: FieldValue.increment(-1)
                        }
                    }
                }, { merge: true });
            }

            // 3. Update Order Status
            t.update(orderRef, {
                status: 'CANCELED',
                canceledAt: new Date().toISOString(),
                canceledBy: actor || 'admin',
                cancelReason: reason || ''
            });
        });

        logEvent('order_canceled', { orderId, reason });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Cancellation failed";
        logError('order_cancel_failed', message, { orderId });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
