
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        // 1. Orders Today 
        // Note: Admin SDK doesn't support complex inequalities without index sometimes, but "createdAt >=" is standard.
        // However, robust stats might require better aggregation. 
        // For MVP, we can fetch today's orders.

        const todaySnap = await adminDb.collection('orders')
            .where('createdAt', '>=', startOfDay)
            .get();

        let ordersToday = 0;
        let revenueToday = 0;
        let packsSold = 0;

        todaySnap.forEach(doc => {
            const data = doc.data();
            ordersToday++;
            revenueToday += (data.totalCents || 0);

            // Packs logic (Check items)
            if (data.items) {
                data.items.forEach((item: any) => {
                    if (item.productId && item.productId.startsWith("pack-")) {
                        packsSold += item.qty;
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
        const invSnap = await adminDb.collection('inventory').get();
        let lowStockCount = 0;
        invSnap.forEach(doc => {
            const data = doc.data();
            if ((data.currentStock || 0) < 10) lowStockCount++;
        });

        // 4. Sales History (Client can handle formatting or we do it here)
        // Let's fetch last 7 days orders for chart
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
            salesMap[day] = (salesMap[day] || 0) + (data.totalCents || 0);

            if (data.items) {
                data.items.forEach((item: any) => {
                    // Flavors logic
                    if (item.subItems && item.subItems.length > 0) {
                        item.subItems.forEach((sub: any) => {
                            const name = sub.name || "Sabor (Pack)";
                            flavorMap[name] = (flavorMap[name] || 0) + sub.qty;
                        });
                    } else if (item.productId && !item.productId.startsWith('pack-')) {
                        flavorMap[item.productName] = (flavorMap[item.productName] || 0) + item.qty;
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
