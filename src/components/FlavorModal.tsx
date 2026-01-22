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
    variants?: { size: string; price: number }[];
};

interface FlavorModalProps {
    isOpen: boolean;
    onClose: () => void;
    flavor: FlavorDetails | null;
}

import { createPortal } from "react-dom";

export function FlavorModal({ isOpen, onClose, flavor }: FlavorModalProps) {
    const { addItem } = useCartStore();
    const [btnText, setBtnText] = useState("Adicionar ao Carrinho");
    const [selectedSize, setSelectedSize] = useState<"300ml" | "500ml">("300ml");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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
            setBtnText("Adicionar ao Carrinho");
        }, 600);
    };

    if (!isOpen || !flavor) return null;
    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Centering Wrapper */}
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Modal Content - Adaptive Card */}
                <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] md:rounded-[24px] bg-paper shadow-2xl animate-in zoom-in-95 duration-300 h-[85vh] md:h-auto flex flex-col md:block z-[100]">

                    {/* Close Button - Floats on top of everything */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-50 rounded-full bg-black/20 md:bg-paper2 backdrop-blur-md p-2 text-white md:text-ink hover:bg-white/20 transition-colors shadow-sm"
                    >
                        <X size={24} />
                    </button>

                    {/* MOBILE LAYOUT: Split View (Fixed Image Top, Scrollable Content Bottom) */}
                    <div className="md:hidden flex flex-col h-full relative">

                        {/* 1. Fixed Top Image Area (40% height) */}
                        <div className="absolute top-0 left-0 right-0 h-[45%] z-0">
                            {flavor.imageSrc && (
                                <Image
                                    src={flavor.imageSrc}
                                    alt={flavor.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            )}
                            {/* Gradient to smooth transition to white card */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent" />
                        </div>

                        {/* 2. Scrollable Content Area (Overlaps image) */}
                        <div className="flex-1 overflow-y-auto z-10 relative scrollbar-hide">
                            {/* Spacer to reveal top image */}
                            <div className="h-[38vh] w-full bg-transparent pointer-events-none" />

                            {/* Solid Content Card */}
                            <div className="bg-paper rounded-t-[32px] px-6 pt-8 pb-48 min-h-[60vh] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                                {/* Decorative Handler/Indicator */}
                                <div className="w-12 h-1.5 bg-ink/10 rounded-full mx-auto mb-6" />

                                <h3 className="mb-2 font-serif text-3xl font-bold leading-tight text-olive">
                                    {flavor.title.replace("\n", " ")}
                                </h3>

                                <div className="mb-6 h-[3px] w-12 bg-amber rounded-full" />

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/60">
                                            O Sabor
                                        </h4>
                                        <p className="font-serif text-[17px] leading-relaxed text-ink2">
                                            {flavor.longDesc || "Uma combinação equilibrada e refrescante."}
                                        </p>
                                    </div>

                                    {flavor.ingredients && (
                                        <div>
                                            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/60">
                                                Ingredientes
                                            </h4>
                                            <p className="text-sm text-ink2/80 leading-relaxed">
                                                {flavor.ingredients.join(" • ")}
                                            </p>
                                        </div>
                                    )}

                                    {flavor.pairings && (
                                        <div>
                                            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/60">
                                                Harmoniza com
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {flavor.pairings.map(p => (
                                                    <span key={p} className="inline-block rounded-full border border-ink/10 bg-paper2 px-3 py-1 text-[12px] font-medium text-ink">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP LAYOUT (Original) */}
                    <div className="hidden md:flex flex-row h-auto overflow-hidden">

                        {/* Desktop Left: Image Side (Expanded to 50%) */}
                        <div className="relative flex-shrink-0 w-1/2 items-center justify-center bg-paper2 min-h-[600px]">
                            <div className="absolute inset-0 opacity-20 mix-blend-multiply bg-[url('/images/paper-texture.png')] bg-repeat" />
                            <div className="relative w-full h-full p-12">
                                {flavor.imageSrc && (
                                    <Image
                                        src={flavor.imageSrc}
                                        alt={flavor.title}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        sizes="600px"
                                        priority
                                    />
                                )}
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="flex-1 p-10 flex flex-col">
                            <h3 className="mb-2 font-serif text-[40px] font-bold leading-tight text-olive drop-shadow-sm">
                                {flavor.title.replace("\n", " ")}
                            </h3>

                            <div className="mb-6 h-[3px] w-16 bg-amber rounded-full" />

                            <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-thin">
                                <div>
                                    <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink/60">
                                        O Sabor
                                    </h4>
                                    <p className="font-serif text-[18px] leading-relaxed text-ink2 text-justify">
                                        {flavor.longDesc}
                                    </p>
                                </div>

                                {flavor.ingredients && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink/60">
                                            Ingredientes
                                        </h4>
                                        <p className="text-[15px] text-ink2/80">
                                            {flavor.ingredients.join(" • ")}
                                        </p>
                                    </div>
                                )}

                                {flavor.pairings && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink/60">
                                            Harmoniza com
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {flavor.pairings.map(p => (
                                                <span key={p} className="inline-block rounded-full border border-ink/10 bg-paper2 px-3 py-1 text-[13px] font-medium text-ink shadow-sm">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Bottom Actions on Mobile (Inside Modal Wrapper but Fixed relative to it) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-paper/90 backdrop-blur-md border-t border-ink/5 md:relative md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:border-t-0 md:backdrop-blur-none z-20 space-y-3 pt-3 md:space-y-4 md:px-10 md:pb-10">

                        {/* Size Selector */}
                        <div className="flex bg-paper2/50 rounded-lg p-1 border border-ink/10 w-full md:w-fit">
                            {(["300ml", "500ml"] as const).map((size) => {
                                const variant = flavor.variants?.find(v => v.size === size);
                                const price = variant ? `R$ ${variant.price.toFixed(2).replace('.', ',')}` : "";
                                const isSelected = selectedSize === size;

                                return (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={cn(
                                            "flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 rounded-md text-xs md:text-sm font-bold uppercase tracking-wider transition-all",
                                            isSelected
                                                ? "bg-white text-olive shadow-sm"
                                                : "text-ink/40 hover:text-ink/70"
                                        )}
                                    >
                                        <div className="leading-none mb-1">{size}</div>
                                        <div className="text-[10px] opacity-70">{price}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => {
                                if (!flavor?.id) return;
                                const variantId = `${flavor.id}::${selectedSize.replace("ml", "")}`;
                                addItem(variantId);
                                setBtnText("Adicionado!");
                                setTimeout(() => {
                                    onClose();
                                    setBtnText("Adicionar ao Carrinho");
                                }, 600);
                            }}
                            className={cn(
                                "inline-flex w-full items-center justify-center gap-2 rounded-full py-3 md:py-4 text-sm md:text-[15px] font-bold uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5 md:w-auto md:px-8 bg-olive text-paper hover:bg-olive/90",
                                btnText === "Adicionado!" && "bg-green-100 text-green-800 border-green-200"
                            )}
                        >
                            <ShoppingBag size={18} />
                            <span>{btnText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
