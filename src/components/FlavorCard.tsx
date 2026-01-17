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
            className="group relative flex min-h-[400px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[2px] bg-paper2 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
            onClick={onOpen}
        >
            {/* 
         1. Borda Dupla Externa (Vintage Label Style)
         - Outer: 1px ink/35 border
         - Inner: 2px ink/20 border (inset)
      */}
            <div className="absolute inset-0 border border-ink/35 pointer-events-none z-20" />
            <div className="absolute inset-[6px] border-[2px] border-ink/20 pointer-events-none z-20" />

            {/* Conteúdo */}
            <div className="relative z-10 flex flex-1 flex-col items-center p-8 text-center pt-10 pb-8">
                {/* Imagem Grande e Natural */}
                <div className="relative w-full aspect-square mb-6 flex items-center justify-center p-4">
                    {flavor.imageSrc && (
                        <Image
                            src={flavor.imageSrc}
                            alt={flavor.title}
                            fill
                            className="object-contain drop-shadow-sm transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    )}
                </div>

                {/* Título Serifado */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[80px]">
                    <h3 className="font-serif text-[26px] font-semibold leading-[1.1] text-ink tracking-tight">
                        {flavor.title.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {i < flavor.title.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h3>
                    <div className="mt-3 h-[1px] w-12 bg-ink/20" />
                </div>

                {/* Botão Pílula Style */}
                <div className="mt-6">
                    <button
                        className={cn(
                            "inline-flex h-[48px] items-center rounded-full border border-ink/60 bg-amber px-8 text-[14px] font-bold uppercase tracking-wider text-ink shadow-print transition-all hover:bg-amber2 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
                        )}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen?.();
                        }}
                    >
                        Ver detalhes
                    </button>
                </div>
            </div>

            {/* Vintage Background Texture (Subtle) */}
            <div className="absolute inset-0 bg-paper opacity-40 mix-blend-multiply pointer-events-none z-0"></div>
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
