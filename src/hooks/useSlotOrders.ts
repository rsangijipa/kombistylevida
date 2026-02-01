import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/firestore';

export function useSlotOrders(date?: string, slotId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!date || !slotId) {
            setOrders([]);
            return;
        }

        setLoading(true);

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
            setLoading(false);
        }, (err) => {
            console.error("Error listening to slot orders:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [date, slotId]);

    return { orders, loading };
}
