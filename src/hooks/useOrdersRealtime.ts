
import { useEffect, useState } from 'react';
import { Order } from '@/types/firestore';

export interface OrderFilters {
    status?: string;
    customerId?: string;
    limitCount?: number;
}

export function useOrdersRealtime(filters?: OrderFilters) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadedFilterKey, setLoadedFilterKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const filterKey = JSON.stringify(filters || {});

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const params = new URLSearchParams();
                params.set('limit', String(filters?.limitCount || 100));
                if (filters?.status) params.set('status', filters.status);

                const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar pedidos');
                }

                const list = Array.isArray(data) ? (data as Order[]) : [];
                const filtered = filters?.customerId
                    ? list.filter((order) => order.customer?.id === filters.customerId)
                    : list;

                if (!cancelled) {
                    setOrders(filtered);
                    setError(null);
                    setLoadedFilterKey(filterKey);
                }
            } catch (err) {
                if (!cancelled) {
                    setOrders([]);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
                    setLoadedFilterKey(filterKey);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 10000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [filterKey, filters?.customerId, filters?.limitCount, filters?.status]);

    const loading = loadedFilterKey !== filterKey;

    return { orders, loading, error };
}
