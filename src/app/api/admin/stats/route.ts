export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { OrderItem, Product } from '@/types/firestore';
import { adminGuard } from '@/lib/auth/adminGuard';

// Local type for handling legacy data
type LegacyOrderItem = OrderItem & {
    qty?: number;
    subItems?: { name?: string; quantity?: number; qty?: number }[];
};

export async function GET() {
    try {
        await adminGuard();

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

            // Packs logic (Check metadata first, then legacy items)
            if (data.metadata?.originalCart && Array.isArray(data.metadata.originalCart)) {
                data.metadata.originalCart.forEach((cartItem: { type: string; quantity: number }) => {
                    if (cartItem.type === 'PACK') {
                        packsSold += (cartItem.quantity || 1);
                    }
                });
            } else if (data.items && Array.isArray(data.items)) {
                // Fallback for legacy orders
                data.items.forEach((item: OrderItem) => {
                    const legacyItem = item as LegacyOrderItem;
                    if (item.productId && item.productId.startsWith("pack-")) {
                        packsSold += (item.quantity || legacyItem.qty || 1);
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

        // 3. Low Stock (Scanning Products)
        const catalogSnap = await adminDb.collection('products').where('active', '==', true).get();
        let lowStockCount = 0;

        catalogSnap.forEach(doc => {
            const data = doc.data() as Product;
            if (data.variants && Array.isArray(data.variants)) {
                data.variants.forEach((v) => {
                    if (v.active && (v.stockQty !== undefined && v.stockQty < 20)) {
                        lowStockCount++;
                    }
                });
            }
        });

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
                data.items.forEach((item: OrderItem) => {
                    const legacyItem = item as LegacyOrderItem;
                    // New Flattened Structure usually has productName
                    if (item.productName) {
                        flavorMap[item.productName] = (flavorMap[item.productName] || 0) + (item.quantity || legacyItem.qty || 1);
                    } else if (legacyItem.subItems) { // Legacy
                        legacyItem.subItems.forEach((sub) => {
                            const name = sub.name || "Sabor (Pack)";
                            flavorMap[name] = (flavorMap[name] || 0) + (sub.quantity || (sub as { qty?: number }).qty || 1);
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
            .map(([name, count]) => ({ name, quantity: count }));

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

    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        console.error("Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
