
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date'); // YYYY-MM-DD
        const slotId = searchParams.get('slotId'); // optional filter

        if (!date) {
            return NextResponse.json({ error: "Missing date" }, { status: 400 });
        }

        // Query orders 
        // delivery.date == date
        const query = adminDb.collection('orders')
            .where('delivery.date', '==', date)
            .where('status', '!=', 'CANCELED'); // Filter canceled? Maybe show them? sticking to active for now.

        const snapshot = await query.get();
        const orders = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                shortId: d.shortId,
                customerName: d.customer?.name || "Cliente",
                status: d.status,
                slotLabel: d.schedule?.slotLabel,
                delivery: d.delivery,
                totalCents: d.totalCents
            };
        });

        // Filter by slotId in memory if needed (or add index)
        // Since we don't have slotId strictly on root 'delivery' object sometimes, memory filter is safer for MVP.
        /* 
           If slotId is passed, we might want to filter.
           However, sticking to returning all orders for the day is likely more useful for the UI 
           so the client can distribute them or show unassigned ones.
        */

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching delivery orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
