
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start'); // YYYY-MM-DD
        const end = searchParams.get('end');     // YYYY-MM-DD

        if (!start || !end) {
            return NextResponse.json({ error: "Missing start/end date" }, { status: 400 });
        }

        // Fetch capacity docs in range
        const snapshot = await adminDb.collection('deliveryDays')
            .where('date', '>=', start)
            .where('date', '<=', end)
            .get();

        const data = snapshot.docs.map(doc => doc.data());
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching slots:", error);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { date, mode, slotId, action, value } = body;
        // action: 'UPDATE_CAPACITY' | 'TOGGLE_SLOT' | 'TOGGLE_DAY'

        if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 });

        const docRef = adminDb.collection('deliveryDays').doc(date);

        if (action === 'TOGGLE_DAY') {
            await docRef.set({
                date,
                // If value is TRUE (closing), we set closed: true
                closed: value,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } else if (action === 'UPDATE_DAILY_CAPACITY') {
            await docRef.set({
                date,
                dailyCapacityOverride: value, // e.g. 15
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }

        // Add Slot Logic if needed (Phase 2 Detail)
        // For now, we mainly control Day Open/Close + Capacity

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating slot:", error);
        return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
    }
}
