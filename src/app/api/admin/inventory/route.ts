
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const snap = await adminDb.collection('inventory').get();
        const inventory: Record<string, any> = {};
        snap.forEach(doc => {
            inventory[doc.id] = doc.data();
        });
        return NextResponse.json(inventory);
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, amount, reason, type, adminUid } = body;

        if (!productId || !amount || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const ref = adminDb.collection('inventory').doc(productId);
        const delta = type === 'IN' ? amount : -amount;

        await ref.update({
            currentStock: FieldValue.increment(delta),
            updatedAt: new Date().toISOString()
        });

        // Optional: Log movement/production history
        // await adminDb.collection('stock_logs').add({ ... })

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Inventory Adjust Error", error);
        return NextResponse.json({ error: "Failed to adjust" }, { status: 500 });
    }
}
