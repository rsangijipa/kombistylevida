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
        const cursor = searchParams.get('cursor');
        const paginated = searchParams.get('paginated') === '1';
        const limitParam = Number(searchParams.get('limit') || '50');
        const limitCount = Number.isFinite(limitParam) ? Math.min(200, Math.max(1, limitParam)) : 50;

        let query = adminDb.collection("orders") as FirebaseFirestore.Query;
        const canUseCursor = !date && !customerPhone;

        if (date) {
            // Filter by Scheduled Date
            query = query.where("schedule.date", "==", date);
            if (slotId) {
                query = query.where("schedule.slotId", "==", slotId);
            }
        } else if (customerPhone) {
            query = query.where("customer.phone", "==", customerPhone).limit(limitCount);
        } else {
            query = query.orderBy("createdAt", "desc").limit(paginated ? limitCount + 1 : limitCount);
            if (paginated && cursor) {
                query = query.startAfter(cursor);
            }
        }

        if (status && !paginated) {
            query = query.where("status", "==", status);
        }

        const snap = await query.get();

        let orders = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Order[];

        if (status && paginated) {
            orders = orders.filter((order) => order.status === status);
        }

        if (paginated && canUseCursor) {
            const hasMore = orders.length > limitCount;
            const pageItems = hasMore ? orders.slice(0, limitCount) : orders;
            const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.createdAt : null;
            return NextResponse.json({
                items: pageItems,
                hasMore,
                nextCursor,
            });
        }

        return NextResponse.json(orders);
    } catch (error: unknown) {
        console.error("API Admin Orders Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        if (message === 'FORBIDDEN') return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
