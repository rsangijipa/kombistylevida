
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Customer } from '@/types/firestore';

export function useCustomersRealtime(limitCount = 50) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, 'customers'),
            orderBy('lastOrderAt', 'desc'),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Customer[];
            setCustomers(data);
            setLoading(false);
        }, (err) => {
            console.error("Error listening to customers:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [limitCount]);

    return { customers, loading };
}
