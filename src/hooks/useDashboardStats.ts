import { useEffect, useState } from 'react';

export interface DashboardStats {
    ordersToday: number;
    revenueToday: number;
    pendingDelivery: number;
    packsSold: number;
    lowStockCount: number;
    salesHistory: { date: string; value: number }[];
    topFlavors: { name: string; quantity: number }[];
}

const EMPTY_STATS: DashboardStats = {
    ordersToday: 0,
    revenueToday: 0,
    pendingDelivery: 0,
    packsSold: 0,
    lowStockCount: 0,
    salesHistory: [],
    topFlavors: [],
};

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch('/api/admin/stats', { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    const message = typeof data?.error === 'string' ? data.error : 'Erro ao carregar dashboard';
                    throw new Error(message);
                }

                if (!cancelled) {
                    setStats({
                        ordersToday: Number(data.ordersToday || 0),
                        revenueToday: Number(data.revenueToday || 0),
                        pendingDelivery: Number(data.pendingDelivery || 0),
                        packsSold: Number(data.packsSold || 0),
                        lowStockCount: Number(data.lowStockCount || 0),
                        salesHistory: Array.isArray(data.salesHistory) ? data.salesHistory : [],
                        topFlavors: Array.isArray(data.topFlavors) ? data.topFlavors : [],
                    });
                    setError(null);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setStats(EMPTY_STATS);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
                    setLoading(false);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 15000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, []);

    return { stats, loading, error };
}
