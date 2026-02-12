import { useEffect, useState } from 'react';
import { Order } from '@/types/firestore';

export function useOrders(limitCount = 100) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadedLimit, setLoadedLimit] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`/api/admin/orders?limit=${limitCount}`, { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar pedidos');
                }

                if (!cancelled) {
                    setOrders(Array.isArray(data) ? (data as Order[]) : []);
                    setError(null);
                    setLoadedLimit(limitCount);
                }
            } catch (err) {
                if (!cancelled) {
                    setOrders([]);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
                    setLoadedLimit(limitCount);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 10000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [limitCount]);

    const loading = loadedLimit !== limitCount;

    return { orders, loading, error };
}
