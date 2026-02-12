/* eslint-disable @typescript-eslint/no-require-imports */
const { cert, initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const CATALOG_COLLECTION = 'catalog';

const PRODUCTS = [
    {
        id: "ginger-lemon",
        name: "Gengibre & Limão",
        variants: {
            "300ml": { priceCents: 1200, volumeMl: 300, active: true, stockQty: 100 },
            "500ml": { priceCents: 1500, volumeMl: 500, active: true, stockQty: 100 }
        },
        active: true,
        tags: ["fresh", "citrus"]
    },
    {
        id: "red-berries",
        name: "Frutas Vermelhas",
        variants: {
            "300ml": { priceCents: 1200, volumeMl: 300, active: true, stockQty: 100 },
            "500ml": { priceCents: 1500, volumeMl: 500, active: true, stockQty: 100 }
        },
        active: true,
        tags: ["sweet", " berries"]
    },
    {
        id: "purple-grape",
        name: "Uva Roxa",
        variants: {
            "300ml": { priceCents: 1200, volumeMl: 300, active: true, stockQty: 100 },
            "500ml": { priceCents: 1500, volumeMl: 500, active: true, stockQty: 100 }
        },
        active: true,
        tags: ["intense", "grape"]
    },
    {
        id: "passionfruit",
        name: "Maracujá",
        variants: {
            "300ml": { priceCents: 1200, volumeMl: 300, active: true, stockQty: 100 },
            "500ml": { priceCents: 1500, volumeMl: 500, active: true, stockQty: 100 }
        },
        active: true,
        tags: ["tropical", "relaxed"]
    }
];

// --- Init Firebase ---
// Tries to find credentials automatically looking for json files in current dir
// This mimics the behavior of other scripts in the repo
function getCredentials() {
    const finalCreds = path.join(process.cwd(), 'planar-outlook-final-creds.json');
    if (fs.existsSync(finalCreds)) {
        console.log(`🔑 Using explicitly prepared credentials: planar-outlook-final-creds.json`);
        return require(finalCreds);
    }

    const files = fs.readdirSync(process.cwd());
    const credFile = files.find(f => f.endsWith('.json') && (f.includes('service') || f.includes('creds') || f.includes('admin')));

    if (!credFile) {
        console.error("❌ No service account JSON found in current directory.");
        process.exit(1);
    }

    console.log(`🔑 Using credentials: ${credFile}`);
    return require(path.join(process.cwd(), credFile));
}

async function seed() {
    if (getApps().length === 0) {
        initializeApp({
            credential: cert(getCredentials())
        });
    }

    const db = getFirestore();
    console.log(`🌱 Seeding collection: ${CATALOG_COLLECTION}...`);

    const batch = db.batch();

    for (const prod of PRODUCTS) {
        const ref = db.collection(CATALOG_COLLECTION).doc(prod.id);
        const { id, ...data } = prod;
        batch.set(ref, {
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`   + Queueing: ${prod.name} (${prod.id})`);
    }

    await batch.commit();
    console.log("✅ Catalog seeded successfully!");
}

seed().catch(err => {
    console.error("❌ Error seeding catalog:", err);
    process.exit(1);
});
