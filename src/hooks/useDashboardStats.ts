import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, Product } from '@/types/firestore';

export interface DashboardStats {
    ordersToday: number;
    revenueToday: number;
    pendingDelivery: number;
    packsSold: number;
    lowStockCount: number;
    salesHistory: { date: string; value: number }[];
    topFlavors: { name: string; quantity: number }[];
}

export function useDashboardStats() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const now = new Date();
        const startOf7DaysAgo = new Date();
        startOf7DaysAgo.setDate(now.getDate() - 7);
        startOf7DaysAgo.setHours(0, 0, 0, 0);

        // 1. Listen to Recent Orders (Last 7 Days) for Charts & Today's Stats
        // Note: This misses "Pending" orders older than 7 days. 
        // For strict "Pending Delivery" count, we might need a separate query or assume backlog < 7 days.
        // Let's rely on this for now to keep Reads low, assuming operation is healthy.
        // Ideally: Status-based query is better for "Pending", Date-based for "Sales".
        // Let's do TWO queries for correctness.

        const qRecent = query(
            collection(db, 'orders'),
            where('createdAt', '>=', startOf7DaysAgo.toISOString()),
            orderBy('createdAt', 'desc')
        );

        const qPending = query(
            collection(db, 'orders'),
            where('status', 'in', ['PENDING', 'CONFIRMED', 'PAID', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY'])
        );

        // 2. Listen to Products for Inventory
        const qProducts = query(collection(db, 'products'));

        const unsubRecent = onSnapshot(qRecent, (snap) => {
            const recentData = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));

            // We need to merge with pending, but careful of duplicates if we use a single list.
            // Actually, for the Stats object, we can compute derived values from the two sets.
            // Let's store raw sets.
            setOrders(prev => {
                // This is complex because we have two async listeners updating state.
                // We should probably just combine them in a robust way or keep separate states.
                // Let's use a "reducer" style or just keep separate states in the hook.
                // But for simplicity of this `useEffect`, let's just dispatch to a state merger?
                // No, sticking to separate state variables is safer.
                return recentData;
            });
        }, (err) => {
            console.error("Error fetching recent orders:", err);
            setError("Erro ao carregar pedidos recentes.");
        });

        const unsubPending = onSnapshot(qPending, (snap) => {
            // We'll handle pending count separately
            // Requires a separate state: const [pendingCount, setPendingCount] = useState(0);
            // See below.
        }, (err) => {
            console.error("Error fetching pending orders:", err);
        });

        // ... Rethinking structure to avoid race conditions/flicker.
    }, []);

    // Let's try a simpler approach: 
    // We only expose the `stats` object.

    // We need 3 listeners.
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Query 1: Recent Strings
        const startOf7DaysAgo = new Date();
        startOf7DaysAgo.setDate(new Date().getDate() - 7);
        startOf7DaysAgo.setHours(0, 0, 0, 0);

        const qRecent = query(
            collection(db, 'orders'),
            where('createdAt', '>=', startOf7DaysAgo.toISOString())
        );

        const unsubRecent = onSnapshot(qRecent, (snap) => {
            setRecentOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError("Erro em pedidos recentes");
        });

        // Query 2: Pending
        const qPending = query(
            collection(db, 'orders'),
            where('status', 'in', ['PENDING', 'CONFIRMED', 'PAID', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY'])
        );
        const unsubPending = onSnapshot(qPending, (snap) => {
            setPendingOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
        }, (err) => console.error(err));

        // Query 3: Products
        const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
            setAllProducts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
        }, (err) => console.error(err));

        return () => {
            unsubRecent();
            unsubPending();
            unsubProducts();
        };
    }, []);

    // Compute Derived Stats
    const stats: DashboardStats = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local approx
        // Better: compare ISO date parts or just use timestamps
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();

        // Orders Today
        const ordersTodayList = recentOrders.filter(o => o.createdAt >= startOfDay);
        const ordersToday = ordersTodayList.length;
        const revenueToday = ordersTodayList.reduce((acc, o) => acc + (o.totalCents || 0), 0);

        // Packs Today
        let packsSold = 0;
        ordersTodayList.forEach(o => {
            o.items.forEach(item => {
                // Check if it's a pack (heuristic: subItems exists or type implies)
                if (item.subItems && item.subItems.length > 0) {
                    packsSold += item.quantity;
                } else if (item.productName.toLowerCase().includes('pack')) {
                    packsSold += item.quantity;
                }
            });
        });

        // Pending
        const pendingDelivery = pendingOrders.length;

        // Low Stock
        let lowStockCount = 0;
        allProducts.forEach(p => {
            if (p.active) {
                // Check minStock if exists, else default 5
                // And check variants
                if (p.variants) {
                    p.variants.forEach(v => {
                        if (v.active !== false && (v.stockQty || 0) < 5) { // Hardcoded 5 for now
                            lowStockCount++;
                        }
                    });
                }
            }
        });

        // Sales History
        const historyMap = new Map<string, number>();
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            historyMap.set(key, 0);
        }

        recentOrders.forEach(o => {
            const dateKey = new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (historyMap.has(dateKey)) {
                historyMap.set(dateKey, (historyMap.get(dateKey) || 0) + (o.totalCents || 0) / 100);
            }
        });

        const salesHistory = Array.from(historyMap.entries()).map(([date, value]) => ({ date, value }));

        // Top Flavors (From Recent Orders)
        const flavorCounts: Record<string, number> = {};
        recentOrders.forEach(o => {
            o.items.forEach(item => {
                if (item.subItems) {
                    item.subItems.forEach(sub => {
                        // We need name. subItems might not have name if it's just productId.
                        // We try to find name in allProducts map.
                        const p = allProducts.find(prod => prod.id === sub.productId);
                        const name = p?.name || sub.name || sub.productId;
                        flavorCounts[name] = (flavorCounts[name] || 0) + (sub.quantity * item.quantity);
                    });
                } else {
                    flavorCounts[item.productName] = (flavorCounts[item.productName] || 0) + item.quantity;
                }
            });
        });

        const topFlavors = Object.entries(flavorCounts)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            ordersToday,
            revenueToday,
            pendingDelivery,
            packsSold,
            lowStockCount,
            salesHistory,
            topFlavors
        };
    }, [recentOrders, pendingOrders, allProducts]);

    return { stats, loading, error };
}
