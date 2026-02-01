
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Calculate week range strings
        const start = new Date(startDate);
        const end = new Date(startDate);
        end.setDate(end.getDate() + 7);

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        const q = query(
            collection(db, 'deliveryDays'),
            where('date', '>=', startStr),
            where('date', '<=', endStr)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as DeliverySlot);
            setSlots(data);
            setLoading(false);
        }, (err) => {
            console.error("Error listening to delivery slots:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [startDate]);

    return { slots, loading };
}

export function useDeliveryDayRealtime(dateStr: string | null) {
    const [dayData, setDayData] = useState<DeliverySlot | null>(null);
    const [orders, setOrders] = useState<any[]>([]); // Detailed orders for that day
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!dateStr) {
            setDayData(null);
            setOrders([]);
            return;
        }

        setLoading(true);

        // 1. Listen to Day Capacity
        // Note: We need a composite ID or query. 
        // Our backend uses `YYYY-MM-DD_DELIVERY` usually.
        // Let's assume DELIVERY mode for now or query by date.
        const qSlots = query(collection(db, 'deliveryDays'), where('date', '==', dateStr));

        const unsubSlots = onSnapshot(qSlots, (snap) => {
            if (!snap.empty) {
                setDayData(snap.docs[0].data() as DeliverySlot);
            } else {
                setDayData(null);
            }
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
            }));
            setOrders(list);
            setLoading(false);
        });

        return () => {
            unsubSlots();
            unsubOrders();
        };
    }, [dateStr]);

    return { dayData, orders, loading };
}
