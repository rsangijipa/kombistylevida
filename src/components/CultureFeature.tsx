import Image from "next/image";
import React from "react";

type Feature = {
    title: string;
    desc: string;
    iconSrc?: string;
};

export function CultureFeature({ feature }: { feature: Feature }) {
    return (
        <article className="relative flex flex-col items-center text-center">
            {/* 
        Background Arabesque 
        - "Hugging" the icon
        - Very low opacity (0.15-0.25)
      */}
            <div className="absolute top-[10px] -z-10 h-28 w-28 translate-y-[-10%] opacity-[0.12] text-ink">
                <IconArabesque />
            </div>

            <div className="relative mb-5 flex h-[100px] w-[120px] items-center justify-center">
                {feature.iconSrc && (
                    <Image
                        src={feature.iconSrc}
                        alt={feature.title}
                        fill
                        className="object-contain"
                        sizes="120px"
                    />
                )}
            </div>

            <h3 className="mb-3 font-serif text-[22px] font-semibold text-ink leading-tight">
                {feature.title.replace('\n', ' ')}
            </h3>
            <p className="max-w-[260px] text-[16px] leading-relaxed text-ink2/90 font-serif">
                {feature.desc}
            </p>
        </article>
    );
}

function IconArabesque() {
    return (
        <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C 10 25, 0 50, 50 100 C 100 50, 90 25, 50 0" opacity="0.5" />
            <path d="M50 10 L 20 50 L 50 90 L 80 50 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
        </svg>
    )
}
