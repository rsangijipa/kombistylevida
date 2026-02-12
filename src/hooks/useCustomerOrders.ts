import { useCallback, useEffect, useState } from 'react';
import { Order } from '@/types/firestore';

export function useCustomerOrders(phone: string | null) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadedPhone, setLoadedPhone] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const refresh = useCallback(() => {
        setReloadKey((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (!phone) return;

        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`/api/admin/orders?customerPhone=${encodeURIComponent(phone)}&limit=200`, { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar pedidos do cliente');
                }

                const list = Array.isArray(data) ? (data as Order[]) : [];
                list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                if (!cancelled) {
                    setOrders(list);
                    setError(null);
                    setLoadedPhone(phone);
                }
            } catch (err) {
                if (!cancelled) {
                    setOrders([]);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos do cliente');
                    setLoadedPhone(phone);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 15000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [phone, reloadKey]);

    const loading = !!phone && loadedPhone !== phone;

    return {
        orders: phone ? orders : [],
        loading,
        error,
        refresh,
    };
}
