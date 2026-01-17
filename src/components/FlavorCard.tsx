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
            className="group relative flex min-h-[380px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[22px] bg-paper2 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
            onClick={onOpen}
        >
            {/* 
         1. Borda Dupla Externa (Consistent spacing) 
         - Outer: border-ink/40
         - Inner: border-ink/20
      */}
            <div className="absolute inset-0 rounded-[22px] border border-ink/40" />
            <div className="absolute inset-[5px] rounded-[17px] border border-ink/20" />

            {/* Conteúdo */}
            <div className="relative z-10 flex flex-1 flex-col items-center p-6 text-center">
                {/* Título com quebra de linha manual */}
                <h3 className="min-h-[54px] font-serif text-[20px] font-semibold leading-[1.15] text-ink tracking-tight">
                    {flavor.title.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i < flavor.title.split('\n').length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </h3>

                {/* 
            Imagens Grandes e Naturais
            - height: ~50% of card
            - object-contain
        */}
                <div className="relative flex-1 w-full flex items-center justify-center my-4">
                    <div className="relative h-[180px] w-full">
                        {flavor.imageSrc && (
                            <Image
                                src={flavor.imageSrc}
                                alt={flavor.title}
                                fill
                                className="object-contain drop-shadow-sm transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                        )}
                    </div>
                </div>

                {/* Flourish decorativo sob a imagem */}
                <Flourish className="mb-5 h-3 w-16 text-ink/30" />

                {/* Botão Pílula Style */}
                <button
                    className={cn(
                        "inline-flex h-[36px] items-center rounded-full border border-ink/60 bg-amber px-6 text-[13px] font-bold uppercase tracking-wider text-ink shadow-print transition-all group-hover:bg-amber2 group-hover:shadow-md",
                    )}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); // Avoid double click if Article also has handler
                        onOpen?.();
                    }}
                >
                    Ver detalhes
                </button>
            </div>
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
