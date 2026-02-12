import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/firestore';

export function useCustomerOrders(phone: string | null) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadedPhone, setLoadedPhone] = useState<string | null>(null);

    useEffect(() => {
        if (!phone) return;

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
            setLoadedPhone(phone);
        }, (err) => {
            console.error("Error fetching customer orders:", err);
            setLoadedPhone(phone);
        });

        return () => unsubscribe();
    }, [phone]);

    const loading = !!phone && loadedPhone !== phone;

    return {
        orders: phone ? orders : [],
        loading,
    };
}
