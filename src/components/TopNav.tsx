"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { CartButton } from "@/components/cart/CartButton";

import { MobileMenu } from "@/components/MobileMenu";

export function TopNav() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        // Initial check
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const items = useMemo(
        () => [
            { path: "/", label: "Home" },
            { path: "/menu", label: "Menu" },
            { path: "/quiz", label: "Quiz" },
            { path: "/monte-seu-pack", label: "Monte Seu Pack" },
            { path: "/receitas", label: "Receitas" },
            { path: "/como-fazemos", label: "Processo" },
            { path: "/beneficios", label: "Benefícios" },
            { path: "/noticias", label: "Notícias" },
        ],
        []
    );

    return (
        /* Nav Wrapper - Sticky Top with z-index above everything */
        <header className="sticky top-0 z-[100] w-full flex justify-center items-center pointer-events-none mb-6 pt-4">
            <div className="pointer-events-auto relative w-full flex justify-center px-4">

                <div className="absolute left-4 top-0 md:hidden pointer-events-auto">
                    <MobileMenu />
                </div>

                {/* Desktop Nav - Dynamic Pill */}
                <nav
                    className={cn(
                        "hidden md:flex flex-wrap items-center justify-center gap-6 mx-auto rounded-full border transition-all duration-500",
                        // Typography
                        "text-[16px] font-medium tracking-wide font-serif",
                        // Default State (Transparent-ish)
                        !scrolled && "bg-paper/60 backdrop-blur-[4px] border-ink/5 shadow-sm px-8 py-3",
                        // Scrolled State (Solid/Glass + Shadow)
                        scrolled && "bg-paper/90 backdrop-blur-md border-ink/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-10 py-3 translate-y-[-2px]"
                    )}
                >
                    {items.map((it) => {
                        const isActive = pathname === it.path;
                        return (
                            <Link
                                key={it.path}
                                href={it.path}
                                className={cn(
                                    "relative transition-colors duration-300 hover:text-ink",
                                    isActive ? "text-ink font-semibold" : "text-ink2/80"
                                )}
                            >
                                <span className={cn("relative z-10 px-1", isActive && "vintage-highlight")}>
                                    {it.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Cart Button - Independent positioning */}
                <div className="absolute right-4 top-0 pointer-events-auto">
                    <CartButton />
                </div>
            </div>
        </header>
    );
}
