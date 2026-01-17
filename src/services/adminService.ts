import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { Order, InventoryItem } from "@/types/firestore";

export interface DashboardStats {
    ordersToday: number;
    revenueToday: number;
    pendingDelivery: number;
    lowStockCount: number;
    packsSold: number;
    returnsPending: number;
    salesHistory: { date: string; value: number }[];
    topFlavors: { name: string; qty: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // 1. Fetch Orders (Recent 100 or so for MVP stats - scalable solution would use aggregation queries)
    // For now we just get all non-archived orders or last X days.
    // Let's just get "orders created > startOfDay" for Today's stats
    // And "orders status != DELIVERED" for pending.

    // Actually, simple query: Get all orders from last 7 days to process stats, avoiding 
    // reading entire DB.
    // Wait, "Pending Delivery" could be from 2 weeks ago. 
    // Let's query all 'active' orders for Pending.

    const activeStatuses = ['NEW', 'CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY'];
    const qPending = query(collection(db, "orders"), where("status", "in", activeStatuses));
    const pendingSnap = await getDocs(qPending);

    // For Today's stats, we filter the pending list OR query again.
    // Ideally we query "createdAt >= startOfDay".
    // Firestore might need index for inequality. Let's try to filter client side from a larger fetch if needed.
    // But direct query is cleaner.
    const qToday = query(collection(db, "orders"), where("createdAt", ">=", startOfDay));
    const todaySnap = await getDocs(qToday);

    // Merge uniqueness if overlaps (unlikely to be huge issue for stats)
    // Let's process Today
    let ordersToday = 0;
    let revenueToday = 0;
    let packsSold = 0;

    todaySnap.forEach(doc => {
        const data = doc.data() as Order;
        ordersToday++;
        revenueToday += data.totalCents;
    });

    // Process Pending (Packs and Returns are usually relevant on Pending orders, or All Time?)
    // Returns Pending -> Only active orders matter.
    // Packs Sold -> Total sold ever? Or Today? KPI usually implies "Total Packs Sold (Period)" or "Recent".
    // Let's track "Total Packs Sold" based on the "Today" snapshot for "velocity", 
    // OR we can just count from the pending orders for "Active Packs".
    // The prompt asked for "Packs mais montados" as a KPI. That implies historical.
    // Global historical stats requires big reads. 
    // Let's stick to "Active/Recent" context or "Today's Packs". 
    // Let's do "Packs Sold (Today)" to match the other daily metric.

    todaySnap.forEach(doc => {
        const data = doc.data() as Order;
        // Count packs
        data.items.forEach(item => {
            // We don't have isPack on OrderItem snapshot yet?
            // We mapped it. Let's check createOrder. 
            // We mapped productId. If productId starts with "pack-", it's a pack.
            if (item.productId.startsWith("pack-")) {
                packsSold += item.qty;
            }
        });
    });

    let pendingDelivery = pendingSnap.size;
    let returnsPending = 0;

    pendingSnap.forEach(doc => {
        const data = doc.data() as Order;
        if (data.bottlesToReturn) {
            returnsPending += data.bottlesToReturn;
        }
    });

    // 2. Low Stock
    const qInventory = query(collection(db, "inventory"));
    const invSnap = await getDocs(qInventory);
    let lowStockCount = 0;
    invSnap.forEach(doc => {
        const data = doc.data() as InventoryItem;
        if (data.currentStock < 10) lowStockCount++;
    });

    // 3. Historical Data for Charts (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const qHistory = query(collection(db, "orders"), where("createdAt", ">=", thirtyDaysAgo.toISOString()));
    const historySnap = await getDocs(qHistory);

    const salesRef: Record<string, number> = {}; // YYYY-MM-DD -> totalCents
    const flavorsRef: Record<string, number> = {}; // ProductName -> Qty

    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        salesRef[d.toLocaleDateString('pt-BR')] = 0;
    }

    historySnap.forEach(doc => {
        const data = doc.data() as Order;
        // Sales History
        if (data.status !== 'CANCELED') {
            const dateStr = new Date(data.createdAt).toLocaleDateString('pt-BR');
            // If key exists (within 30 days range), add. (Logic handles partial overlap if needed)
            // Using locale string might be tricky with timezone if server/client differs. 
            // Best to use simple ISO YYYY-MM-DD split.
            const isoDate = data.createdAt.split('T')[0];
            // Let's stick to a reliable mapping.
            // Re-map:
        }
    });

    // Better Approach: Iterate snapshot and allow dynamic keys. Sort later.
    const salesMap: Record<string, number> = {};
    const flavorMap: Record<string, number> = {};

    historySnap.forEach(doc => {
        const data = doc.data() as Order;
        if (data.status === 'CANCELED') return;

        // Sales
        const day = data.createdAt.split("T")[0]; // YYYY-MM-DD
        salesMap[day] = (salesMap[day] || 0) + data.totalCents;

        // Flavors
        data.items.forEach(item => {
            // Unpack packs if possible or count pack as item? prompt asked for flavors.
            // "Sabores mais vendidos". Packs obscure this.
            // Ideally we iterate subItems if they exist (added in P1).
            if (item.subItems && item.subItems.length > 0) {
                item.subItems.forEach(sub => {
                    const name = sub.name || "Sabor (Pack)";
                    flavorMap[name] = (flavorMap[name] || 0) + sub.qty;
                });
            } else if (!item.productId.startsWith('pack-')) {
                // Direct product
                flavorMap[item.productName] = (flavorMap[item.productName] || 0) + item.qty;
            }
        });
    });

    // Format Sales Array (Last 7 reasonable for small chart, or 30?)
    // Prompt said "Last 7 / 30". Let's do 7 for visual clarity in MVP.
    const salesHistory: { date: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        salesHistory.push({
            date: `${dd}/${mm}`,
            value: (salesMap[key] || 0) / 100
        });
    }

    // Format Top Flavors (Top 5)
    // Avoid pack generic names if possible.
    const topFlavors = Object.entries(flavorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));

    return {
        ordersToday,
        revenueToday,
        pendingDelivery,
        lowStockCount,
        packsSold,
        returnsPending,
        salesHistory,
        topFlavors
    };
}

export async function getDailyRoutes(dateStr: string): Promise<Order[]> {
    const q = query(
        collection(db, "orders"),
        where("schedule.date", "==", dateStr),
        orderBy("createdAt", "asc")
    );

    const snap = await getDocs(q);
    const orders: Order[] = [];

    snap.forEach(doc => {
        const data = doc.data() as Order;
        if (data.status !== 'CANCELED') {
            orders.push(data);
        }
    });

    return orders;
}
