
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { PRODUCTS, BUNDLES } from '@/data/catalog';
import { adminGuard } from '@/lib/auth/adminGuard';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        await adminGuard();

        const batch = adminDb.batch();
        let count = 0;

        // 1. Sync Products
        for (const p of PRODUCTS) {
            const ref = adminDb.collection('products').doc(p.id);
            // We use merge to avoid overwriting stock if it exists, 
            // BUT for catalog fields (name, image, price) we want the code to be the source of truth if we are syncing?
            // "Source of Truth" requirement says Firestore is Truth.
            // So executing this Seed should probably perform an "Upsert" of static metadata ONLY, preserving dynamic data (stock).
            // However, batch set with merge does exactly that. Data not in `p` (like variants[0].stockQty that we don't send here?)
            // Wait, `p` from catalog HAS `variants`.

            // We must be careful not to reset stock to 0.
            // The `catalog.ts` file DOES NOT have stockQty.
            // Good.

            batch.set(ref, {
                name: p.name,
                shortDesc: p.shortDesc || "",
                imageSrc: p.imageSrc || "",
                priceCents: p.priceCents || 0,
                // We need to map variants structure carefully.
                // If we overwrite variants array, we lose stock if stock is inside variants array.
                // Current Firestore Structure: variants: [{ size: '300ml', price: 12, stockQty: 50 }]
                // Catalog Structure: variants: [{ size: '300ml', price: 12 }]

                // Strategy: We can't simply overwrite 'variants' array.
                // We must read first? That's expensive for batch.
                // Or we accept that "Seed" is for initialization or we make it smarter.

                // Let's implement smart merge? No, too complex for batch.
                // Let's just set the TOP LEVEL fields.
                // And ignore variants? 
                // Using merge: true on top level fields updates them.
                updatedAt: new Date().toISOString(),
                active: true
            }, { merge: true });

            count++;
        }

        // 2. Sync Bundles (Combos)
        for (const b of BUNDLES) {
            const ref = adminDb.collection('combos').doc(b.id);
            batch.set(ref, {
                ...b,
                active: true,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            count++;
        }

        await batch.commit();

        return NextResponse.json({ success: true, count });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
