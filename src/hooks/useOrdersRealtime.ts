import { useCallback, useEffect, useState } from 'react';
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
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const filterKey = JSON.stringify(filters || {});

    const refresh = useCallback(() => {
        setReloadKey((prev) => prev + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadFirstPage = async () => {
            try {
                const params = new URLSearchParams();
                params.set('limit', String(filters?.limitCount || 100));
                params.set('paginated', '1');
                if (filters?.status) params.set('status', filters.status);

                const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar pedidos');
                }

                const list = Array.isArray(data?.items) ? (data.items as Order[]) : [];
                const filtered = filters?.customerId
                    ? list.filter((order) => order.customer?.id === filters.customerId)
                    : list;

                if (!cancelled) {
                    setOrders(filtered);
                    setHasMore(Boolean(data?.hasMore));
                    setNextCursor(typeof data?.nextCursor === 'string' ? data.nextCursor : null);
                    setError(null);
                    setLoadedFilterKey(filterKey);
                }
            } catch (err) {
                if (!cancelled) {
                    setOrders([]);
                    setHasMore(false);
                    setNextCursor(null);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
                    setLoadedFilterKey(filterKey);
                }
            }
        };

        loadFirstPage();
        const interval = window.setInterval(loadFirstPage, 10000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [filterKey, filters?.customerId, filters?.limitCount, filters?.status, reloadKey]);

    const loading = loadedFilterKey !== filterKey;

    const loadMore = async () => {
        if (!hasMore || loadingMore || !nextCursor) return;

        try {
            const params = new URLSearchParams();
            params.set('limit', String(filters?.limitCount || 100));
            params.set('paginated', '1');
            params.set('cursor', nextCursor);
            if (filters?.status) params.set('status', filters.status);

            setLoadingMore(true);

            const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar mais pedidos');

            const list = Array.isArray(data?.items) ? (data.items as Order[]) : [];
            const filtered = filters?.customerId
                ? list.filter((order) => order.customer?.id === filters.customerId)
                : list;

            setOrders((prev) => [...prev, ...filtered]);
            setHasMore(Boolean(data?.hasMore));
            setNextCursor(typeof data?.nextCursor === 'string' ? data.nextCursor : null);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar mais pedidos');
        } finally {
            setLoadingMore(false);
        }
    };

    return { orders, loading, error, refresh, hasMore, loadMore, loadingMore };
}
