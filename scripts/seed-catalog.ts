
import { adminDb } from '../src/lib/firebase/admin';
import { PRODUCTS, BUNDLES } from '../src/data/catalog';
import { Product, Combo, BottleSize } from '../src/types/firestore';

async function seed() {
    console.log("Starting catalog seed...");

    // Seed Products
    console.log(`Seeding ${PRODUCTS.length} products...`);
    const productsBatch = adminDb.batch();
    for (const p of PRODUCTS) {
        const ref = adminDb.collection('products').doc(p.id);

        // Explicitly map/cast to match stricter Firestore Types
        const variants = p.variants?.map(v => ({
            ...v,
            size: v.size as BottleSize
        }));

        const productData: Product = {
            ...p,
            priceCents: p.priceCents || 0,
            active: true,
            size: p.size as BottleSize | undefined, // Cast string to BottleSize
            variants: variants,
            updatedAt: new Date().toISOString()
        };
        productsBatch.set(ref, productData, { merge: true });
    }
    await productsBatch.commit();
    console.log("Products seeded.");

    // Seed Bundles/Combos
    console.log(`Seeding ${BUNDLES.length} combos...`);
    const combosBatch = adminDb.batch();
    for (const b of BUNDLES) {
        const ref = adminDb.collection('combos').doc(b.id);
        const comboData: Combo = {
            id: b.id,
            name: b.name,
            description: b.description,
            badge: b.badge,
            items: b.items,
            priceCents: b.priceCents || 0,
            active: true,
            updatedAt: new Date().toISOString()
        };
        combosBatch.set(ref, comboData, { merge: true });
    }
    await combosBatch.commit();
    console.log("Combos seeded.");

    console.log("Done.");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
