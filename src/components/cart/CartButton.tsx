"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/cn";

export function CartButton({ className }: { className?: string }) {
    const { toggleCart, items } = useCartStore();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

    if (!mounted) return null;

    return (
        <button
            onClick={() => toggleCart(true)}
            className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-full bg-olive text-white shadow-xl transition-all hover:bg-olive/90 hover:scale-110 active:scale-95",
                className
            )}
        >
            <ShoppingBag size={24} />
            {totalQty > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-amber px-1 text-xs font-bold text-ink shadow-md border-2 border-paper">
                    {totalQty}
                </span>
            )}
        </button>
    );
}
