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
            <div className="pb-20"> {/* Extra padding for sticky footer */}

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="font-serif text-[40px] leading-tight text-olive font-bold md:text-[56px]">
                        Nosso Menu
                    </h1>
                    <p className="mt-2 text-ink2 text-lg font-serif italic">
                        Sabores vivos, combos especiais.
                    </p>
                </div>

                {/* COMBOS */}
                <section className="mb-16">
                    <div className="mb-6 flex items-center gap-4">
                        <h2 className="font-serif text-2xl font-bold text-ink">Combos & Kits</h2>
                        <div className="h-[1px] flex-1 bg-ink/10" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {BUNDLES.map((bundle) => (
                            <div key={bundle.id} className="relative overflow-hidden rounded-xl border border-ink/10 bg-paper p-6 shadow-sm transition-all hover:shadow-md">
                                {bundle.badge && (
                                    <span className="absolute right-0 top-0 rounded-bl-xl bg-amber px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
                                        {bundle.badge}
                                    </span>
                                )}
                                <h3 className="font-serif text-xl font-bold text-olive">{bundle.name}</h3>
                                <p className="mt-2 text-sm text-ink2 min-h-[40px]">{bundle.description}</p>

                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-lg font-bold text-ink">
                                        R$ {((bundle.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                                    </div>
                                    <button
                                        onClick={() => addBundle(bundle.id)}
                                        className="rounded-full bg-olive px-4 py-2 text-xs font-bold uppercase tracking-widest text-paper hover:bg-olive/90"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SABORES */}
                <section>
                    <div className="mb-6 flex items-center gap-4">
                        <h2 className="font-serif text-2xl font-bold text-ink">Sabores Individuais</h2>
                        <div className="h-[1px] flex-1 bg-ink/10" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {PRODUCTS.map((prod) => {
                            const qty = getQty(prod.id);
                            return (
                                <div key={prod.id} className="flex gap-4 rounded-xl border border-ink/10 bg-paper p-4 shadow-sm transition-all hover:bg-paper2/50">
                                    {/* Image */}
                                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-paper2/80">
                                        {prod.imageSrc && (
                                            <Image
                                                src={prod.imageSrc}
                                                alt={prod.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="font-serif text-lg font-bold text-ink">{prod.name}</h3>
                                            <p className="text-xs text-ink2">{prod.shortDesc}</p>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="text-base font-bold text-ink/80">
                                                R$ {((prod.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                                            </div>

                                            {/* Add Control */}
                                            {qty === 0 ? (
                                                <button
                                                    onClick={() => addItem(prod.id)}
                                                    className="flex items-center gap-1 rounded-full border border-ink/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-olive hover:text-paper transition-colors"
                                                >
                                                    <Plus size={12} />
                                                    Add
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-white px-2 py-1">
                                                    <button onClick={() => removeItem(prod.id)} className="p-1 text-ink/60 hover:text-red-600"><Minus size={14} /></button>
                                                    <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                                    <button onClick={() => addItem(prod.id)} className="p-1 text-ink/60 hover:text-olive"><Plus size={14} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* Sticky Cart Summary (Mobile/Desktop) if items exist */}
            {totalCount > 0 && (
                <div className="fixed bottom-6 left-1/2 z-40 w-[90%] max-w-sm -translate-x-1/2 transform">
                    <button
                        onClick={() => toggleCart(true)}
                        className="flex w-full items-center justify-between rounded-full bg-olive p-4 text-paper shadow-xl ring-4 ring-paper transition-transform active:scale-95"
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
