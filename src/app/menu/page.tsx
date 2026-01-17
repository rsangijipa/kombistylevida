"use client";

import React, { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { PRODUCTS, BUNDLES } from "@/data/catalog";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/cn";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import Image from "next/image";

export default function MenuPage() {
    const { items, addItem, removeItem, addBundle, toggleCart } = useCartStore();

    // Helper to get cart qty for a product
    const getQty = (pid: string) => items.find(i => i.productId === pid)?.qty || 0;

    // Calculate total count for sticky footer
    const totalCount = items.reduce((acc, el) => acc + el.qty, 0);

    return (
        <SiteShell>
            <div className="pb-24"> {/* Editorial Bottom Padding */}

                {/* Header Editorial */}
                <div className="mb-16 text-center md:mb-20">
                    <h1 className="font-serif text-[40px] leading-tight text-ink font-bold md:text-[56px] tracking-tight">
                        Nosso Menu
                    </h1>
                    <div className="mx-auto mt-6 h-[1px] w-16 bg-ink/30" />
                    <p className="mx-auto mt-6 max-w-2xl text-ink2 text-lg font-serif italic leading-relaxed">
                        Seleção de sabores vivos, fermentados com ingredientes reais. <br className="hidden md:block" />
                        Escolha seus favoritos para entrega em Florianópolis.
                    </p>
                </div>

                {/* COMBOS (Opcional: Se houver, manter estilo) */}
                {BUNDLES.length > 0 && (
                    <section className="mb-20">
                        <div className="mb-8 flex items-center justify-center gap-4">
                            <div className="h-[1px] w-12 bg-ink/10" />
                            <h2 className="font-serif text-2xl font-bold text-ink uppercase tracking-widest text-[14px]">Combos Especiais</h2>
                            <div className="h-[1px] w-12 bg-ink/10" />
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                            {BUNDLES.map((bundle) => (
                                <div key={bundle.id} className="relative group overflow-hidden bg-paper2 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                    {/* Vintage Border */}
                                    <div className="absolute inset-0 border border-ink/20 pointer-events-none z-10" />
                                    <div className="absolute inset-[4px] border border-ink/10 pointer-events-none z-10" />

                                    <div className="p-8 text-center relative z-0">
                                        {bundle.badge && (
                                            <span className="absolute right-4 top-4 bg-amber px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm">
                                                {bundle.badge}
                                            </span>
                                        )}
                                        <h3 className="font-serif text-2xl font-bold text-ink mb-2">{bundle.name}</h3>
                                        <p className="text-sm text-ink2 mb-6 font-serif italic">{bundle.description}</p>

                                        <div className="flex items-center justify-center gap-4">
                                            <div className="text-xl font-bold text-ink">
                                                R$ {((bundle.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                                            </div>
                                            <button
                                                onClick={() => addBundle(bundle.id)}
                                                className="rounded-full bg-olive px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-paper hover:bg-olive/90 transition-colors shadow-sm"
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SABORES INDIVIDUAIS */}
                <section className="max-w-6xl mx-auto">
                    <div className="mb-10 flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-ink/10" />
                        <h2 className="font-serif text-2xl font-bold text-ink uppercase tracking-widest text-[14px]">Sabores Individuais</h2>
                        <div className="h-[1px] w-12 bg-ink/10" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {PRODUCTS.map((prod) => {
                            const qty = getQty(prod.id);
                            return (
                                <article key={prod.id} className="group relative flex flex-col justify-between bg-paper2 transition-all duration-500 hover:-translate-y-1">
                                    {/* Vintage Borders */}
                                    <div className="absolute inset-0 border border-ink/30 pointer-events-none z-20" />
                                    <div className="absolute inset-[5px] border border-ink/10 pointer-events-none z-20" />

                                    <div className="relative z-10 p-6 flex flex-col items-center flex-1">
                                        {/* Image Frame */}
                                        <div className="relative mb-6 h-32 w-32 flex-shrink-0">
                                            {prod.imageSrc ? (
                                                <Image
                                                    src={prod.imageSrc}
                                                    alt={prod.name}
                                                    fill
                                                    className="object-contain drop-shadow-sm transition-transform duration-700 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 150px, 200px"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-ink/5" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="text-center w-full flex-1 flex flex-col">
                                            <h3 className="font-serif text-[24px] leading-none font-bold text-ink mb-2">
                                                {prod.name}
                                            </h3>
                                            <p className="text-xs font-serif text-ink2/80 mb-4 flex-1">
                                                {prod.shortDesc}
                                            </p>

                                            <div className="mt-auto w-full pt-4 border-t border-ink/10">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-sans text-sm font-bold text-ink">
                                                        R$ {((prod.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                                                    </span>

                                                    {/* Add Control */}
                                                    {qty === 0 ? (
                                                        <button
                                                            onClick={() => addItem(prod.id)}
                                                            className="flex items-center gap-1 rounded-full bg-amber px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-ink hover:bg-amber2 transition-colors shadow-sm"
                                                        >
                                                            <Plus size={12} />
                                                            Adicionar
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 rounded-full border border-ink/20 bg-paper px-2 py-1 shadow-inner">
                                                            <button onClick={() => removeItem(prod.id)} className="p-1 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Minus size={14} /></button>
                                                            <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                                            <button onClick={() => addItem(prod.id)} className="p-1 text-ink/60 hover:text-olive hover:bg-olive/10 rounded-full transition-colors"><Plus size={14} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Texture Overlay */}
                                    <div className="absolute inset-0 bg-paper opacity-20 mix-blend-multiply pointer-events-none z-0" />
                                </article>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* Sticky Cart Summary */}
            {totalCount > 0 && (
                <div className="fixed bottom-6 left-1/2 z-40 w-[90%] max-w-sm -translate-x-1/2 transform">
                    <button
                        onClick={() => toggleCart(true)}
                        className="flex w-full items-center justify-between rounded-full bg-olive p-4 text-paper shadow-[0_8px_20px_rgba(53,52,36,0.25)] ring-4 ring-paper transition-transform active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-olive font-bold">
                                {totalCount}
                            </div>
                            <span className="font-bold text-sm uppercase tracking-widest">Ver Sacola</span>
                        </div>
                        <ShoppingBag size={20} />
                    </button>
                </div>
            )}

        </SiteShell>
    );
}
