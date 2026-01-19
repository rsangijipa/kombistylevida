export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        // 1. Orders Today 
        const todaySnap = await adminDb.collection('orders')
            .where('createdAt', '>=', startOfDay)
            .get();

        let ordersToday = 0;
        let revenueToday = 0;
        let packsSold = 0;

        todaySnap.forEach(doc => {
            const data = doc.data();
            ordersToday++;

            // New Secure Pricing or Fallback
            if (data.pricing?.totalCents) {
                revenueToday += data.pricing.totalCents;
            } else {
                revenueToday += (data.totalCents || 0);
            }

            // Packs logic (Check items)
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item: any) => {
                    // Check if item is a pack by ID or explicit flag
                    // In new "Items" list, we might just have products.
                    // But if we want to track "Packs", we need to see how they are saved.
                    // If we flattened packs into items, we might lose "Pack count" unless we tag them.
                    // However, for MVP, let's count items that are "pack-*" or if the order implies a pack (business logic).
                    // Or, if we kept "subItems" in some legacy orders, handle that.

                    // Legacy structure support
                    if (item.productId && item.productId.startsWith("pack-")) {
                        packsSold += (item.qty || 1);
                    }
                });
            }
        });

        // 2. Pending Delivery
        // Active statuses: 'NEW', 'CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY'
        const activeStatuses = ['NEW', 'CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY'];
        const pendingSnap = await adminDb.collection('orders')
            .where('status', 'in', activeStatuses)
            .get();

        const pendingDelivery = pendingSnap.size;
        let returnsPending = 0;

        pendingSnap.forEach(doc => {
            const data = doc.data();
            if (data.bottlesToReturn) {
                returnsPending += data.bottlesToReturn;
            }
        });

        // 3. Low Stock
        // Try Inventory collection first
        const invSnap = await adminDb.collection('inventory').get();
        let lowStockCount = 0;

        if (!invSnap.empty) {
            invSnap.forEach(doc => {
                const data = doc.data();
                if ((data.currentStock || 0) < 10) lowStockCount++;
            });
        } else {
            // Fallback: Check Catalog (if we track stock there, currently we don't, so just 0)
            // Or maybe we say 0 to avoid false alarms.
            lowStockCount = 0;
        }

        // 4. Sales History
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const historySnap = await adminDb.collection('orders')
            .where('createdAt', '>=', sevenDaysAgo.toISOString())
            .get();

        const salesMap: Record<string, number> = {};
        const flavorMap: Record<string, number> = {};

        historySnap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'CANCELED') return;

            const day = data.createdAt.split("T")[0];
            const val = data.pricing?.totalCents ?? data.totalCents ?? 0;
            salesMap[day] = (salesMap[day] || 0) + val;

            if (data.items) {
                data.items.forEach((item: any) => {
                    // New Flattened Structure usually has productName
                    if (item.productName) {
                        flavorMap[item.productName] = (flavorMap[item.productName] || 0) + (item.quantity || item.qty || 1);
                    } else if (item.subItems) { // Legacy
                        item.subItems.forEach((sub: any) => {
                            const name = sub.name || "Sabor (Pack)";
                            flavorMap[name] = (flavorMap[name] || 0) + sub.qty;
                        });
                    }
                });
            }
        });

        // Format History
        const salesHistory = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const strDate = `${yyyy}-${mm}-${dd}`;

            salesHistory.push({
                date: `${dd}/${mm}`,
                value: (salesMap[strDate] || 0) / 100
            });
        }

        // Format Top Flavors
        const topFlavors = Object.entries(flavorMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, qty]) => ({ name, qty }));

        return NextResponse.json({
            ordersToday,
            revenueToday,
            pendingDelivery,
            lowStockCount,
            packsSold,
            returnsPending,
            salesHistory,
            topFlavors
        });

    } catch (error) {
        console.error("Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
