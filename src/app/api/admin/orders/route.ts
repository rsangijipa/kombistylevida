import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types/firestore";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const snap = await adminDb.collection("orders")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const orders = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Order[];

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error("API Admin Orders Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
