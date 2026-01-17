import Image from "next/image";
import React from "react";
import { cn } from "@/lib/cn";

type Flavor = {
    title: string;
    subtitle?: string;
    imageSrc?: string;
};

export function FlavorCard({
    flavor,
    variant = "clean",
}: {
    flavor: Flavor;
    variant?: "home" | "clean";
}) {
    const showSubtitle = variant === "home" && flavor.subtitle;

    return (
        <article className="group relative rounded-[18px] bg-paper2/70 shadow-print">
            {/* borda dupla */}
            <div className="rounded-[18px] border border-ink/55 p-3">
                <div className="rounded-[14px] border border-ink/30 p-4 text-center">
                    <h3 className="font-serif text-[18px] font-semibold leading-tight text-ink">
                        {flavor.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-center">
                        <div className="relative h-[108px] w-[140px]">
                            {flavor.imageSrc ? (
                                <Image
                                    src={flavor.imageSrc}
                                    alt={flavor.title}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <FallbackIllustration />
                            )}
                        </div>
                    </div>

                    {/* flourish (variação clean) */}
                    {variant === "clean" && <Flourish className="mx-auto mt-2 h-4 w-16 opacity-70" />}

                    {/* subtítulo (variação home) */}
                    {showSubtitle && (
                        <p className="mt-2 text-[14px] text-ink2/85">{flavor.subtitle}</p>
                    )}

                    <button
                        className={cn(
                            "mt-3 inline-flex items-center justify-center rounded-full border border-ink/60",
                            "bg-amber px-4 py-2 text-[14px] font-medium text-ink shadow-print",
                            "transition group-hover:brightness-[1.02]"
                        )}
                        type="button"
                    >
                        Ver detalhes
                    </button>
                </div>
            </div>
        </article>
    );
}

function Flourish({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 120 24" fill="none" aria-hidden>
            <path
                d="M10 12c14-10 26-10 40 0 14 10 26 10 40 0"
                stroke="rgba(50,41,24,.55)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M60 12c4-6 10-6 14 0-4 6-10 6-14 0Z"
                fill="rgba(50,41,24,.25)"
                stroke="rgba(50,41,24,.4)"
            />
        </svg>
    );
}

function FallbackIllustration() {
    return (
        <svg viewBox="0 0 180 140" fill="none" aria-hidden>
            <path d="M20 110c25-35 50-52 80-52s55 17 80 52" stroke="rgba(50,41,24,.35)" strokeWidth="3" />
            <circle cx="70" cy="70" r="24" fill="rgba(236,188,117,.45)" stroke="rgba(50,41,24,.35)" strokeWidth="2" />
            <circle cx="110" cy="72" r="18" fill="rgba(124,118,68,.35)" stroke="rgba(50,41,24,.35)" strokeWidth="2" />
            <circle cx="126" cy="56" r="10" fill="rgba(138,68,65,.35)" stroke="rgba(50,41,24,.35)" strokeWidth="2" />
        </svg>
    );
}
