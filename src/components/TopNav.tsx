"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { CartButton } from "@/components/cart/CartButton";

import { MobileMenu } from "@/components/MobileMenu";

export function TopNav() {
    const pathname = usePathname();

    const items = useMemo(
        () => [
            { path: "/", label: "Home" },
            { path: "/menu", label: "Menu" },
            { path: "/quiz", label: "Quiz" },
            { path: "/monte-seu-pack", label: "Monte Seu Pack" },
            { path: "/como-fazemos", label: "Processo" },
            { path: "/beneficios", label: "Benefícios" },
            { path: "/noticias", label: "Notícias" },
        ],
        []
    );

    return (
        <div className="relative z-20 mx-auto flex max-w-5xl items-center justify-between pt-4 md:pt-6 px-4">

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
                <MobileMenu />
            </div>

            {/* Desktop Nav - Hidden on mobile */}
            <nav className="hidden md:flex flex-wrap items-center justify-center gap-6 text-[16px] font-medium tracking-wide md:gap-8 mx-auto">
                {items.map((it) => {
                    const isActive = pathname === it.path;
                    return (
                        <Link
                            key={it.path}
                            href={it.path}
                            className={cn(
                                "relative font-serif text-ink2 transition-colors duration-300 hover:text-ink",
                                // Linha fina base
                                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-ink2/30 after:transition-all after:duration-300",
                                // Hover visuals
                                "hover:after:bg-ink/60 hover:after:h-[1.5px]",
                                // Active state
                                isActive && "text-ink font-semibold"
                            )}
                        >
                            {/* Highlighter visual for active state */}
                            <span className={cn("relative z-10 px-1", isActive && "vintage-highlight")}>{it.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Cart Button Integrated */}
            <div className="flex-shrink-0 md:absolute md:right-0 md:top-6">
                <CartButton />
            </div>
        </div>
    );
}
