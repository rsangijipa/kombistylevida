export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { adminGuard } from "@/lib/auth/adminGuard";

export async function GET() {
    try {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await adminGuard();

        const products = await adminDb.collection("products").count().get();
        const orders = await adminDb.collection("orders").count().get();
        const slots = await adminDb.collection("deliverySlots").count().get();

        const lastOrdersSnap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(3).get();
        const lastOrders = lastOrdersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        return NextResponse.json({
            counts: {
                products: products.data().count,
                orders: orders.data().count,
                slots: slots.data().count
            },
            lastOrders
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
