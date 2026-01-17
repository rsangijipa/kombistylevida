"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
    { path: "/", label: "Home" },
    { path: "/menu", label: "Menu" },
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
                className="flex items-center justify-center p-2 text-ink hover:bg-ink/5 rounded-full transition-colors"
                aria-label="Abrir menu"
            >
                <Menu size={28} />
            </button>

            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-paper2 transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-end p-6">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center p-2 text-ink hover:bg-ink/5 rounded-full transition-colors"
                        aria-label="Fechar menu"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Links */}
                <nav className="flex flex-col items-center justify-center gap-8 p-8 mt-10">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "font-serif text-3xl font-medium transition-colors active:scale-95",
                                    isActive ? "text-olive font-bold" : "text-ink/80 hover:text-ink"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Decor */}
                <div className="absolute bottom-10 left-0 right-0 text-center">
                    <p className="text-sm font-serif italic text-ink/40">Kombucha Viva & Autêntica</p>
                </div>
            </div>
        </div>
    );
}
