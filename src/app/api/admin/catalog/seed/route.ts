export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { PRODUCTS } from '@/data/catalog';
import { adminGuard } from '@/lib/auth/adminGuard';

export async function POST(request: Request) {
    try {
        await adminGuard();

        const batch = adminDb.batch();

        PRODUCTS.forEach(product => {
            const ref = adminDb.collection('products').doc(product.id);
            // We merge to avoid overwriting existing real-time data like stock if it exists? 
            // Actually, for a seed, we might want to ensure properties like Name/Image/Price are updated to match code.
            // But we should respect stockQty if it's stored on the document product. 
            // In our inventory route seen earlier, stock is in 'variants' or on the product.
            // The static catalog has 'variants' array.

            // Let's do a smart update: Update metadata, preserve stock if possible, or just set with merge: true which keeps other fields.
            // PRODUCTS definition in catalog.ts has: id, name, shortDesc, imageSrc, priceCents, size, variants.

            // We'll trust the static catalog for pricing and metadata.
            const productData = {
                ...product,
                active: true, // Auto-activate new flavors
                updatedAt: new Date().toISOString()
            };

            batch.set(ref, productData, { merge: true });
        });

        await batch.commit();

        return NextResponse.json({ success: true, count: PRODUCTS.length });
    } catch (error: unknown) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: "Failed to seed catalog" }, { status: 500 });
    }
}
