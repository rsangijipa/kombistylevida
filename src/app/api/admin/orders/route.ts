import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types/firestore";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const slotId = searchParams.get('slotId');

        let query = adminDb.collection("orders") as FirebaseFirestore.Query;

        if (date) {
            // Filter by Scheduled Date
            query = query.where("schedule.date", "==", date);
            if (slotId) {
                query = query.where("schedule.slotId", "==", slotId);
            }
        } else {
            // Default: specific sort only if not filtering by custom fields that might need index
            // If filtering by schedule.date, we might need composite index if we also sort by createdAt.
            // For now, let's keep it simple.
            query = query.orderBy("createdAt", "desc").limit(50);
        }

        const snap = await query.get();

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
