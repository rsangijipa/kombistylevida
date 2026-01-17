"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types/firestore";
import { getAllProducts } from "@/services/catalogService";
import { PRODUCTS as STATIC_PRODUCTS } from "@/data/catalog";

type CatalogContextType = {
    products: Product[];
    loading: boolean;
    getProduct: (id: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogContextType>({
    products: [],
    loading: true,
    getProduct: () => undefined,
});

export const useCatalog = () => useContext(CatalogContext);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // Try fetching dynamic
                const dynamic = await getAllProducts();
                if (dynamic.length > 0) {
                    setProducts(dynamic.filter(p => p.active));
                } else {
                    // Fallback to static if DB empty
                    // Map static to Product type
                    const mapped = STATIC_PRODUCTS.map(p => ({
                        ...p,
                        priceCents: p.priceCents || 0,
                        active: true,
                        updatedAt: new Date().toISOString()
                    }));
                    setProducts(mapped);
                }
            } catch (e) {
                console.error("Failed to load catalog, using static", e);
                const mapped = STATIC_PRODUCTS.map(p => ({
                    ...p,
                    priceCents: p.priceCents || 0,
                    active: true,
                    updatedAt: new Date().toISOString()
                }));
                setProducts(mapped);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getProduct = (id: string) => products.find(p => p.id === id);

    return (
        <CatalogContext.Provider value={{ products, loading, getProduct }}>
            {children}
        </CatalogContext.Provider>
    );
}
