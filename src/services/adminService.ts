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
    // Ideally filter "currentStock < 10" but firestore doesn't do "currentStock < X" easily across all.
    // We fetch all inventory (small catalog) and filter.
    const invSnap = await getDocs(qInventory);
    let lowStockCount = 0;
    invSnap.forEach(doc => {
        const data = doc.data() as InventoryItem;
        if (data.currentStock < 10) lowStockCount++;
    });

    return {
        ordersToday,
        revenueToday,
        pendingDelivery,
        lowStockCount,
        packsSold,
        returnsPending,
    };
}
