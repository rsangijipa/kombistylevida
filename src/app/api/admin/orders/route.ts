import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types/firestore";
import { adminGuard } from "@/lib/auth/adminGuard";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await adminGuard();
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const slotId = searchParams.get('slotId');
        const customerPhone = searchParams.get('customerPhone');
        const status = searchParams.get('status');
        const limitParam = Number(searchParams.get('limit') || '50');
        const limitCount = Number.isFinite(limitParam) ? Math.min(200, Math.max(1, limitParam)) : 50;

        let query = adminDb.collection("orders") as FirebaseFirestore.Query;

        if (date) {
            // Filter by Scheduled Date
            query = query.where("schedule.date", "==", date);
            if (slotId) {
                query = query.where("schedule.slotId", "==", slotId);
            }
        } else if (customerPhone) {
            query = query.where("customer.phone", "==", customerPhone).limit(limitCount);
        } else {
            // Default: specific sort only if not filtering by custom fields that might need index
            // If filtering by schedule.date, we might need composite index if we also sort by createdAt.
            // For now, let's keep it simple.
            query = query.orderBy("createdAt", "desc").limit(limitCount);
        }

        if (status) {
            query = query.where("status", "==", status);
        }

        const snap = await query.get();

        const orders = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Order[];

        return NextResponse.json(orders);
    } catch (error: unknown) {
        console.error("API Admin Orders Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        if (message === 'FORBIDDEN') return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
