import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { parseKvOrderCookie, hashToken } from "@/lib/security/token";
import { Order } from "@/types/firestore";

export async function POST(request: Request) {
    let payload;
    try {
        payload = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Input Validation
    if (!payload.cart || !Array.isArray(payload.cart) || payload.cart.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!payload.customer) {
        return NextResponse.json({ error: "Customer details missing" }, { status: 400 });
    }

    try {
        const cookieStore = await cookies();
        const kvOrderCookie = cookieStore.get("kv_order");
        const auth = parseKvOrderCookie(kvOrderCookie?.value);

        if (!auth) {
            return NextResponse.json({ error: "No active session" }, { status: 401 });
        }

        const orderRef = adminDb.collection("orders").doc(auth.orderId);

        // Transaction to finalize
        await adminDb.runTransaction(async (t) => {
            // --- READS ---
            const orderDoc = await t.get(orderRef);
            if (!orderDoc.exists) throw new Error("Order not found");
            const order = orderDoc.data() as Order;

            if (order.publicAccess?.tokenHash !== hashToken(auth.token)) {
                throw new Error("Unauthorized access to order");
            }

            if (order.status !== 'NEW') {
                // If already confirmed, just return success (idempotency)
                if (order.status === 'CONFIRMED') return;
                throw new Error(`Invalid order status: ${order.status}`);
            }

            // Check Delivery Reservation
            if (order.delivery?.type === 'SCHEDULED') {
                if (!order.deliveryReservation?.slotId) {
                    throw new Error("Delivery slot not reserved");
                }
                // Could check status here too, usually 'HELD'
            }

            // Prepare Inventory Reads
            const itemsToReserve: { productId: string; qty: number }[] = [];
            for (const item of payload.cart) {
                const cartItem = item as Record<string, any>;
                if (cartItem.type === 'PACK' && Array.isArray(cartItem.items)) {
                    cartItem.items.forEach((sub: Record<string, any>) => {
                        if (sub.productId) itemsToReserve.push({ productId: sub.productId, qty: sub.qty || 1 });
                    });
                } else if (cartItem.productId) {
                    itemsToReserve.push({ productId: cartItem.productId, qty: cartItem.qty || 1 });
                }
            }

            // Read Inventory Docs
            const inventoryReads = await Promise.all(
                itemsToReserve.map(async (res) => {
                    const ref = adminDb.collection("inventory").doc(res.productId);
                    const doc = await t.get(ref);
                    return { ...res, ref, doc };
                })
            );

            // --- WRITES ---

            // 1. Update Order
            t.update(orderRef, {
                status: 'CONFIRMED',
                items: payload.cart.map((item: any) => {
                    if (!item.productId) throw new Error("Invalid cart item: missing productId");
                    return {
                        productId: item.productId,
                        qty: item.qty || 1,
                        price: item.price || 0, // Fallback if price missing
                        ...item
                    };
                }),
                customer: payload.customer,
                notes: payload.notes || "",
                bottlesToReturn: payload.bottlesToReturn || 0,
                totalCents: payload.totalCents || 0,
                updatedAt: new Date().toISOString()
            });

            // 2. Update Inventory
            for (const item of inventoryReads) {
                if (item.doc.exists) {
                    const current = item.doc.data()?.reservedStock || 0;
                    t.update(item.ref, {
                        reservedStock: current + item.qty,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    t.set(item.ref, {
                        productId: item.productId,
                        currentStock: 0,
                        reservedStock: item.qty,
                        updatedAt: new Date().toISOString()
                    });
                }

                const moveRef = adminDb.collection("stockMovements").doc();
                t.set(moveRef, {
                    productId: item.productId,
                    type: 'RESERVE',
                    quantity: item.qty,
                    reason: 'Order Confirmed',
                    orderId: auth.orderId,
                    createdAt: new Date().toISOString()
                });
            }

            // 3. Confirm Reservation
            if (order.deliveryReservation?.slotId) {
                t.update(orderRef, {
                    "deliveryReservation.status": "CONFIRMED",
                    "deliveryReservation.expiresAt": null
                });
            }
        });

        return NextResponse.json({ success: true, orderId: auth.orderId });

    } catch (error: any) {
        console.error("Checkout Error:", error);

        const msg = error.message || "Unknown error";
        if (msg.includes("Order not found")) return NextResponse.json({ error: msg }, { status: 404 });
        if (msg.includes("Unauthorized")) return NextResponse.json({ error: msg }, { status: 401 });
        if (msg.includes("Invalid cart item")) return NextResponse.json({ error: msg }, { status: 400 });
        if (msg.includes("Delivery slot")) return NextResponse.json({ error: msg }, { status: 409 });

        return NextResponse.json({ error: "Checkout failed", details: msg }, { status: 500 });
    }
}
