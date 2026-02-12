import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/firestore';

export function useOrders(limitCount = 100) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadedLimit, setLoadedLimit] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Live listener
        const q = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(data);
            setLoadedLimit(limitCount);
        }, (err) => {
            console.error("Error listening to orders:", err);
            setError(err.message);
            setLoadedLimit(limitCount);
        });

        return () => unsubscribe();
    }, [limitCount]);

    const loading = loadedLimit !== limitCount;

    return { orders, loading, error };
}
