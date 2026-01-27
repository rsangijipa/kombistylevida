export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { adminGuard } from '@/lib/auth/adminGuard';


export async function GET(request: Request) {
    try {
        await adminGuard();

        const snapshot = await adminDb.collection('products').get();
        const products = snapshot.docs.map(doc => doc.data());

        return NextResponse.json(products);
    } catch (error) {
        if (error instanceof Error && (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'UNAUTHORIZED' ? 401 : 403 }
            );
        }
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await adminGuard();

        const body = await request.json();
        const { id, priceCents, active, variants } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await adminDb.collection('products').doc(id).set({
            priceCents,
            active,
            variants, // Save variants if edited
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'UNAUTHORIZED' ? 401 : 403 }
            );
        }
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
