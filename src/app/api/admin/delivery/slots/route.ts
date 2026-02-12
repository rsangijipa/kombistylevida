export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { adminGuard } from '@/lib/auth/adminGuard';

export async function GET(request: Request) {
    try {
        await adminGuard();
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start'); // YYYY-MM-DD
        const end = searchParams.get('end');     // YYYY-MM-DD
        const mode = (searchParams.get('mode') || 'DELIVERY').toUpperCase();

        if (mode !== 'DELIVERY' && mode !== 'PICKUP') {
            return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
        }

        if (!start || !end) {
            return NextResponse.json({ error: "Missing start/end date" }, { status: 400 });
        }

        // Fetch capacity docs in range
        const snapshot = await adminDb.collection('deliveryDays')
            .where('date', '>=', start)
            .where('date', '<=', end)
            .where('mode', '==', mode)
            .get();

        const data = snapshot.docs.map(doc => doc.data());
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        }
        console.error("Error fetching slots:", error);
        const message = error instanceof Error ? error.message : 'Failed to fetch slots';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await adminGuard();
        const body = await request.json();
        const { date, mode, action, value } = body;
        // action: 'UPDATE_CAPACITY' | 'TOGGLE_SLOT' | 'TOGGLE_DAY'

        if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 });

        const normalizedMode = String(mode || 'DELIVERY').toUpperCase();
        if (normalizedMode !== 'DELIVERY' && normalizedMode !== 'PICKUP') {
            return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
        }
        const docId = `${date}_${normalizedMode}`;
        const docRef = adminDb.collection('deliveryDays').doc(docId);

        if (action === 'TOGGLE_DAY') {
            await docRef.set({
                date,
                mode: normalizedMode,
                // If value is TRUE (closing), we set closed: true
                closed: value,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } else if (action === 'UPDATE_DAILY_CAPACITY') {
            await docRef.set({
                date,
                mode: normalizedMode,
                dailyCapacityOverride: value, // e.g. 15
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }

        // Add Slot Logic if needed (Phase 2 Detail)
        // For now, we mainly control Day Open/Close + Capacity

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        }
        console.error("Error updating slot:", error);
        const message = error instanceof Error ? error.message : 'Failed to update slot';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

