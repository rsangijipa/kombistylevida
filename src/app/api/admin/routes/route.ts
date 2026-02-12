export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { adminGuard } from '@/lib/auth/adminGuard';

export async function GET(request: Request) {
    try {
        await adminGuard();

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: "Date required" }, { status: 400 });
        }

        const snapshot = await adminDb.collection('orders')
            .where('schedule.date', '==', date)
            .orderBy('createdAt', 'asc')
            .get();

        const orders: Array<{ id: string; status?: string } & Record<string, unknown>> = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Record<string, unknown>)
        }));

        // Filter canceled? Client side or here? Current service filters canceled.
        const activeOrders = orders.filter((o) => o.status !== 'CANCELED');

        return NextResponse.json(activeOrders);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        console.error("Routes API Error:", error);
        return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
    }
}
