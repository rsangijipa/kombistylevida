"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export type FlavorDetails = {
    id?: string;
    title: string;
    imageSrc?: string;
    longDesc?: string;
    ingredients?: string[];
    pairings?: string[]; // Harmonização
};

interface FlavorModalProps {
    isOpen: boolean;
    onClose: () => void;
    flavor: FlavorDetails | null;
}

export function FlavorModal({ isOpen, onClose, flavor }: FlavorModalProps) {
    const { addItem } = useCartStore();
    const [btnText, setBtnText] = useState("Adicionar ao Carrinho");

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    const handleAddToCart = () => {
        if (!flavor?.id) return;
        addItem(flavor.id);
        setBtnText("Adicionado!");
        setTimeout(() => {
            onClose();
        }, 600);
    };

    if (!isOpen || !flavor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-3xl overflow-hidden rounded-[24px] bg-paper shadow-paper animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-paper2 p-2 text-ink/60 hover:bg-amber/20 hover:text-ink transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left: Image Side */}
                    <div className="relative flex h-[250px] w-full items-center justify-center bg-paper2 md:h-auto md:w-5/12">
                        {/* Texture overlay on image side too */}
                        <div className="absolute inset-0 opacity-20 mix-blend-multiply bg-[url('/images/paper-texture.png')] bg-repeat" />

                        <div className="relative h-[200px] w-[200px] md:h-[280px] md:w-[280px]">
                            {flavor.imageSrc && (
                                <Image
                                    src={flavor.imageSrc}
                                    alt={flavor.title}
                                    fill
                                    className="object-contain drop-shadow-xl"
                                    sizes="(max-width: 768px) 50vw, 300px"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right: Info Side */}
                    <div className="flex-1 p-8 md:p-10">
                        <h3 className="mb-2 font-serif text-[32px] md:text-[40px] font-bold leading-tight text-olive">
                            {flavor.title.replace("\n", " ")}
                        </h3>

                        <div className="mb-6 h-[2px] w-16 bg-amber rounded-full" />

                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink/50">
                                    O Sabor
                                </h4>
                                <p className="font-serif text-[18px] leading-relaxed text-ink2">
                                    {flavor.longDesc || "Uma combinação equilibrada e refrescante, perfeita para qualquer momento do dia."}
                                </p>
                            </div>

                            {flavor.ingredients && (
                                <div>
                                    <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink/50">
                                        Ingredientes
                                    </h4>
                                    <p className="text-[15px] text-ink2/80">
                                        {flavor.ingredients.join(" • ")}
                                    </p>
                                </div>
                            )}

                            {flavor.pairings && (
                                <div>
                                    <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink/50">
                                        Harmoniza com
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {flavor.pairings.map(p => (
                                            <span key={p} className="inline-block rounded-full border border-ink/10 bg-paper2 px-3 py-1 text-[13px] font-medium text-ink">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    className={cn(
                                        "inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-bold uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5 md:w-auto md:px-8",
                                        btnText === "Adicionado!" ? "bg-green-100 text-green-800 border-green-200" : "bg-olive text-paper hover:bg-olive/90"
                                    )}
                                >
                                    <ShoppingBag size={18} />
                                    <span>{btnText}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
