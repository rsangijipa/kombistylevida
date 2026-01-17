import Image from "next/image";
import React from "react";
import { cn } from "@/lib/cn";

export type Flavor = {
    title: string;
    imageSrc?: string;
    longDesc?: string;
    ingredients?: string[];
    pairings?: string[];
};

export function FlavorCard({
    flavor,
    onOpen,
}: {
    flavor: Flavor;
    onOpen?: () => void;
}) {
    return (
        <article
            className="group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl bg-paper transition-all duration-700 hover:-translate-y-2 hover:shadow-paper"
            onClick={onOpen}
        >
            {/* 
         Editorial Frame: Subtle single line, inset.
      */}
            <div className="absolute inset-[12px] border border-ink/10 pointer-events-none z-20 rounded-lg transition-colors group-hover:border-ink/20" />

            {/* Conteúdo */}
            <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-12 pb-10 text-center">

                {/* Imagem */}
                <div className="relative w-48 aspect-square mb-8 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-105">
                    {flavor.imageSrc && (
                        <Image
                            src={flavor.imageSrc}
                            alt={flavor.title}
                            fill
                            className="object-contain drop-shadow-sm"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    )}
                </div>

                {/* Título */}
                <div className="flex-1 flex flex-col items-center justify-start">
                    <h3 className="font-serif text-3xl text-ink font-normal leading-tight">
                        {flavor.title.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {i < flavor.title.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h3>
                    {/* Decorative Flourish */}
                    <div className="mt-4 opacity-40 text-amber">
                        <Flourish className="w-16 h-4" />
                    </div>
                </div>

                {/* Botão (Hidden by default on desktop, visible on mobile?) 
                    User request: "No hover desktop, opacity 0 -> 1. Mobile static."
                */}
                <div className="mt-8 opacity-100 md:opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                        className={cn(
                            "inline-flex h-10 items-center rounded-full border border-ink/20 bg-transparent px-6 text-xs font-bold uppercase tracking-widest text-ink transition-all hover:bg-ink hover:text-paper hover:border-transparent",
                        )}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen?.();
                        }}
                    >
                        Ver Sabor
                    </button>
                </div>
            </div>

            {/* Background Texture is handled by global body, but we can add a subtle tint here */}
            <div className="absolute inset-0 bg-white/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>
        </article>
    );
}

function Flourish({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 20" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
            <path
                d="M50 15 C 30 15, 20 5, 0 10"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.8"
            />
            <path
                d="M50 15 C 70 15, 80 5, 100 10"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.8"
            />
            <circle cx="50" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
        </svg>
    );
}
