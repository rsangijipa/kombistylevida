import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { adminGuard } from "@/lib/auth/adminGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await context.params;
        const body = await request.json();

        // 1. Validate Admin
        const user = await adminGuard();
        const updatedBy = user.email || "admin";

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
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Mark Paid Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
