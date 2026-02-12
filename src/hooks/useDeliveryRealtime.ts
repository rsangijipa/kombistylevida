
import { useEffect, useState } from 'react';
import { Order } from '@/types/firestore';

export interface DeliverySlot {
    date: string; // YYYY-MM-DD
    mode: 'DELIVERY' | 'PICKUP';
    dailyCapacityOverride?: number;
    dailyBooked: number;
    closed: boolean;
    slots: Record<string, { booked: number }>;
}

export function useDeliveryWeekRealtime(startDate: Date) {
    const [slots, setSlots] = useState<DeliverySlot[]>([]);
    const [loadedRangeKey, setLoadedRangeKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const start = new Date(startDate);
        const end = new Date(startDate);
        end.setDate(end.getDate() + 7);

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        const rangeKey = `${startStr}:${endStr}:DELIVERY`;

        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`/api/admin/delivery/slots?start=${startStr}&end=${endStr}&mode=DELIVERY`, { cache: 'no-store' });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(typeof body?.error === 'string' ? body.error : 'Failed to load delivery slots');
                }
                const data = await res.json();
                if (!cancelled) {
                    setSlots(Array.isArray(data) ? (data as DeliverySlot[]) : []);
                    setError(null);
                    setLoadedRangeKey(rangeKey);
                }
            } catch (err) {
                if (!cancelled) {
                    setSlots([]);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar agenda');
                    setLoadedRangeKey(rangeKey);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 15000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [startDate]);

    const currentStart = new Date(startDate).toISOString().split('T')[0];
    const currentEndDate = new Date(startDate);
    currentEndDate.setDate(currentEndDate.getDate() + 7);
    const currentEnd = currentEndDate.toISOString().split('T')[0];
    const currentRangeKey = `${currentStart}:${currentEnd}:DELIVERY`;
    const loading = loadedRangeKey !== currentRangeKey;
    return { slots, loading, error };
}

export function useDeliveryDayRealtime(dateStr: string | null) {
    const [dayData, setDayData] = useState<DeliverySlot | null>(null);
    const [orders, setOrders] = useState<Order[]>([]); // Detailed orders for that day
    const [loadedForDate, setLoadedForDate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!dateStr) return;

        let cancelled = false;

        const load = async () => {
            try {
                const [slotsRes, ordersRes] = await Promise.all([
                    fetch(`/api/admin/delivery/slots?start=${dateStr}&end=${dateStr}&mode=DELIVERY`, { cache: 'no-store' }),
                    fetch(`/api/admin/orders?date=${dateStr}`, { cache: 'no-store' }),
                ]);

                if (!slotsRes.ok || !ordersRes.ok) {
                    const [slotsBody, ordersBody] = await Promise.all([
                        slotsRes.json().catch(() => ({})),
                        ordersRes.json().catch(() => ({})),
                    ]);
                    const message = typeof slotsBody?.error === 'string'
                        ? slotsBody.error
                        : (typeof ordersBody?.error === 'string' ? ordersBody.error : 'Failed to load day data');
                    throw new Error(message);
                }

                const slotsData = await slotsRes.json();
                const ordersData = await ordersRes.json();

                const activeOrders = Array.isArray(ordersData)
                    ? (ordersData as Order[]).filter((order) => order.status !== 'CANCELED')
                    : [];

                if (!cancelled) {
                    setDayData(Array.isArray(slotsData) && slotsData.length > 0 ? (slotsData[0] as DeliverySlot) : null);
                    setOrders(activeOrders);
                    setError(null);
                    setLoadedForDate(dateStr);
                }
            } catch (err) {
                if (!cancelled) {
                    setDayData(null);
                    setOrders([]);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes do dia');
                    setLoadedForDate(dateStr);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 10000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [dateStr]);

    const isLoaded = !!dateStr && loadedForDate === dateStr;

    return {
        dayData: isLoaded ? dayData : null,
        orders: isLoaded ? orders : [],
        loading: !!dateStr && !isLoaded,
        error,
    };
}
