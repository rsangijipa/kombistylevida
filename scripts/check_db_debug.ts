
import { adminDb } from "../src/lib/firebase/admin";

async function check() {
    console.log("Checking DB State...");
    try {
        const products = await adminDb.collection("products").count().get();
        console.log(`Products: ${products.data().count}`);

        const orders = await adminDb.collection("orders").count().get();
        console.log(`Orders: ${orders.data().count}`);

        const slots = await adminDb.collection("deliverySlots").count().get();
        console.log(`Slots: ${slots.data().count}`);

        // List last 3 orders
        const lastOrders = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(3).get();
        lastOrders.forEach(d => {
            console.log(`Order ${d.id}: Status=${d.data().status}, Total=${d.data().totalCents}`);
        });

    } catch (e) {
        console.error("DB Check Failed:", e);
    }
}

check();
