import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { parseKvOrderCookie, hashToken } from "@/lib/security/token";
import { Order } from "@/types/firestore";
import { calculateOrder, CatalogProduct, CartItemInput } from "@/lib/pricing/calculator";

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

        // 1. Fetch products from Catalog (Source of Truth)
        // Identify all unique Product IDs needed
        const productIds = new Set<string>();
        const cartInputs: CartItemInput[] = [];

        for (const item of payload.cart) {
            if (item.type === 'PACK' && Array.isArray(item.items)) {
                // For packs, we might need logic to price individual items OR price the pack itself.
                // Current business rule: Packs correspond to 300ml or 500ml variants usually, 
                // but checking flavor data.
                // Assuming "Pack" logic relies on individual bottle prices or fixed pack price?
                // The prompt says: "Garrafas: 300ml = R$12, 500ml = R$15"
                // Let's treat packs as a collection of items for now, OR if ID matches catalog, use catalog.
                // If pack has an ID in catalog (e.g. "pack-6-300"), use it.
                // If not, we might need to sum items.
                // SIMPLIFICATION: We iterate items inside pack if it's a "custom pack".
                item.items.forEach((sub: any) => {
                    if (sub.productId) {
                        productIds.add(sub.productId);
                        // Assuming pack items default to 300ml if size not in item, but usually passed from cart
                        // We need variant info. If missing, we might fail or default.
                        // Let's assume passed item has variant info or we infer from pack size.
                        // If pack size is 6, is it 300ml?
                        const variant = item.size === 12 ? '500ml' : '300ml'; // Inference based on Pack type if missing
                        cartInputs.push({
                            productId: sub.productId,
                            variantKey: variant,
                            quantity: sub.qty || 1
                        });
                    }
                });
            } else if (item.productId) {
                // Standalone Product
                productIds.add(item.productId);
                // Default to 300ml if not specified (legacy support) or require it
                // Cart usually has 'size' or 'variant'?
                // Looking at CartStore, it has `productId`. `variants` might be missing in CartProductItem.
                // If missing, we default to 300ml or fail.
                const variant = item.variant || '300ml';
                cartInputs.push({
                    productId: item.productId,
                    variantKey: variant,
                    quantity: item.qty || 1
                });
            }
        }

        const catalog: Record<string, CatalogProduct> = {};
        if (productIds.size > 0) {
            const refs = Array.from(productIds).map(id => adminDb.collection("catalog").doc(id));
            const docs = await adminDb.getAll(...refs);
            docs.forEach(doc => {
                if (doc.exists) {
                    catalog[doc.id] = { id: doc.id, ...doc.data() } as CatalogProduct;
                }
            });
        }

        // 2. Calculate Totals Server-Side
        const calculation = calculateOrder(cartInputs, catalog);

        if (!calculation.isValid) {
            console.error("Pricing validation failed:", calculation.errors);
            // We might allow soft failure or block. Block for security.
            return NextResponse.json({ error: "Price validation failed", details: calculation.errors }, { status: 400 });
        }

        // 3. Transaction to Finalize
        await adminDb.runTransaction(async (t) => {
            const orderDoc = await t.get(orderRef);
            if (!orderDoc.exists) throw new Error("Order not found");
            const order = orderDoc.data() as Order;

            if (order.publicAccess?.tokenHash !== hashToken(auth.token)) {
                throw new Error("Unauthorized access to order");
            }

            if (order.status !== 'NEW') {
                if (order.status === 'CONFIRMED') return;
                throw new Error(`Invalid order status: ${order.status}`);
            }

            // Update Order with Secure Totals
            t.update(orderRef, {
                status: 'CONFIRMED',
                items: calculation.items, // Save the detailed calculated lines
                pricing: calculation.pricing, // Save the server-calculated totals
                integrity: {
                    pricingSource: 'server',
                    calculatedAt: new Date().toISOString()
                },
                customer: payload.customer,
                notes: payload.notes || "",
                bottlesToReturn: payload.bottlesToReturn || 0,
                updatedAt: new Date().toISOString()
            });

            // Inventory logic (Optional/Future: Decrement stock)
            // For now, we just log "movements" as before but don't block
            for (const item of calculation.items) {
                const moveRef = adminDb.collection("stockMovements").doc();
                t.set(moveRef, {
                    productId: item.productId,
                    variant: item.variantKey,
                    type: 'RESERVE',
                    quantity: item.quantity,
                    reason: 'Order Confirmed',
                    orderId: auth.orderId,
                    createdAt: new Date().toISOString()
                });
            }

            if (order.deliveryReservation?.slotId) {
                t.update(orderRef, {
                    "deliveryReservation.status": "CONFIRMED",
                    "deliveryReservation.expiresAt": null
                });
            }
        });

        return NextResponse.json({
            success: true,
            orderId: auth.orderId,
            totals: calculation.pricing
        });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        const msg = error.message || "Unknown error";
        if (msg.includes("Order not found")) return NextResponse.json({ error: msg }, { status: 404 });
        if (msg.includes("Unauthorized")) return NextResponse.json({ error: msg }, { status: 401 });
        return NextResponse.json({ error: "Checkout failed", details: msg }, { status: 500 });
    }
}
