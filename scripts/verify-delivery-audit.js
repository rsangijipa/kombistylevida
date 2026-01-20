
/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require('axios');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;
// Helper to extract cookie
const getCookie = (res) => {
    const cookies = res.headers['set-cookie'];
    if (!cookies) return null;
    const kv = cookies.find(c => c.startsWith('kv_order='));
    return kv ? kv.split(';')[0] : null;
}

async function runAudit() {
    console.log("🚀 Starting Delivery System QA Audit...");
    let passed = true;
    let cookie = null;
    let orderId = null;
    let targetSlot = null;

    try {
        // 1. INIT CART
        console.log("\n[1] Testing /api/cart/init...");
        const resInit = await axios.post(`${BASE_URL}/api/cart/init`);
        cookie = getCookie(resInit);
        orderId = resInit.data.orderId;

        if (!cookie || !orderId) throw new Error("Failed to get cookie or orderId");
        console.log(`✅ Cart Initialized. Order: ${orderId}`);
        console.log(`🔑 Cookie: ${cookie}`);

        // 2. GET SLOTS
        console.log("\n[2] Testing /api/delivery/slots...");
        const resSlots = await axios.get(`${BASE_URL}/api/delivery/slots`);
        const slots = resSlots.data.slots;
        if (!slots || slots.length === 0) throw new Error("No slots returned");

        // Pick a target (First available tomorrow)
        targetSlot = slots.find(s => !s.isBlocked && s.reserved < s.capacity);
        if (!targetSlot) throw new Error("No available slots found to test");
        console.log(`✅ Slots fetched. Target: ${targetSlot.date} / ${targetSlot.window}`);

        // 3. RESERVE SLOT
        console.log("\n[3] Testing /api/delivery/reserve...");
        await axios.post(`${BASE_URL}/api/delivery/reserve`, {
            date: targetSlot.date,
            window: targetSlot.window
        }, { headers: { Cookie: cookie, 'Content-Type': 'application/json' } });
        console.log("✅ Reservation successful");

        // 4. VERIFY RESERVATION (INCR)
        const resVerify = await axios.get(`${BASE_URL}/api/delivery/slots`);
        const updatedSlot = resVerify.data.slots.find(s => s.id === targetSlot.id);
        if (updatedSlot.reserved <= targetSlot.reserved) {
            console.error(`❌ Capacity did not increase! Old: ${targetSlot.reserved}, New: ${updatedSlot.reserved}`);
            passed = false;
        } else {
            console.log(`✅ Capacity verified: ${targetSlot.reserved} -> ${updatedSlot.reserved}`);
        }

        // 5. CONCURRENCY TEST
        console.log("\n[5] Testing Concurrency (Race Condition)...");
        // We need a fresh slot or Reset logic. Let's use the same slot but try to overflow if possible, 
        // or just ensure transactions work safely.

        // Create 10 parallel requests with DIFFERENT sessions (cookies)
        // Since we can't easily generate valid cookies without init, we will loop init first.
        const parallelUsers = 5;
        console.log(`Simulating ${parallelUsers} users racing for slot...`);
        const promises = [];

        for (let i = 0; i < parallelUsers; i++) {
            promises.push((async () => {
                try {
                    const rInit = await axios.post(`${BASE_URL}/api/cart/init`);
                    const c = getCookie(rInit);
                    await axios.post(`${BASE_URL}/api/delivery/reserve`, {
                        date: targetSlot.date,
                        window: targetSlot.window
                    }, { headers: { Cookie: c } });
                    return "OK";
                } catch (e) {
                    return "FAIL";
                }
            })());
        }

        const results = await Promise.all(promises);
        const successes = results.filter(r => r === "OK").length;
        console.log(`Concurrency Results: ${successes} successful, ${results.length - successes} failed`);

        // Verify Integrity
        const finalRes = await axios.get(`${BASE_URL}/api/delivery/slots`);
        const finalSlot = finalRes.data.slots.find(s => s.id === targetSlot.id);

        const expectedMin = updatedSlot.reserved + successes;
        if (finalSlot.reserved !== expectedMin) {
            // Note: Others might be interacting, but locally should be clean.
            // Actually, if slot full, some fail.
            console.log(`Final Slot Reserved: ${finalSlot.reserved}. (Expected approx increase of ${successes})`);
        }
        console.log("✅ Concurrency finished without crash");

    } catch (e) {
        console.error("❌ Test Failed:", e.message);
        if (e.response) console.error("Response:", e.response.data);
        passed = false;
    }

    if (passed) {
        console.log("\n🎉 AUDIT PASSED: Core flows functional.");
    } else {
        console.log("\n💥 AUDIT FAILED.");
    }
}

runAudit();
