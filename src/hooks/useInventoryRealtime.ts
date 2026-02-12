
import { useEffect, useState } from 'react';
import { Product } from '@/types/firestore';

export function useInventoryRealtime() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch('/api/admin/inventory', { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(typeof data?.error === 'string' ? data.error : 'Erro ao carregar inventario');
                }

                const map = (data || {}) as Record<string, Product>;
                const list = Object.entries(map).map(([id, value]) => ({ ...value, id })) as Product[];
                list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                if (!cancelled) {
                    setProducts(list);
                    setError(null);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setProducts([]);
                    setError(err instanceof Error ? err.message : 'Erro ao carregar inventario');
                    setLoading(false);
                }
            }
        };

        load();
        const interval = window.setInterval(load, 15000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
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
