
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/firestore';

export interface OrderFilters {
    status?: string;
    customerId?: string;
    limitCount?: number;
}

export function useOrdersRealtime(filters?: OrderFilters) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

        if (filters?.status) {
            constraints.unshift(where('status', '==', filters.status));
        }
        if (filters?.customerId) {
            constraints.unshift(where('customer.id', '==', filters.customerId));
        }

        constraints.push(limit(filters?.limitCount || 100));

        const q = query(collection(db, 'orders'), ...constraints);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(data);
            setLoading(false);
        }, (err) => {
            console.error("Error listening to orders:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [JSON.stringify(filters)]); // Deep compare dependency

    return { orders, loading };
}
