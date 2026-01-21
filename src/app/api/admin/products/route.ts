export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { PRODUCTS as SEED_CATALOG } from '@/data/catalog';

export async function GET(request: Request) {
    try {
        const snapshot = await adminDb.collection('products').get();
        let products = snapshot.docs.map(doc => doc.data());

        // Auto-seed if empty?
        if (products.length === 0) {
            const batch = adminDb.batch();
            products = SEED_CATALOG.map(p => {
                const docRef = adminDb.collection('products').doc(p.id);
                // Ensure strict types
                const prod = {
                    ...p,
                    active: true,
                    updatedAt: new Date().toISOString()
                };
                batch.set(docRef, prod);
                return prod;
            });
            await batch.commit();
        }

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
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
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

