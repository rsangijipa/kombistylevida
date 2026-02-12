
import { useEffect, useState } from 'react';
import { Customer } from '@/types/firestore';

export function useCustomersRealtime(limitCount = 50) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadedLimit, setLoadedLimit] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch('/api/admin/customers', { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar clientes');
                }

                const list = (Array.isArray(data) ? (data as Customer[]) : []).slice(0, limitCount);

                if (!cancelled) {
                    setCustomers(list);
                    setError(null);
                    setLoadedLimit(limitCount);
                }
            } catch (err) {
                if (!cancelled) {
                    setCustomers([]);
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
    }, [limitCount]);

    const loading = loadedLimit !== limitCount;

    return { customers, loading, error };
}
