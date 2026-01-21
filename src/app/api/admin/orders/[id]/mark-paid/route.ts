import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await context.params;
        const body = await request.json();

        // 1. Validate Admin (TODO: Middleware check)
        const updatedBy = "admin"; // Placeholder

        // 2. Update Order
        await adminDb.runTransaction(async (t) => {
            const orderRef = adminDb.collection("orders").doc(orderId);
            const orderDoc = await t.get(orderRef);

            if (!orderDoc.exists) {
                throw new Error("Order not found");
            }

            const currentOrder = orderDoc.data() as Order;

            if (currentOrder.status === 'PAID' || currentOrder.status === 'CONFIRMED') {
                return; // Already paid
            }

            t.update(orderRef, {
                status: 'PAID',
                paymentStatus: 'PAID',
                paymentMethod: body.method || 'PIX',
                updatedAt: new Date().toISOString(),
                // Audit Trail
                history: FieldValue.arrayUnion({
                    action: 'MARK_PAID',
                    timestamp: new Date().toISOString(),
                    user: updatedBy,
                    details: `Marked as paid via Admin UI`
                })
            } as any);
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Mark Paid Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
