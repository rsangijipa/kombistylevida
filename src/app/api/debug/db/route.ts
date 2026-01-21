export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
    try {
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
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
