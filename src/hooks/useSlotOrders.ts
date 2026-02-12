import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/firestore';

export function useSlotOrders(date?: string, slotId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const requestKey = date && slotId ? `${date}:${slotId}` : null;

    useEffect(() => {
        if (!date || !slotId) return;

        const q = query(
            collection(db, 'orders'),
            where('schedule.date', '==', date),
            where('schedule.slotId', '==', slotId)
            // Note: composite index might be needed if we add orderBy('createdAt')
            // Let's sort client-side to avoid index requirement block
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];

            // Client-side sort
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(data);
            setLoadedKey(`${date}:${slotId}`);
        }, (err) => {
            console.error("Error listening to slot orders:", err);
            setLoadedKey(`${date}:${slotId}`);
        });

        return () => unsubscribe();
    }, [date, slotId]);

    const loading = !!requestKey && loadedKey !== requestKey;

    return {
        orders: requestKey ? orders : [],
        loading,
    };
}
