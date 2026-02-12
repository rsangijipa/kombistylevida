
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
    const [loadedFilterKey, setLoadedFilterKey] = useState<string | null>(null);
    const filterKey = JSON.stringify(filters || {});

    useEffect(() => {
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
            setLoadedFilterKey(filterKey);
        }, (err) => {
            console.error("Error listening to orders:", err);
            setLoadedFilterKey(filterKey);
        });

        return () => unsubscribe();
    }, [filterKey, filters?.customerId, filters?.limitCount, filters?.status]);

    const loading = loadedFilterKey !== filterKey;

    return { orders, loading };
}
