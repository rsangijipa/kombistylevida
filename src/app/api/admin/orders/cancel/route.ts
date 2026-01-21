export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { logEvent, logError } from "@/lib/logger";
import { Order } from "@/types/firestore";

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
            const pMap = new Map();
            pDocs.forEach(d => { if (d.exists) pMap.set(d.id, d.data()); });

            order.items.forEach(item => {
                // Handle PACK
                if (item.subItems) {
                    // TODO: Pack logic revert.
                    // The checkout flattened pack items into cartInputs? No, Checkout kept them as Items in Order but Stock was deducted from components.
                    // Wait, Checkout log: cartInputs pushed simple items.
                    // Order.items stores the structure.
                    // We need to revert exactly what was deducted.
                    // Checkout deduces:
                    // if item.type === 'PACK' -> forEach sub -> deduce sub.quantity * item.quantity

                    item.subItems.forEach(sub => {
                        const pid = sub.productId;
                        const variantKey = item.variantKey || '300ml'; // stored in item for pack? Checkout puts it in item.
                        const quantityToRestore = (sub.quantity) * (item.quantity);

                        const pData = pMap.get(pid);
                        if (pData && pData.variants) {
                            const vIdx = pData.variants.findIndex((v: any) => v.size.includes(variantKey));
                            if (vIdx !== -1) {
                                pData.variants[vIdx].stockQty = (pData.variants[vIdx].stockQty || 0) + quantityToRestore;
                                t.set(adminDb.collection("products").doc(pid), { variants: pData.variants }, { merge: true });

                                // Stock Movement
                                const mvId = adminDb.collection("stockMovements").doc().id;
                                t.set(adminDb.collection("stockMovements").doc(mvId), {
                                    productId: pid,
                                    variantKey,
                                    type: 'IN', // Revert
                                    quantity: quantityToRestore,
                                    reason: `Cancellation: ${reason || 'Admin'}`,
                                    orderId,
                                    createdAt: new Date().toISOString()
                                });
                            }
                        }
                    });

                } else {
                    // Simple Product
                    const pid = item.productId;
                    const variantKey = item.variantKey || (item.size || '300ml');
                    const quantityToRestore = item.quantity;

                    const pData = pMap.get(pid);
                    if (pData && pData.variants) {
                        const vIdx = pData.variants.findIndex((v: any) => v.size.includes(variantKey));
                        if (vIdx !== -1) {
                            pData.variants[vIdx].stockQty = (pData.variants[vIdx].stockQty || 0) + quantityToRestore;
                            t.set(adminDb.collection("products").doc(pid), { variants: pData.variants }, { merge: true });

                            // Stock Movement
                            const mvId = adminDb.collection("stockMovements").doc().id;
                            t.set(adminDb.collection("stockMovements").doc(mvId), {
                                productId: pid,
                                variantKey,
                                type: 'IN',
                                quantity: quantityToRestore,
                                reason: `Cancellation: ${reason || 'Admin'}`,
                                orderId,
                                createdAt: new Date().toISOString()
                            });
                        }
                    }
                }
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
    } catch (error: any) {
        logError('order_cancel_failed', error, { orderId });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
