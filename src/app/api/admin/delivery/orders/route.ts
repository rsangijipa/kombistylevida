export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { adminGuard } from '@/lib/auth/adminGuard';

export async function GET(request: Request) {
    try {
        await adminGuard();
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
                customerPhone: d.customer?.phone,
                customerAddress: d.customer?.address,
                customerNumber: d.customer?.number,
                customerComplement: d.customer?.complement,
                customerNeighborhood: d.customer?.neighborhood,
                customerCity: d.customer?.city,
                status: d.status,
                slotLabel: d.schedule?.slotLabel, // or delivery.window
                delivery: d.delivery,
                totalCents: d.totalCents
            };
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching delivery orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
