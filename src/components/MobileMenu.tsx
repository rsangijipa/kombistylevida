"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
    { path: "/", label: "Home" },
    { path: "/menu", label: "Menu" },
    { path: "/quiz", label: "Quiz" },
    { path: "/monte-seu-pack", label: "Monte Seu Pack" },
    { path: "/receitas", label: "Receitas" },
    { path: "/como-fazemos", label: "Processo" },
    { path: "/beneficios", label: "Benefícios" },
    { path: "/noticias", label: "Notícias" },
];

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-ink/10 text-ink shadow-sm transition-all active:scale-95 touch-target"
                aria-label="Abrir menu"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] bg-paper2/95 backdrop-blur-md transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header with Close Button */}
                <div className="flex items-center justify-between p-6 border-b border-ink/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Menu</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-ink/10 text-ink shadow-sm transition-all active:scale-95 touch-target"
                        aria-label="Fechar menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Nav Items */}
                <nav className="flex-1 overflow-y-auto py-8 px-6 flex flex-col items-center gap-6">
                    {NAV_ITEMS.map((item, idx) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "font-serif text-2xl md:text-3xl font-medium transition-all duration-200 w-full text-center py-2",
                                    isActive
                                        ? "text-olive scale-105"
                                        : "text-ink/70 hover:text-ink hover:scale-105"
                                )}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Decor */}
                <div className="p-8 text-center border-t border-ink/5 bg-paper/50">
                    <p className="text-sm font-serif italic text-ink/40">Kombucha Viva & Autêntica</p>
                </div>
            </div>
        </div>
    );
}
