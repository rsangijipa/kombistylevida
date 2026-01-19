import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { parseKvOrderCookie, hashToken } from "@/lib/security/token";
import { Order, Customer, InventoryMovement } from "@/types/firestore";
import { calculateOrder, CatalogProduct, CartItemInput } from "@/lib/pricing/calculator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

        // If no auth/cookie, we are creating a NEW order from scratch.
        // We will generate the ID and handle it.
        const orderId = auth?.orderId || adminDb.collection("orders").doc().id;
        const orderRef = adminDb.collection("orders").doc(orderId);
        const isNewOrder = !auth; // Marker to skip specific "update existing" checks if irrelevant



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
        // 3. Transaction to Finalize (ATOMIC)
        await adminDb.runTransaction(async (t) => {
            // A. READ: Order (if exists)
            const orderDoc = await t.get(orderRef);
            let existingOrder: Order | undefined;

            if (orderDoc.exists) {
                existingOrder = orderDoc.data() as Order;
                if (auth && existingOrder.publicAccess?.tokenHash !== hashToken(auth.token)) {
                    throw new Error("Unauthorized access to order");
                }
                if (existingOrder.status === 'CONFIRMED') return; // Idempotency
            }

            // B. READ: Catalog (for Stock Check)
            // Ideally we re-fetch relevant product docs here to ensure stock hasn't changed.
            const productRefs = calculation.items.map(i => adminDb.collection('catalog').doc(i.productId));
            const productDocs = await Promise.all(productRefs.map(ref => t.get(ref)));
            const stockMap: Record<string, CatalogProduct> = {};

            productDocs.forEach(doc => {
                if (doc.exists) stockMap[doc.id] = { id: doc.id, ...doc.data() } as CatalogProduct;
            });

            // Verify Stock Levels
            for (const item of calculation.items) {
                const prod = stockMap[item.productId];
                if (!prod) throw new Error(`Product ${item.productId} not found during checkout`);
                const variant = prod.variants[item.variantKey];
                if (!variant) throw new Error(`Variant ${item.variantKey} missing`);

                // Check Stock
                if (variant.stockQty !== undefined && variant.stockQty < item.quantity) {
                    throw new Error(`Estoque insuficiente para ${item.productName} (${item.variantKey}). Restam: ${variant.stockQty}`);
                }
            }

            // C. WRITE: Customer Upsert
            const phoneKey = payload.customer.phone.replace(/\D/g, '');
            const customerRef = adminDb.collection("customers").doc(phoneKey);
            const customerDoc = await t.get(customerRef);

            const newAddress = payload.customer.address ? {
                street: payload.customer.address,
                number: "S/N",
                district: payload.customer.neighborhood || "",
                city: "Porto Velho",
                updatedAt: new Date().toISOString()
            } : null;

            if (!customerDoc.exists) {
                const newCustomer: Customer = {
                    phone: payload.customer.phone,
                    name: payload.customer.name,
                    addresses: newAddress ? [newAddress] : [],
                    ecoPoints: 0,
                    orderCount: 1,
                    lifetimeValueCents: calculation.pricing.totalCents,
                    isSubscriber: false,
                    lastOrderAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                t.set(customerRef, newCustomer);
            } else {
                const existing = customerDoc.data() as Customer;
                t.update(customerRef, {
                    name: payload.customer.name,
                    orderCount: (existing.orderCount || 0) + 1,
                    lifetimeValueCents: (existing.lifetimeValueCents || 0) + calculation.pricing.totalCents,
                    lastOrderAt: new Date().toISOString()
                });
            }

            // D. WRITE: Order
            // D. WRITE: Order
            const orderData = {
                id: orderId,
                status: 'PENDING', // Start as PENDING (Unpaid)
                items: calculation.items,
                pricing: calculation.pricing,
                integrity: {
                    pricingSource: 'server',
                    calculatedAt: new Date().toISOString()
                },
                customer: {
                    ...payload.customer,
                    id: phoneKey // Link to customer doc
                },
                notes: payload.notes || "",
                bottlesToReturn: payload.bottlesToReturn || 0,
                createdAt: existingOrder?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                paymentStatus: 'UNPAID',
                logistics: {
                    status: 'TO_PREPARE',
                    notes: ''
                }
            };
            t.set(orderRef, orderData, { merge: true });


            // F. WRITE: Delivery Agenda (Capacity)
            if (existingOrder && existingOrder.deliveryReservation?.slotId) {
                t.update(orderRef, {
                    "deliveryReservation.status": "CONFIRMED",
                    "deliveryReservation.expiresAt": null
                });
            }
        });

        // 4. Generate WhatsApp Message (Server Side)
        const lines = [];
        lines.push(`🍃 *KOMBISTYLE VIDA — NOVO PEDIDO* 🍃`);
        lines.push(`Pedido: #${orderId.slice(0, 8)}`);
        lines.push(`Cliente: ${payload.customer.name}`);
        lines.push(`───────────────────────`);

        calculation.items.forEach(item => {
            const totalFmt = (item.subtotalCents / 100).toFixed(2).replace('.', ',');
            const unitFmt = (item.unitPriceCents / 100).toFixed(2).replace('.', ',');
            lines.push(`${item.quantity}x ${item.productName} (${item.variantKey}) — R$ ${unitFmt} = R$ ${totalFmt}`);
        });

        lines.push(``);
        lines.push(`*Subtotal:* R$ ${(calculation.pricing.subtotalCents / 100).toFixed(2).replace('.', ',')}`);
        // If shipping...
        if (calculation.pricing.shippingCents > 0) {
            lines.push(`*Entrega:* R$ ${(calculation.pricing.shippingCents / 100).toFixed(2).replace('.', ',')}`);
        }
        lines.push(`*Total:* R$ ${(calculation.pricing.totalCents / 100).toFixed(2).replace('.', ',')}`);

        lines.push(`───────────────────────`);
        if (payload.customer.address) {
            lines.push(`📍 *Entrega:* ${payload.customer.address} - ${payload.customer.neighborhood || ''}`);
        } else {
            lines.push(`🏃 *Retirada*`);
        }

        if (payload.notes) lines.push(`📝 Obs: ${payload.notes}`);

        lines.push(``);
        lines.push(`*Status:* Aguardando Pagamento (Pix/Cartão)`);
        lines.push(`Envie o comprovante por aqui para confirmarmos! 🙌`);

        const whatsappMessage = lines.join('\n');

        return NextResponse.json({
            success: true,
            orderId: orderId,
            totals: calculation.pricing,
            whatsappMessage: whatsappMessage
        });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        const msg = error.message || "Unknown error";
        if (msg.includes("Order not found")) return NextResponse.json({ error: msg }, { status: 404 });
        if (msg.includes("Unauthorized")) return NextResponse.json({ error: msg }, { status: 401 });
        return NextResponse.json({ error: "Checkout failed", details: msg }, { status: 500 });
    }
}
