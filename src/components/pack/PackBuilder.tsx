"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { FLAVORS } from "@/data/flavors";
import Image from "next/image";
import { Plus, Minus, ShoppingBag } from "lucide-react";

export function PackBuilder() {
    const [packSize, setPackSize] = useState<6 | 12>(6);
    const [selections, setSelections] = useState<Record<string, number>>({});
    const addPack = useCartStore(s => s.addPack);

    const totalSelected = Object.values(selections).reduce((a, b) => a + b, 0);
    const remaining = packSize - totalSelected;

    const handleAdd = (flavorId: string) => {
        if (remaining <= 0) return;
        setSelections(prev => ({
            ...prev,
            [flavorId]: (prev[flavorId] || 0) + 1
        }));
    };

    const handleRemove = (flavorId: string) => {
        if (!selections[flavorId]) return;
        setSelections(prev => {
            const next = { ...prev };
            next[flavorId] -= 1;
            if (next[flavorId] <= 0) delete next[flavorId];
            return next;
        });
    };

    const handleAddToCart = () => {
        if (remaining !== 0) return;

        // Convert map to array for store
        const flavorsArray = Object.entries(selections).map(([id, qty]) => ({
            flavorId: id,
            quantity: qty
        }));

        addPack(packSize, flavorsArray);
        // Reset or Navigate? Maybe toast?
        // Reset for now
        setSelections({});
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* 1. Size Selection */}
            <div className="flex justify-center gap-6 mb-12">
                {[6, 12].map((size) => (
                    <button
                        key={size}
                        onClick={() => { setPackSize(size as 6 | 12); setSelections({}); }}
                        className={`
                            px-8 py-4 rounded-xl border-2 font-serif text-xl transition-all
                            ${packSize === size
                                ? "border-olive bg-olive text-paper shadow-lg scale-105"
                                : "border-ink/10 bg-paper hover:border-olive/30 text-ink/60"}
                        `}
                    >
                        Caixa de {size}
                    </button>
                ))}
            </div>

            {/* 2. Visual Box (Grid) */}
            <div className="relative mb-12 rounded-2xl border-2 border-ink/10 bg-[#e3d7c2] p-8 text-center shadow-[inset_0_2px_15px_rgba(0,0,0,0.1)] transition-colors duration-700">
                {/* Texture Overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-10 bg-[url('/images/texture-paper.png')] mix-blend-multiply" />

                <div className="relative z-10">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-widest text-ink/40">Sua Caixa</div>
                        {/* Savings Badge */}
                        {remaining < packSize && (
                            <div className="animate-in fade-in zoom-in spin-in-3 duration-500 rounded-full bg-olive px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-paper shadow-sm">
                                Economia de R$ {(packSize === 12 ? 24 : 10).toFixed(2).replace('.', ',')}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto min-h-[120px]">
                        {/* Render filled slots */}
                        {Object.entries(selections).flatMap(([id, qty]) =>
                            Array(qty).fill(id).map((fid, i) => (
                                <div key={`${fid}-${i}`} className="group relative flex aspect-[1/2] items-center justify-center rounded-lg border border-ink/10 bg-paper shadow-sm transition-all animate-in zoom-in-50 duration-300">
                                    <Image
                                        src={FLAVORS.find(f => f.id === fid)?.imageSrc || ""}
                                        alt="Kombucha"
                                        fill
                                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <button
                                        onClick={() => handleRemove(fid)}
                                        className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1 text-red-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:scale-110 active:scale-90"
                                    >
                                        <Minus size={12} />
                                    </button>
                                </div>
                            ))
                        )}

                        {/* Render empty slots */}
                        {Array(remaining).fill(0).map((_, i) => (
                            <div key={`empty-${i}`} className="flex aspect-[1/2] items-center justify-center rounded-lg border-2 border-dashed border-ink/10 bg-black/5 transition-colors hover:bg-black/10">
                                <span className="font-serif text-2xl font-bold text-ink/20 transition-transform duration-300 hover:scale-125 hover:text-ink/40">+</span>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 max-w-md mx-auto">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-ink/60">
                            <span>{totalSelected} de {packSize}</span>
                            <span>{remaining === 0 ? "Completo!" : "Adicione mais"}</span>
                        </div>
                        <div className="h-3 bg-paper/50 rounded-full overflow-hidden border border-ink/5 box-content p-0.5">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${remaining === 0 ? "bg-olive shadow-[0_0_10px_rgba(53,52,36,0.3)]" : "bg-amber"}`}
                                style={{ width: `${(totalSelected / packSize) * 100}%` }}
                            />
                        </div>
                        {remaining === 0 && (
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-olive animate-pulse">
                                Tudo pronto para fechar!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Flavor Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {FLAVORS.map(flavor => (
                    <div key={flavor.id} className="group bg-paper border-2 border-ink/10 rounded-2xl p-6 hover:border-olive/30 transition-all flex flex-row sm:flex-col items-center gap-4 text-left sm:text-center relative overflow-hidden">

                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
                            <Image src={flavor.imageSrc} alt={flavor.title} fill className="object-contain" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-serif font-bold text-2xl text-ink leading-tight mb-1">{flavor.title}</h3>
                            <button
                                onClick={() => handleAdd(flavor.id)}
                                disabled={remaining === 0}
                                className="mt-2 w-full sm:w-14 h-14 rounded-full bg-olive text-paper flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all font-bold shadow-md touch-target"
                                aria-label={`Adicionar ${flavor.title}`}
                            >
                                <Plus size={28} />
                                <span className="sm:hidden ml-2 text-lg">ADICIONAR</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. Sticky CTA */}
            <div className={`fixed bottom-0 left-0 right-0 bg-paper border-t border-ink/10 p-4 shadow-2xl transition-transform duration-300 z-50 ${remaining === 0 ? "translate-y-0" : "translate-y-full"}`}>
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-olive text-paper font-bold uppercase tracking-widest text-lg py-5 rounded-full flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-lg touch-target"
                    >
                        <ShoppingBag size={24} />
                        Adicionar à Sacola
                    </button>
                </div>
            </div>
        </div>
    );
}
