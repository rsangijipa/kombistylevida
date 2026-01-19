
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('customers')
            .orderBy('lastOrderAt', 'desc')
            .limit(50)
            .get();

        const customers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, phone, delta, reason, isSubscriber, adminUid } = body;

        if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

        const docRef = adminDb.collection('customers').doc(phone);

        if (action === 'ADJUST_CREDITS') {
            await docRef.update({
                ecoPoints: FieldValue.increment(delta),
                updatedAt: new Date().toISOString()
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'TOGGLE_SUBSCRIPTION') {
            await docRef.update({
                isSubscriber: isSubscriber,
                updatedAt: new Date().toISOString()
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}
