import { useEffect, useState } from 'react';
import { Order } from '@/types/firestore';

export function useSlotOrders(date?: string, slotId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const requestKey = date && slotId ? `${date}:${slotId}` : null;

    useEffect(() => {
        if (!date || !slotId) return;

        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`/api/admin/orders?date=${date}&slotId=${slotId}`, { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar pedidos do slot');
                }

                const list = Array.isArray(data) ? (data as Order[]) : [];
                list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                if (!cancelled) {
                    setOrders(list);
                    setError(null);
                    setLoadedKey(`${date}:${slotId}`);
                }
            } catch (err) {
                if (!cancelled) {
                    setOrders([]);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos do slot');
                    setLoadedKey(`${date}:${slotId}`);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 10000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [date, slotId]);

    const loading = !!requestKey && loadedKey !== requestKey;

    return {
        orders: requestKey ? orders : [],
        loading,
        error,
    };
}
