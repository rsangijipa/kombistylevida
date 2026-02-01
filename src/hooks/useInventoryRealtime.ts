
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/firestore';

export function useInventoryRealtime() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        // We listen to all products to build the real-time inventory grid
        const q = query(collection(db, 'products'), orderBy('name'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(data);
            setLoading(false);
        }, (err) => {
            console.error("Error listening to inventory:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper to get specific variant stock
    const getStock = (productId: string, variantKey?: string) => {
        const p = products.find(i => i.id === productId);
        if (!p) return 0;
        if (!variantKey || variantKey === 'default') {
            // Logic for finding default variant if needed, or sum? 
            // For now return first variant or 0
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            return p.variants?.[0]?.stockQty || 0;
        }
        return p.variants?.find(v => v.size === variantKey)?.stockQty || 0;
    };

    return { products, loading, error, getStock };
}
