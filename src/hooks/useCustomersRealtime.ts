
import { useCallback, useEffect, useState } from 'react';
import { Customer } from '@/types/firestore';

export function useCustomersRealtime(limitCount = 50, queryText = '') {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadedLimit, setLoadedLimit] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const refresh = useCallback(() => {
        setReloadKey((prev) => prev + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const params = new URLSearchParams();
                params.set('limit', String(limitCount));
                params.set('paginated', '1');
                if (queryText.trim()) params.set('q', queryText.trim());

                const res = await fetch(`/api/admin/customers?${params.toString()}`, { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar clientes');
                }

                const list = Array.isArray(data?.items) ? (data.items as Customer[]) : [];

                if (!cancelled) {
                    setCustomers(list);
                    setHasMore(Boolean(data?.hasMore));
                    setNextCursor(typeof data?.nextCursor === 'string' ? data.nextCursor : null);
                    setError(null);
                    setLoadedLimit(limitCount);
                }
            } catch (err) {
                if (!cancelled) {
                    setCustomers([]);
                    setHasMore(false);
                    setNextCursor(null);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
                    setLoadedLimit(limitCount);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 15000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [limitCount, queryText, reloadKey]);

    const loading = loadedLimit !== limitCount;

    const loadMore = async () => {
        if (!hasMore || loadingMore || !nextCursor) return;

        try {
            setLoadingMore(true);

            const params = new URLSearchParams();
            params.set('limit', String(limitCount));
            params.set('paginated', '1');
            params.set('cursor', nextCursor);
            if (queryText.trim()) params.set('q', queryText.trim());

            const res = await fetch(`/api/admin/customers?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar mais clientes');

            const list = Array.isArray(data?.items) ? (data.items as Customer[]) : [];
            setCustomers((prev) => [...prev, ...list]);
            setHasMore(Boolean(data?.hasMore));
            setNextCursor(typeof data?.nextCursor === 'string' ? data.nextCursor : null);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar mais clientes');
        } finally {
            setLoadingMore(false);
        }
    };

    return { customers, loading, error, refresh, hasMore, loadMore, loadingMore };
}
