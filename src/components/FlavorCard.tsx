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
            className="group relative flex h-[400px] w-full cursor-pointer flex-col overflow-hidden rounded-[24px] bg-paper shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] touch-manipulation"
            onClick={onOpen}
        >
            {/* 1. Full-Bleed Image Background */}
            <div className="absolute inset-0 z-0 bg-paper2">
                {flavor.imageSrc && (
                    <Image
                        src={flavor.imageSrc}
                        alt={flavor.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                )}
                {/* Subtle Gradient to ensure text readability at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>

            {/* Editorial Frame (Inset) - White/Light for contrast on dark overlay or standard dark on light? 
               Since we have a full image, a white border might look classy. 
            */}
            <div className="absolute inset-[10px] border border-white/20 rounded-[18px] pointer-events-none z-20 transition-colors group-hover:border-white/40" />


            {/* 2. Content Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 flex flex-col items-center text-center">

                {/* Blurred Glass Backdrop for Text */}
                <div className="absolute inset-0 bg-paper/10 backdrop-blur-md border-t border-white/10" />

                <div className="relative z-10 w-full flex flex-col items-center gap-2">
                    <h3 className="font-serif text-2xl md:text-3xl text-paper font-normal leading-tight drop-shadow-md">
                        {flavor.title.replace("\n", " ")}
                    </h3>

                    {/* Decorative Divider */}
                    <div className="h-[2px] w-8 bg-amber/80 rounded-full" />

                    {/* Button - Now ghost-styled to blend */}
                    <button
                        className={cn(
                            "mt-3 inline-flex h-9 items-center rounded-full border border-white/30 bg-white/10 px-6 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-ink hover:border-white",
                        )}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen?.();
                        }}
                    >
                        Ver Detalhes
                    </button>
                </div>
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
