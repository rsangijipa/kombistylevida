
"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { Product } from "@/types/firestore";
import { Loader2, Save, AlertCircle } from "lucide-react";

import { useInventoryRealtime } from "@/hooks/useInventoryRealtime";

export default function ProductsPage() {
    return (
        <AuthProvider>
            <ProductsManager />
        </AuthProvider>
    );
}

function ProductsManager() {
    const { products, loading } = useInventoryRealtime();
    const [saving, setSaving] = useState<string | null>(null);

    // No manual fetch needed

    const handleUpdate = async (product: Product, updates: Partial<Product>) => {
        setSaving(product.id);
        const newProduct = { ...product, ...updates };

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product.id,
                    priceCents: newProduct.priceCents,
                    active: newProduct.active,
                    variants: newProduct.variants
                })
            });

            if (res.ok) {
                // Realtime hook will update
            }
        } catch (e) {
            alert("Erro ao salvar produto");
        } finally {
            setSaving(null);
        }
    };

    const updateVariantPrice = (product: Product, size: '300ml' | '500ml', price: number) => {
        const variants = product.variants?.map(v => v.size === size ? { ...v, price } : v) || [];
        // Also update main priceCents if it's the base size (300ml)
        const updates: Partial<Product> = { variants };
        if (size === '300ml') {
            updates.priceCents = price * 100;
        }
        handleUpdate(product, updates);
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-ink">Produtos & Preços</h1>
                <p className="text-ink2">Gerencie preços e disponibilidade das garrafas.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-olive"><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map(product => (
                        <div key={product.id} className={`rounded-xl border p-6 shadow-sm transition-all ${product.active ? 'bg-white border-ink/10' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded bg-paper2 p-1">
                                        <img src={product.imageSrc} className="h-full w-full object-contain" alt="" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-ink">{product.name}</h3>
                                        <p className="text-xs text-ink/60">{product.active ? 'Ativo' : 'Inativo'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={product.active}
                                            onChange={(e) => handleUpdate(product, { active: e.target.checked })}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-olive"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                                    <span className="text-sm font-bold text-ink/60">300ml</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-ink/40">R$</span>
                                        <input
                                            type="number"
                                            className="w-16 rounded bg-gray-50 px-2 py-1 text-right font-mono font-bold text-ink focus:outline-none focus:ring-1 focus:ring-olive/50"
                                            value={product.variants?.find(v => v.size === '300ml')?.price || 12}
                                            onChange={e => updateVariantPrice(product, '300ml', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                                    <span className="text-sm font-bold text-ink/60">500ml</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-ink/40">R$</span>
                                        <input
                                            type="number"
                                            className="w-16 rounded bg-gray-50 px-2 py-1 text-right font-mono font-bold text-ink focus:outline-none focus:ring-1 focus:ring-olive/50"
                                            value={product.variants?.find(v => v.size === '500ml')?.price || 15}
                                            onChange={e => updateVariantPrice(product, '500ml', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {saving === product.id && (
                                <div className="mt-2 text-xs text-olive animate-pulse flex items-center justify-end gap-1">
                                    <Save size={10} /> Salvando...
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
