import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { adminGuard } from "@/lib/auth/adminGuard";
import { writeAuditEvent } from "@/lib/audit";

type ProductVariant = {
    size?: string;
    stockQty?: number;
};

type ProductEntry = {
    ref: FirebaseFirestore.DocumentReference;
    data: {
        variants?: ProductVariant[];
    };
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    let admin: { uid?: string; email?: string; role?: string } | null = null;
    try {
        admin = await adminGuard();
        const { id: orderId } = await context.params;
        const updatedBy = admin?.email || admin?.uid || "admin";

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

            const productsToUpdate = new Map<string, ProductEntry>();

            // 1. Load Data
            const uniqueIds = Array.from(productIds);
            const refs = uniqueIds.map(id => adminDb.collection("products").doc(id));
            if (refs.length > 0) {
                const docs = await t.getAll(...refs);
                docs.forEach(d => {
                    if (d.exists) {
                        productsToUpdate.set(d.id, {
                            ref: d.ref,
                            data: (d.data() as ProductEntry['data']) || {}
                        });
                    }
                });
            }

            // 2. Modify Data in Memory
            for (const item of items) {
                const entry = productsToUpdate.get(item.productId);
                if (entry && entry.data && entry.data.variants) {
                    const idx = entry.data.variants.findIndex((v) => v.size && v.size.includes(item.variantKey || ''));
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
            });
        });

        await writeAuditEvent({
            action: "ORDER_CANCELED",
            target: `orders/${orderId}`,
            actorUid: admin?.uid,
            actorEmail: admin?.email,
            role: admin?.role,
            details: "Pedido cancelado via admin",
            metadata: { orderId },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        }
        console.error("Cancel Error:", error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
