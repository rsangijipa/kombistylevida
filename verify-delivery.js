/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('http');

// Simple verification script to run in Node
// Usage: node verify-delivery.js

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function testFlow() {
    console.log("🧪 Starting Delivery System Verification...");

    // 1. Init Cart (Get Cookie)
    console.log("\n1️⃣  Testing /cart/init...");
    const initRes = await fetch(`${BASE_URL}/cart/init`, { method: 'POST' });
    if (!initRes.ok) {
        const text = await initRes.text();
        try {
            const json = JSON.parse(text);
            console.error("❌ Init Error Details:", json.details || text);
            console.error("❌ Stack:", json.stack || "No stack");
        } catch (e) {
            console.error("❌ Init Error (Raw):", text.substring(0, 100) + "...");
            const fs = require('fs');
            fs.writeFileSync('init_error.html', text);
            console.log("   --> Saved raw error to init_error.html");
        }
        throw new Error(`Init failed: ${initRes.status}`);
    }

    const initData = await initRes.json();
    console.log("   ✅ Order ID:", initData.orderId);

    // Extract Cookie
    const cookie = initRes.headers.get('set-cookie');
    if (!cookie) throw new Error("No cookie received");
    console.log("   ✅ Cookie received");

    const headers = { 'Cookie': cookie, 'Content-Type': 'application/json' };

    // 2. Get Slots
    console.log("\n2️⃣  Testing /delivery/slots...");
    const slotsRes = await fetch(`${BASE_URL}/delivery/slots`, { headers });
    const slotsData = await slotsRes.json();
    if (!slotsData.slots) {
        console.error("❌ Slots Endpoint returned invalid data:", slotsData);
        throw new Error("Slots data missing");
    }
    console.log(`   ✅ Loaded ${slotsData.slots.length} slots`);
    const targetSlot = slotsData.slots.find(s => s.window === 'MORNING');
    if (!targetSlot) throw new Error("No MORNING slot found");

    console.log(`   🎯 Target Slot: ${targetSlot.date} ${targetSlot.window} (Reserved: ${targetSlot.reserved})`);

    // 3. Reserve Slot
    console.log("\n3️⃣  Testing /delivery/reserve...");
    const reserveRes = await fetch(`${BASE_URL}/delivery/reserve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            date: targetSlot.date,
            window: targetSlot.window
        })
    });

    if (!reserveRes.ok) {
        const err = await reserveRes.json();
        throw new Error(`Reserve failed: ${err.error} - ${err.details || ''}`);
    }
    console.log("   ✅ Reservation successful");

    // 4. Verify Increment (Fetch Slots again)
    const slotsRes2 = await fetch(`${BASE_URL}/delivery/slots`, { headers });
    const slotsData2 = await slotsRes2.json();
    const updatedSlot = slotsData2.slots.find(s => s.id === targetSlot.id);
    console.log(`   ✅ Slot Updated: Reserved ${updatedSlot.reserved} (Prev: ${targetSlot.reserved})`);

    if (updatedSlot.reserved <= targetSlot.reserved) {
        console.warn("   ⚠️  Warning: Reservation count didn't increment!");
    }

    // 5. Checkout (Confirm Order)
    console.log("\n4️⃣  Testing /order/checkout...");
    const checkoutRes = await fetch(`${BASE_URL}/order/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            cart: [{ productId: 'kombucha-hibisco', qty: 2 }],
            customer: { name: 'Test User', phone: '123456789' },
            notes: 'Test Order'
        })
    });

    if (!checkoutRes.ok) {
        const err = await checkoutRes.json();
        throw new Error(`Checkout failed: ${err.error} - ${err.details}`);
    }
    console.log("   ✅ Checkout successful");

    console.log("\n🎉 Verification Complete! System is operational.");
}

testFlow().catch(e => {
    console.error("\n❌ Test Failed:", e.message);
});
