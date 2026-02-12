
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

    useEffect(() => {
        // Calculate week range strings
        const start = new Date(startDate);
        const end = new Date(startDate);
        end.setDate(end.getDate() + 7);

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        const rangeKey = `${startStr}:${endStr}:DELIVERY`;

        const q = query(
            collection(db, 'deliveryDays'),
            where('date', '>=', startStr),
            where('date', '<=', endStr),
            where('mode', '==', 'DELIVERY')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as DeliverySlot);
            setSlots(data);
            setLoadedRangeKey(rangeKey);
        }, (err) => {
            console.error("Error listening to delivery slots:", err);
            setLoadedRangeKey(rangeKey);
        });

        return () => unsubscribe();
    }, [startDate]);

    const currentStart = new Date(startDate).toISOString().split('T')[0];
    const currentEndDate = new Date(startDate);
    currentEndDate.setDate(currentEndDate.getDate() + 7);
    const currentEnd = currentEndDate.toISOString().split('T')[0];
    const currentRangeKey = `${currentStart}:${currentEnd}:DELIVERY`;
    const loading = loadedRangeKey !== currentRangeKey;
    return { slots, loading };
}

export function useDeliveryDayRealtime(dateStr: string | null) {
    const [dayData, setDayData] = useState<DeliverySlot | null>(null);
    const [orders, setOrders] = useState<Order[]>([]); // Detailed orders for that day
    const [loadedForDate, setLoadedForDate] = useState<string | null>(null);

    useEffect(() => {
        if (!dateStr) return;

        // 1. Listen to Day Capacity
        // Note: We need a composite ID or query. 
        // Our backend uses `YYYY-MM-DD_DELIVERY` usually.
        // Let's assume DELIVERY mode for now or query by date.
        const qSlots = query(
            collection(db, 'deliveryDays'),
            where('date', '==', dateStr),
            where('mode', '==', 'DELIVERY')
        );

        const unsubSlots = onSnapshot(qSlots, (snap) => {
            if (!snap.empty) {
                setDayData(snap.docs[0].data() as DeliverySlot);
            } else {
                setDayData(null);
            }
            setLoadedForDate(dateStr);
        });

        // 2. Listen to Orders for that day
        // This validates "Pedidos do dia atualizam em tempo real"
        const qOrders = query(
            collection(db, 'orders'),
            where('schedule.date', '==', dateStr),
            where('status', 'in', ['CONFIRMED', 'PAID', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY', 'DELIVERED']) // Only active orders
        );

        const unsubOrders = onSnapshot(qOrders, (snap) => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Order[];
            setOrders(list);
            setLoadedForDate(dateStr);
        });

        return () => {
            unsubSlots();
            unsubOrders();
        };
    }, [dateStr]);

    const isLoaded = !!dateStr && loadedForDate === dateStr;

    return {
        dayData: isLoaded ? dayData : null,
        orders: isLoaded ? orders : [],
        loading: !!dateStr && !isLoaded,
    };
}
