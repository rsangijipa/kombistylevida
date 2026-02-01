import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/firestore';

export function useCustomerOrders(phone: string | null) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!phone) {
            setOrders([]);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, 'orders'),
            where('customer.phone', '==', phone),
            // We can try orderBy if index exists, else sort client side.
            // Safe bet: sort client side for now to avoid blocking on index creation.
            // orderBy('createdAt', 'desc') 
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
            console.error("Error fetching customer orders:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [phone]);

    return { orders, loading };
}
