"use client";

import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { BUNDLES as STATIC_BUNDLES } from "@/data/catalog";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/cn";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCatalog } from "@/context/CatalogContext";

export default function MenuPage() {
    const { items, addItem, removeItem, addBundle, toggleCart } = useCartStore();
    const { products, combos, loading } = useCatalog();

    const comboCards = combos.map((combo) => {
        const fallback = STATIC_BUNDLES.find((item) => item.id === combo.id);
        return {
            ...combo,
            description: combo.description || fallback?.description || "",
            badge: combo.badge || fallback?.badge,
            imageSrc: fallback?.imageSrc,
        };
    });

    // Helper to get cart qty for a product
    // Helper to get Qty for a product from cart (summing direct products and maybe packs if we want, but for now just direct)
    // Actually, packs contain products. If we want to show "You have 2 of these in cart", we might need to sum them up.
    // For simplicity in MVP Menu, we just count direct product items.
    const getQty = (pid: string) => {
        const item = items.find(i => i.type === 'PRODUCT' && i.productId === pid);
        return item ? item.quantity : 0;
    };

    // Calculate total count for sticky footer
    const totalCount = items.reduce((acc, el) => acc + el.quantity, 0);

    return (
        <SiteShell>
            <div className="pb-12"> {/* Editorial Bottom Padding */}

                {/* Header Editorial - Full Bleed */}
                <div className="mb-12 md:mb-16 text-center relative py-16 -mx-4 md:-mx-12 rounded-t-[32px] md:rounded-t-[48px] overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/menu/header_bg.jpg"
                            alt="Background Texture"
                            fill
                            className="object-cover opacity-90"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-paper/80 via-paper/50 to-transparent" />
                    </div>

                    <div className="relative z-10 px-6">
                        <h1 className="font-serif text-[40px] leading-tight text-ink font-bold md:text-[56px] tracking-tight drop-shadow-sm">
                            Nosso Menu
                        </h1>
                        <div className="mx-auto mt-6 h-[1px] w-16 bg-ink/30" />
                        <p className="mx-auto mt-6 max-w-2xl text-ink2 text-lg font-serif italic leading-relaxed font-medium">
                            Seleção de sabores vivos, fermentados com ingredientes reais. <br className="hidden md:block" />
                            Escolha seus favoritos para entrega em Ariquemes e Região.
                        </p>
                    </div>
                </div>

                {/* COMBOS (Opcional: Se houver, manter estilo) */}
                {comboCards.length > 0 && (
                    <section className="mb-16">
                        <div className="mb-8 flex items-center justify-center gap-4">
                            <div className="h-[1px] w-12 bg-ink/10" />
                            <h2 className="font-serif text-2xl font-bold text-ink uppercase tracking-widest text-[14px]">Combos Especiais</h2>
                            <div className="h-[1px] w-12 bg-ink/10" />
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto px-4">
                            {comboCards.map((bundle, index) => (
                                <div
                                    key={bundle.id}
                                    className="relative group overflow-hidden bg-paper rounded-xl shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-paper animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    {/* Editorial Border (Inset) */}
                                    <div className="absolute inset-[10px] border border-ink/10 rounded-lg pointer-events-none z-10 transition-colors group-hover:border-ink/20" />

                                    <div className="p-6 md:p-8 text-center relative z-0 flex flex-col h-full justify-between items-center">

                                        {/* Bundle Image */}
                                        <div className="relative w-48 h-48 mb-6 transition-transform duration-700 group-hover:scale-105">
                                            {bundle.imageSrc ? (
                                                <Image
                                                    src={bundle.imageSrc}
                                                    alt={bundle.name}
                                                    fill
                                                    className="object-contain drop-shadow-md"
                                                    sizes="(max-width: 768px) 200px, 300px"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-ink/5 rounded-full flex items-center justify-center text-ink/20 font-serif">
                                                    Sem Foto
                                                </div>
                                            )}
                                        </div>

                                        {bundle.badge && (
                                            <span className="absolute right-6 top-6 bg-amber/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm backdrop-blur-sm rounded-sm z-20">
                                                {bundle.badge}
                                            </span>
                                        )}
                                        <div>
                                            <h3 className="font-serif text-3xl font-normal text-ink mb-3">{bundle.name}</h3>
                                            <p className="text-base text-ink2/80 mb-6 font-serif leading-relaxed">{bundle.description}</p>
                                        </div>

                                        <div className="mt-auto flex flex-col items-center gap-4">
                                            <div className="text-2xl font-serif text-ink tracking-tight">
                                                R$ {((bundle.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                                            </div>
                                            <button
                                                onClick={() => addBundle(bundle.id)}
                                                className="w-full rounded-full border border-ink/20 bg-transparent py-3 text-xs font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-all"
                                            >
                                                Adicionar ao Pedido
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SABORES INDIVIDUAIS */}
                <section className="max-w-6xl mx-auto px-4">
                    <div className="mb-8 flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-ink/10" />
                        <h2 className="font-serif text-2xl font-bold text-ink uppercase tracking-widest text-[14px]">Sabores Individuais</h2>
                        <div className="h-[1px] w-12 bg-ink/10" />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-[430px] rounded-xl bg-paper animate-pulse border border-ink/5" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {products.map((prod, index) => {
                            const qty = getQty(prod.id);
                            return (
                                <article
                                    key={prod.id}
                                    className="group relative flex flex-col justify-between bg-paper rounded-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-paper animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Editorial Border */}
                                    <div className="absolute inset-[8px] border border-ink/5 rounded-lg pointer-events-none z-20 group-hover:border-ink/15 transition-colors" />

                                    <div className="relative z-10 p-6 flex flex-col items-center flex-1">
                                        {/* Image Frame */}
                                        <div className="relative mb-6 h-40 w-40 flex-shrink-0 transition-transform duration-700 group-hover:scale-105">
                                            {prod.imageSrc ? (
                                                <Image
                                                    src={prod.imageSrc}
                                                    alt={prod.name}
                                                    fill
                                                    className="object-contain drop-shadow-sm"
                                                    sizes="(max-width: 768px) 150px, 200px"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-ink/5 rounded-full" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="text-center w-full flex-1 flex flex-col items-center">
                                            <h3 className="font-serif text-2xl leading-none font-normal text-ink mb-3">
                                                {prod.name}
                                            </h3>
                                            <p className="text-sm font-serif text-ink2/70 mb-6 flex-1 leading-relaxed px-2">
                                                {prod.shortDesc || "Fermentacao natural com ingredientes reais."}
                                            </p>

                                            <div className="mt-auto w-full pt-6 border-t border-ink/5 flex flex-col gap-3">
                                                <span className="font-serif text-lg text-ink block">
                                                    R$ {((prod.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                                                </span>

                                                {/* Add Control */}
                                                {qty === 0 ? (
                                                    <button
                                                        onClick={() => addItem(prod.id)}
                                                        className="flex w-full h-[48px] justify-center items-center gap-2 rounded-full border border-ink/20 bg-transparent py-2.5 text-[10px] font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-all touch-target"
                                                    >
                                                        <Plus size={14} />
                                                        Adicionar
                                                    </button>
                                                ) : (
                                                    <div className="flex w-full h-[48px] items-center justify-between rounded-full border border-ink/20 bg-paper px-1 py-1 shadow-inner touch-target">
                                                        <button onClick={() => removeItem(prod.id)} className="h-full w-12 flex items-center justify-center text-ink/60 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-90"><Minus size={18} /></button>
                                                        <span className="text-sm font-bold w-full text-center select-none">{qty}</span>
                                                        <button onClick={() => addItem(prod.id)} className="h-full w-12 flex items-center justify-center text-ink/60 hover:text-olive hover:bg-olive/10 rounded-full transition-colors active:scale-90"><Plus size={18} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtle Texture Tint */}
                                    <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
                                </article>
                            );
                            })}
                        </div>
                    )}
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
