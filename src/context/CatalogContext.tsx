"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, Combo } from "@/types/firestore";
import { getCatalog } from "@/services/catalogService";
import { PRODUCTS as STATIC_PRODUCTS, BUNDLES as STATIC_BUNDLES } from "@/data/catalog";

type CatalogContextType = {
    products: Product[];
    combos: Combo[];
    loading: boolean;
    getProduct: (id: string) => Product | undefined;
    getCombo: (id: string) => Combo | undefined;
};

const CatalogContext = createContext<CatalogContextType>({
    products: [],
    combos: [],
    loading: true,
    getProduct: () => undefined,
    getCombo: () => undefined,
});

export const useCatalog = () => useContext(CatalogContext);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // Try fetching dynamic
                const { products: dynProducts, combos: dynCombos } = await getCatalog();

                if (dynProducts.length > 0) {
                    setProducts(dynProducts.filter(p => p.active));
                } else if (process.env.NEXT_PUBLIC_ALLOW_STATIC_FALLBACK === 'true') {
                    // Fallback Products
                    const mapped = STATIC_PRODUCTS.map(p => ({
                        ...p,
                        priceCents: p.priceCents || 0,
                        active: true,
                        updatedAt: new Date().toISOString()
                    })) as Product[];
                    setProducts(mapped);
                }

                if (dynCombos.length > 0) {
                    setCombos(dynCombos.filter(c => c.active));
                } else if (process.env.NEXT_PUBLIC_ALLOW_STATIC_FALLBACK === 'true') {
                    // Fallback Combos
                    setCombos(STATIC_BUNDLES.map(b => ({
                        id: b.id,
                        name: b.name,
                        description: b.description,
                        badge: b.badge,
                        items: b.items,
                        priceCents: b.priceCents || 0,
                        active: true,
                        updatedAt: new Date().toISOString()
                    })) as Combo[]);
                }

            } catch (e) {
                console.error("Failed to load catalog", e);
                // Full fallback only if allowed
                if (process.env.NEXT_PUBLIC_ALLOW_STATIC_FALLBACK === 'true') {
                    console.warn("Using static fallback catalog");
                    const mapped = STATIC_PRODUCTS.map(p => ({
                        ...p,
                        priceCents: p.priceCents || 0,
                        active: true,
                        updatedAt: new Date().toISOString()
                    })) as Product[];
                    setProducts(mapped);
                    setCombos(STATIC_BUNDLES.map(b => ({
                        id: b.id,
                        name: b.name,
                        description: b.description,
                        badge: b.badge,
                        items: b.items,
                        priceCents: b.priceCents || 0,
                        active: true,
                        updatedAt: new Date().toISOString()
                    })) as Combo[]);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getProduct = (id: string) => products.find(p => p.id === id);
    const getCombo = (id: string) => combos.find(c => c.id === id);

    return (
        <CatalogContext.Provider value={{ products, combos, loading, getProduct, getCombo }}>
            {children}
        </CatalogContext.Provider>
    );
}
