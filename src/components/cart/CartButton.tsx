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

    const totalQty = items.reduce((acc, i) => acc + i.qty, 0);

    if (!mounted) return null;

    return (
        <button
            onClick={() => toggleCart(true)}
            className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full bg-paper2 text-ink transition-all hover:bg-amber/20 hover:text-olive",
                className
            )}
        >
            <ShoppingBag size={20} />
            {totalQty > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber px-1 text-[11px] font-bold text-ink shadow-sm border border-paper">
                    {totalQty}
                </span>
            )}
        </button>
    );
}
