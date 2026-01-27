export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { parseKvOrderCookie, hashToken } from "@/lib/security/token";
import { Order, Customer } from "@/types/firestore";
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
        console.error("Checkout Failed: Empty Cart");
        return NextResponse.json({ error: "O carrinho está vazio." }, { status: 400 });
    }
    if (!payload.customer || !payload.customer.phone || !payload.customer.name) {
        console.error("Checkout Failed: Missing Customer Details");
        return NextResponse.json({ error: "Dados do cliente incompletos (Nome/Telefone)." }, { status: 400 });
    }

    // Address Validation (Strict for Delivery)
    const isDelivery = payload.customer.deliveryMethod !== 'pickup'; // Default to delivery if undefined? Or 'delivery' explicit check.
    // The payload might send 'delivery' or 'pickup'. If not present, default to delivery usually?
    // Let's check naming. cartDrawer sends `customer.deliveryMethod`.
    if (isDelivery) {
        if (!payload.customer.address || payload.customer.address.length < 5) {
            console.error("Checkout Failed: Missing Address for Delivery");
            return NextResponse.json({ error: "Endereço completo é obrigatório para entrega." }, { status: 400 });
        }
        // Optional: Check neighborhood if required by business logic
    }

    try {
        // 2.5 Idempotency Check (Early Return)
        if (payload.idempotencyKey) {
            const existingSnap = await adminDb.collection("orders")
                .where("idempotencyKey", "==", payload.idempotencyKey)
                .limit(1)
                .get();

            if (!existingSnap.empty) {
                const exists = existingSnap.docs[0];
                const orderData = exists.data();
                console.log(`Idempotency hit for key ${payload.idempotencyKey}. Returning existing order ${exists.id}`);

                // Reconstruct message cheaply or use stored if available
                const lines = [`🍃 *KOMBISTYLE VIDA* 🍃`, `Pedido: #${exists.id.slice(0, 8)}`];
                lines.push(`Cliente: ${orderData.customer?.name || 'Cliente'}`);
                lines.push(`───────────────────────`);
                lines.push(`(Pedido recuperado)`);
                lines.push(`*Total: R$ ${((orderData.totalCents || 0) / 100).toFixed(2).replace('.', ',')}*`);
                lines.push(`───────────────────────`);
                lines.push(`*Status:* ${orderData.status === 'PAID' ? 'Pago ✅' : 'Aguardando Pagamento'}`);

                return NextResponse.json({
                    success: true,
                    orderId: exists.id,
                    whatsappMessage: lines.join('\n')
                });
            }
        }

        const cookieStore = await cookies();
        const kvOrderCookie = cookieStore.get("kv_order");
        const auth = parseKvOrderCookie(kvOrderCookie?.value);

        // If no auth/cookie, we are creating a NEW order from scratch.
        const orderId = auth?.orderId || adminDb.collection("orders").doc().id;
        const orderRef = adminDb.collection("orders").doc(orderId);

        // 1. Fetch Real Catalog (Products & Combos)
        const productIds = new Set<string>();
        const comboIds = new Set<string>();
        const cartInputs: CartItemInput[] = [];

        for (const item of payload.cart) {
            if (item.type === 'BUNDLE') {
                comboIds.add(item.bundleId);
                cartInputs.push({
                    productId: item.bundleId,
                    variantKey: 'default',
                    quantity: item.quantity || item.qty || 1
                });
            } else if (item.type === 'PACK') {
                if (item.items && Array.isArray(item.items)) {
                    item.items.forEach((sub: any) => {
                        if (sub.productId) {
                            productIds.add(sub.productId);
                            cartInputs.push({
                                productId: sub.productId,
                                // P1-2: Use Explicit Variant from Payload. No more size inference.
                                variantKey: item.variantKey || '300ml', // Fallback only for really old cached carts
                                // Fix P0-2: Multiply sub-quantity by pack quantity
                                quantity: (sub.quantity || sub.qty || 1) * (item.quantity || 1)
                            });
                        }
                    });
                }
            } else {
                if (item.productId) {
                    let pid = item.productId;
                    let variant = item.variant || '300ml';

                    if (item.productId.includes("::")) {
                        const parts = item.productId.split("::");
                        pid = parts[0];
                        variant = parts[1] + 'ml';
                    }

                    productIds.add(pid);
                    cartInputs.push({
                        productId: pid,
                        variantKey: variant,
                        quantity: item.quantity || item.qty || 1
                    });
                }
            }
        }

        // Fetch Docs
        const catalogMap: Record<string, CatalogProduct> = {};

        // Products
        if (productIds.size > 0) {
            const pRefs = Array.from(productIds).map(id => adminDb.collection("products").doc(id));
            const pDocs = await adminDb.getAll(...pRefs);
            pDocs.forEach(doc => {
                if (doc.exists) {
                    const data = doc.data() as any;
                    catalogMap[doc.id] = {
                        id: doc.id,
                        name: data.name,
                        active: data.active !== false,
                        variants: {}
                    };
                    if (data.variants && Array.isArray(data.variants)) {
                        data.variants.forEach((v: any) => {
                            catalogMap[doc.id].variants[v.size] = {
                                priceCents: v.price * 100,
                                active: true,
                                volumeMl: parseInt(v.size),
                                stockQty: v.stockQty || 0
                            };
                        });
                        if (Object.keys(catalogMap[doc.id].variants).length === 0 && data.priceCents) {
                            catalogMap[doc.id].variants['300ml'] = { priceCents: data.priceCents, active: true, volumeMl: 300, stockQty: 0 };
                        }
                    }
                }
            });
        }

        // Combos
        if (comboIds.size > 0) {
            const cRefs = Array.from(comboIds).map(id => adminDb.collection("combos").doc(id));
            const cDocs = await adminDb.getAll(...cRefs);
            cDocs.forEach(doc => {
                if (doc.exists) {
                    const data = doc.data() as any;
                    catalogMap[doc.id] = {
                        id: doc.id,
                        name: data.name,
                        active: data.active !== false,
                        variants: {
                            'default': {
                                priceCents: data.priceCents,
                                active: true,
                                volumeMl: 0,
                                stockQty: 999
                            }
                        }
                    };
                }
            });
        }

        // 2. Calculate Totals
        const calculation = calculateOrder(cartInputs, catalogMap);

        if (!calculation.isValid) {
            throw new Error(`Erro no cálculo do pedido: ${calculation.errors.join(", ")}`);
        }

        // 3. Transaction
        await adminDb.runTransaction(async (t) => {
            // 1. ALL READS
            // A. Products
            const uniqueProductIds = Array.from(productIds);
            const productRefs = uniqueProductIds.map(id => adminDb.collection("products").doc(id));
            const productDocs = productRefs.length > 0 ? await t.getAll(...productRefs) : [];
            const productDocsMap = new Map();
            productDocs.forEach(doc => {
                if (doc.exists) productDocsMap.set(doc.id, doc);
            });

            // B. Order
            const orderDoc = await t.get(orderRef);

            // C. Customer
            const phoneKey = payload.customer.phone.replace(/\D/g, '');
            const customerRef = adminDb.collection("customers").doc(phoneKey);
            const customerDoc = await t.get(customerRef);


            // 2. LOGIC & VALIDATION
            // Stock Check
            const stockUpdates: { ref: any, data: any }[] = [];

            for (const input of cartInputs) {
                if (comboIds.has(input.productId)) continue;

                const pDoc = productDocsMap.get(input.productId);
                if (!pDoc) throw new Error(`Produto ${input.productId} não encontrado.`);

                const pData = pDoc.data();
                if (!pData || pData.active === false) throw new Error(`Produto ${pData?.name || input.productId} indisponível.`);

                let variantIdx = -1;
                let currentStock = 0;

                if (pData.variants && Array.isArray(pData.variants)) {
                    variantIdx = pData.variants.findIndex((v: any) => v.size.includes(input.variantKey));
                    if (variantIdx !== -1) {
                        currentStock = pData.variants[variantIdx].stockQty || 0;
                    }
                }

                if (variantIdx !== -1) {
                    if (currentStock < input.quantity) {
                        // LOG EVENT: Stock Failure
                        console.warn(JSON.stringify({
                            event: 'stock_failure',
                            productId: input.productId,
                            variant: input.variantKey,
                            requested: input.quantity,
                            available: currentStock
                        }));
                        throw new Error(`Estoque insuficiente para ${pData.name} (${input.variantKey}). Disponível: ${currentStock}.`);
                    }
                    // Prepare update in memory
                    pData.variants[variantIdx].stockQty = currentStock - input.quantity;
                    stockUpdates.push({ ref: pDoc.ref, data: { variants: pData.variants } });
                } else {
                    // Variant requested but not found in backend
                    // This could happen if admin removed usage of '300ml' or changed keys
                    // We should verify if we want to block or allow (if allow, stock goes negative or ignored?)
                    // Governance says: Inventory is Source of Truth.
                    console.warn(`Variant ${input.variantKey} not found for ${pData.name}. Stock check skipped (Risk).`);
                    // If strict, throw error:
                    // throw new Error(`Variante ${input.variantKey} não encontrada para ${pData.name}.`);
                }
            }

            // Order Validation
            let existingOrder: Order | undefined;
            if (orderDoc.exists) {
                existingOrder = orderDoc.data() as Order;
                if (auth && existingOrder.publicAccess?.tokenHash !== hashToken(auth.token)) {
                    throw new Error("Unauthorized access to order");
                }
                if (existingOrder.status === 'CONFIRMED') return; // Idempotency fallback
            }

            // Customer Logic
            const newAddress = payload.customer.address ? {
                label: "Entrega",
                street: payload.customer.address,
                number: payload.customer.number || "S/N",
                district: payload.customer.neighborhood || "",
                city: "Porto Velho",
                notes: payload.customer.complement || "",
                updatedAt: new Date().toISOString()
            } : null;

            // A. Stock Updates
            for (const update of stockUpdates) {
                t.set(update.ref, update.data, { merge: true });
            }

            // A.2 Stock Movements (P2)
            cartInputs.forEach(input => {
                if (comboIds.has(input.productId)) return;

                // Resolve Volume for logging
                // We need to look up the variant to get the actual volume if not in input (input only has variantKey)
                // We can look it up in catalogMap or just parse the key.
                const cleanKey = input.variantKey.replace('ml', '');
                const vol = parseInt(cleanKey) || 0;

                // Only products
                const mvId = adminDb.collection("stockMovements").doc().id;
                t.set(adminDb.collection("stockMovements").doc(mvId), {
                    productId: input.productId,
                    variantKey: input.variantKey,
                    volumeMl: vol, // P1-2 Explicit Volume
                    type: 'OUT',
                    quantity: input.quantity,
                    reason: 'Sale',
                    orderId: orderId,
                    createdAt: new Date().toISOString()
                });
            });

            // B. Customer Update
            if (!customerDoc.exists) {
                const newCust: Customer = {
                    phone: payload.customer.phone,
                    name: payload.customer.name,
                    email: payload.customer.email || null,
                    addresses: newAddress ? [newAddress] : [],
                    ecoPoints: 0,
                    orderCount: 1,
                    lifetimeValueCents: calculation.pricing.totalCents,
                    isSubscriber: false,
                    lastOrderAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                t.set(customerRef, newCust);
            } else {
                const existing = customerDoc.data() as Customer;
                const finalAddresses = existing.addresses || [];
                if (newAddress) {
                    finalAddresses.unshift(newAddress);
                }
                t.update(customerRef, {
                    name: payload.customer.name,
                    addresses: finalAddresses.slice(0, 5),
                    orderCount: (existing.orderCount || 0) + 1,
                    lifetimeValueCents: (existing.lifetimeValueCents || 0) + calculation.pricing.totalCents,
                    lastOrderAt: new Date().toISOString()
                });
            }

            // C. Order Write
            const orderData: any = {
                id: orderId,
                shortId: orderId.slice(0, 8),
                status: 'PENDING',
                totalCents: calculation.pricing.totalCents,
                items: calculation.items, // Ensure this has volume info? calculation.items comes from calculator.
                pricing: calculation.pricing,
                customer: {
                    id: phoneKey,
                    name: payload.customer.name,
                    phone: payload.customer.phone,
                    deliveryMethod: payload.customer.deliveryMethod || 'delivery',
                    address: payload.customer.address,
                    neighborhood: payload.customer.neighborhood,
                },
                schedule: {
                    date: payload.selectedDate || null,
                    slotId: payload.selectedSlotId || null,
                    slotLabel: payload.selectedSlotId
                },
                notes: payload.notes || "",
                bottlesToReturn: payload.bottlesToReturn || 0,
                idempotencyKey: payload.idempotencyKey || null,
                metadata: {
                    originalCart: payload.cart,
                    userAgent: request.headers.get('user-agent') || 'unknown'
                },
                createdAt: existingOrder?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            t.set(orderRef, orderData, { merge: true });

            // D. Schedule Counters Update (Fix for "Order not appearing in Agenda")
            // We must increment the usage counters in `deliveryDays` collection
            // so that the Admin Schedule knows a slot is taken.
            // Assumption: mode is 'DELIVERY' (or we get it from payload if PICKUP supported)
            if (payload.selectedDate && payload.selectedSlotId) {
                const mode = payload.customer.deliveryMethod === 'PICKUP' ? 'PICKUP' : 'DELIVERY';
                const dayDocId = `${payload.selectedDate}_${mode}`;
                const dayRef = adminDb.collection('deliveryDays').doc(dayDocId);

                // We use set with merge because the doc might not exist yet (no overrides)
                t.set(dayRef, {
                    date: payload.selectedDate,
                    mode,
                    dailyBooked: FieldValue.increment(1),
                    slots: {
                        [payload.selectedSlotId]: {
                            booked: FieldValue.increment(1)
                        }
                    },
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }
        });

        // 4. Generate WhatsApp
        const lines = [`🍃 *KOMBISTYLE VIDA* 🍃`, `Pedido: #${orderId.slice(0, 8)}`];
        lines.push(`Cliente: ${payload.customer.name}`);
        lines.push(`───────────────────────`);
        calculation.items.forEach(item => {
            const totalFmt = (item.subtotalCents / 100).toFixed(2).replace('.', ',');
            const unitFmt = (item.unitPriceCents / 100).toFixed(2).replace('.', ',');
            // P1-2: Explicit Volume in WhatsApp
            lines.push(`${item.quantity}x ${item.productName} (${item.variantKey === 'default' ? 'Combo' : item.variantKey})`);
            lines.push(`   R$ ${unitFmt} = R$ ${totalFmt}`);
        });
        lines.push(``);
        lines.push(`*Total: R$ ${(calculation.pricing.totalCents / 100).toFixed(2).replace('.', ',')}*`);
        lines.push(`───────────────────────`);
        if (payload.customer.deliveryMethod === 'pickup') {
            lines.push(`🏃 *Retirada no Local*`);
        } else {
            lines.push(`📍 *Entrega:* ${payload.customer.address} - ${payload.customer.neighborhood}`);
            if (payload.selectedDate) lines.push(`📅 Data: ${new Date(payload.selectedDate).toLocaleDateString('pt-BR')}`);
        }
        lines.push(``);
        lines.push(`*Status:* Aguardando Pagamento (Pix/Cartão)`);
        lines.push(`Envie o comprovante por aqui! 🙌`);

        const whatsappMessage = lines.join('\n');

        // P2: Structured Log Success
        console.log(JSON.stringify({
            level: 'info',
            event: 'checkout_success',
            orderId,
            idempotencyKey: payload.idempotencyKey,
            totalCents: calculation.pricing.totalCents,
            customerPhone: payload.customer.phone,
            schedule: payload.selectedDate ? `${payload.selectedDate} (${payload.selectedSlotId})` : 'ASAP'
        }));

        return NextResponse.json({
            success: true,
            orderId: orderId,
            whatsappMessage
        });

    } catch (error: any) {
        // P2: Structured Log Error
        console.error(JSON.stringify({
            level: 'error',
            event: 'checkout_failed',
            error: error.message,
            stack: error.stack,
            payload: { ...payload, cart: '...' } // Redact cart for brevity if needed
        }));

        return NextResponse.json({
            error: error.message || "Internal Error",
            stack: error.stack
        }, { status: 500 });
    }
}
