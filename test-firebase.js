const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

async function test() {
    console.log("----------------------------------------");
    console.log("🧪 Standalone Firebase Admin Test");

    try {
        const serviceAccountPath = process.cwd() + '/planar-outlook-480318-c3-8e839ac6e102.json';
        console.log("Path:", serviceAccountPath);

        const content = fs.readFileSync(serviceAccountPath, 'utf8');
        console.log("File read success. Length:", content.length);

        const serviceAccount = JSON.parse(content);
        console.log("JSON Parse success.");
        console.log("Project:", serviceAccount.project_id);
        console.log("Private Key Len:", serviceAccount.private_key?.length);

        console.log("Initializing App...");
        const app = initializeApp({
            credential: cert(serviceAccount)
        });
        console.log("App Initialized.");

        console.log("Testing Firestore Connection...");
        const db = getFirestore(app);
        const failTimeout = setTimeout(() => {
            console.error("❌ Connection Timeout (5s)");
            process.exit(1);
        }, 5000);

        try {
            const collections = await db.listCollections();
            console.log("✅ Connection Successful! Collections:", collections.map(c => c.id));
        } catch (e) {
            console.error("❌ Firestore Error:", e.message);
        } finally {
            clearTimeout(failTimeout);
        }

    } catch (e) {
        console.error("❌ Fatal Error:", e);
    }
}

test();
