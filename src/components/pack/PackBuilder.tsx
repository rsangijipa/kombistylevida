"use client";

import React, { useState } from "react";
import { PRODUCTS, Product } from "@/data/catalog";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { PackSlot } from "./PackSlot";
import { FlavorDraggable } from "./FlavorDraggable";
import { PackSummary } from "./PackSummary";

export function PackBuilder() {
    const [packSize, setPackSize] = useState<6 | 12>(6);
    const [slots, setSlots] = useState<(Product | null)[]>(Array(6).fill(null));
    const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
    const { addPack } = useCartStore();
    const router = useRouter();

    // Resize slots when pack size changes
    React.useEffect(() => {
        setSlots(prev => {
            const newSlots = Array(packSize).fill(null);
            for (let i = 0; i < Math.min(prev.length, packSize); i++) {
                newSlots[i] = prev[i];
            }
            return newSlots;
        });
    }, [packSize]);

    const addToFirstEmptySlot = (product: Product) => {
        const emptyIndex = slots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            const newSlots = [...slots];
            newSlots[emptyIndex] = product;
            setSlots(newSlots);
            setLastAddedIndex(emptyIndex);

            // Clear animation flag
            setTimeout(() => setLastAddedIndex(null), 500);
        }
    };

    const removeSlot = (index: number) => {
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
    };

    const handleAddToCart = () => {
        const flavorCounts: Record<string, number> = {};
        slots.forEach(s => {
            if (s) {
                flavorCounts[s.id] = (flavorCounts[s.id] || 0) + 1;
            }
        });

        const flavors = Object.entries(flavorCounts).map(([id, qty]) => ({
            productId: id,
            qty: qty
        }));

        addPack({
            size: packSize as 6 | 12,
            items: flavors,
            displayName: `Pack ${packSize} Sabores`
        });

        // Open cart
        useCartStore.getState().toggleCart(true);
    };

    const filledCount = slots.filter(s => s !== null).length;
    // Simple price logic: Sum of items.
    const totalPrice = slots.reduce((acc, curr) => acc + (curr?.priceCents || 0), 0);

    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* Size Selector */}
            <div className="flex justify-center gap-4">
                {[6, 12].map((size) => (
                    <button
                        key={size}
                        onClick={() => setPackSize(size as 6 | 12)}
                        className={cn(
                            "flex flex-col items-center justify-center h-24 w-32 rounded-xl border-2 transition-all touch-target",
                            packSize === size
                                ? "border-olive bg-olive/10 text-olive"
                                : "border-ink/10 bg-white text-ink/40"
                        )}
                        aria-pressed={packSize === size}
                        aria-label={`Selecionar Pack de ${size} garrafas`}
                    >
                        <span className="text-2xl font-bold font-serif">{size}</span>
                        <span className="text-xs uppercase font-bold tracking-wider">Garrafas</span>
                    </button>
                ))}
            </div>

            {/* The Box */}
            <div className="mx-auto w-full max-w-md rounded-3xl bg-paper2 border-4 border-dashed border-ink/10 p-6 relative">
                <div className="mb-4 flex justify-between text-xs font-bold uppercase tracking-wider text-ink/50">
                    <span>Sua Caixa</span>
                    <span>{filledCount} / {packSize}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {slots.map((slot, idx) => (
                        <PackSlot
                            key={idx}
                            index={idx}
                            product={slot}
                            onRemove={() => removeSlot(idx)}
                            isLastAdded={lastAddedIndex === idx}
                        />
                    ))}
                </div>
            </div>

            {/* Flavor Selection */}
            <div className="space-y-4">
                <h3 className="text-center font-serif text-xl font-bold text-ink">Escolha os Sabores</h3>
                <div className="grid gap-3 px-4 max-w-lg mx-auto w-full">
                    {PRODUCTS.map((product) => (
                        <FlavorDraggable
                            key={product.id}
                            product={product}
                            disabled={filledCount >= packSize}
                            // Mocking availability for now, P2 will hook this to real stock
                            availableQty={99}
                            onAdd={() => addToFirstEmptySlot(product)}
                        />
                    ))}
                </div>
            </div>

            {/* Sticky Summary */}
            <PackSummary
                filledCount={filledCount}
                packSize={packSize}
                totalPriceCents={totalPrice}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
}
