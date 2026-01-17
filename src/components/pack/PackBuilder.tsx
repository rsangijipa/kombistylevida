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
            <div className="bg-paper2 border border-ink/10 rounded-2xl p-8 mb-12 relative overflow-hidden text-center shadow-inner">
                <div className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-6">Sua Caixa</div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-3xl mx-auto min-h-[120px]">
                    {/* Render filled slots */}
                    {Object.entries(selections).flatMap(([id, qty]) =>
                        Array(qty).fill(id).map((fid, i) => (
                            <div key={`${fid}-${i}`} className="aspect-[1/2] bg-paper rounded-lg border border-ink/20 flex items-center justify-center relative group animate-fade-in-up">
                                <Image
                                    src={FLAVORS.find(f => f.id === fid)?.imageSrc || ""}
                                    alt="Kombucha"
                                    fill
                                    className="object-contain p-2"
                                />
                                <button
                                    onClick={() => handleRemove(fid)}
                                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <Minus size={12} />
                                </button>
                            </div>
                        ))
                    )}

                    {/* Render empty slots */}
                    {Array(remaining).fill(0).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-[1/2] rounded-lg border-2 border-dashed border-ink/10 flex items-center justify-center">
                            <span className="text-ink/10 font-bold text-2xl">+</span>
                        </div>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-8 max-w-md mx-auto">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                        <span>{totalSelected} de {packSize}</span>
                        <span>{remaining === 0 ? "Completo!" : "Adicione mais"}</span>
                    </div>
                    <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${remaining === 0 ? "bg-olive" : "bg-amber"}`}
                            style={{ width: `${(totalSelected / packSize) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Flavor Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {FLAVORS.map(flavor => (
                    <div key={flavor.id} className="group bg-paper border border-ink/10 rounded-xl p-4 hover:shadow-md transition-all flex flex-col items-center text-center">
                        <div className="relative w-24 h-24 mb-4">
                            <Image src={flavor.imageSrc} alt={flavor.title} fill className="object-contain" />
                        </div>
                        <h3 className="font-serif font-bold text-ink mb-1 leading-tight">{flavor.title}</h3>
                        <div className="mt-auto pt-4">
                            <button
                                onClick={() => handleAdd(flavor.id)}
                                disabled={remaining === 0}
                                className="w-8 h-8 rounded-full bg-olive text-paper flex items-center justify-center hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 transition-all font-bold shadow-sm"
                            >
                                <Plus size={16} />
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
                        className="w-full bg-olive text-paper font-bold uppercase tracking-widest py-4 rounded-full flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg"
                    >
                        <ShoppingBag size={20} />
                        Adicionar Pack à Sacola
                    </button>
                </div>
            </div>
        </div>
    );
}
