"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/cn";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
    productId: string;
    className?: string;
}

export function AddToCartButton({ productId, className }: AddToCartButtonProps) {
    const addItem = useCartStore(s => s.addItem);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addItem(productId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <button
            onClick={handleAdd}
            className={cn(
                "flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-widest transition-all shadow-md active:scale-95",
                added
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-olive text-paper hover:bg-olive/90 hover:-translate-y-0.5",
                className
            )}
        >
            <ShoppingBag size={18} />
            {added ? "Adicionado!" : "Adicionar à Sacola"}
        </button>
    );
}
