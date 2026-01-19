const https = require('http');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Usage: node verify-ttl.js

// We need Admin SDK here to forcefully expire a reservation for testing purposes
// Load env vars from .env.local manually for this script or assume run in env where they exist.
// Since we can't easily load .env.local in a simple node script without dotenv, 
// let's rely on the API for everything EXCEPT the "Force Expire" step which needs Admin privileges.
// Wait, we can't fully test "Force Expire" without Admin SDK access in this script.
// OR we can just wait 15 mins? No.
// OR we can use the `adminDb` we just setup in the app? No, this script is external.

// SIMPLIFIED APPROACH:
// 1. Reserve a slot via API.
// 2. We can't change expiresAt via API (it's hardcoded 15m).
// 3. We can't mock functionality easily.
// 
// ALTERNATIVE:
// We rely on the unit test logic correctness.
// BUT, if we want to really verify end-to-end:
// We need to inject a test-only route or use Admin SDK locally.
// Let's assume the user has the credentials in .env.local and we can use `dotenv`.
// Or better: valid verification is "Create reservation, check it exists. Wait... too long."

// Let's try to load credentials from the JSON file we know exists!
// `elosusgrupos-firebase-adminsdk-fbsvc-6d44d2e0e2.json`
const serviceAccount = require('./elosusgrupos-firebase-adminsdk-fbsvc-6d44d2e0e2.json');

const app = getApps().length === 0 ? initializeApp({
    credential: cert(serviceAccount)
}) : getApps()[0];

const db = getFirestore(app);
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function testTTL() {
    console.log("🧪 Starting TTL/Cleanup Verification...");

    // 1. Init Session
    console.log("\n1️⃣  Initializing Session...");
    const initRes = await fetch(`${BASE_URL}/cart/init`, { method: 'POST' });
    const initData = await initRes.json();
    const cookie = initRes.headers.get('set-cookie');
    const headers = { 'Cookie': cookie, 'Content-Type': 'application/json' };
    console.log("   ✅ Order ID:", initData.orderId);

    // 2. Reserve a Slot
    console.log("\n2️⃣  Reserving Slot (Tomorrow Morning)...");
    // Get date
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    const dateStr = tom.toISOString().split('T')[0];

    const resRes = await fetch(`${BASE_URL}/delivery/reserve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ date: dateStr, window: 'MORNING' })
    });

    if (!resRes.ok) {
        // If 409, slot might be full due to prev tests. Try release first?
        const err = await resRes.json();
        console.warn("   ⚠️ Reserve failed (maybe full?):", err);
        return;
    }
    console.log("   ✅ Reserved.");

    // 3. Verify it is HELD
    const slotId = `DEFAULT_${dateStr}_MORNING`;
    const slotDocBefore = await db.collection("deliverySlots").doc(slotId).get();
    const reservedBefore = slotDocBefore.data()?.reserved || 0;
    console.log(`   INFO: Slot reserved count: ${reservedBefore}`);

    // 4. FORCE EXPIRE (Cheating with Admin SDK)
    console.log("\n3️⃣  Forcefully Expiring Reservation (Backdating expiresAt)...");
    await db.collection("orders").doc(initData.orderId).update({
        "deliveryReservation.expiresAt": new Date(Date.now() - 1000).toISOString() // 1 sec ago
    });
    console.log("   ✅ Reservation marked as expired in DB.");

    // 5. Trigger Lazy Cleanup (GET /slots)
    console.log("\n4️⃣  Triggering Cleanup (GET /slots)...");
    const cleaningRes = await fetch(`${BASE_URL}/delivery/slots`, { headers });
    await cleaningRes.json();
    // Wait a brief moment for async batch commit? (GET /slots awaits commit, so we are good)
    console.log("   ✅ Triggered.");

    // 6. Verify Release
    console.log("\n5️⃣  Verifying Release...");
    const orderDoc = await db.collection("orders").doc(initData.orderId).get();
    const slotDocAfter = await db.collection("deliverySlots").doc(slotId).get();

    const reservedAfter = slotDocAfter.data()?.reserved || 0;
    const status = orderDoc.data()?.deliveryReservation?.status;

    console.log(`   Expected Status: EXPIRED | Actual: ${status}`);
    console.log(`   Expected Reserved: ${reservedBefore - 1} | Actual: ${reservedAfter}`);

    if (status === 'EXPIRED' && reservedAfter === reservedBefore - 1) {
        console.log("\n🎉 TTL Verification SUCCESS! Cleanup works.");
    } else {
        console.error("\n❌ TTL Verification FAILED.");
        if (status !== 'EXPIRED') console.error("   - Order status not updated to EXPIRED.");
        if (reservedAfter !== reservedBefore - 1) console.error("   - Slot count not decremented.");
    }
}

testTTL().catch(console.error);
