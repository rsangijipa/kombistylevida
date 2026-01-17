import Image from "next/image";
import React from "react";

type Feature = {
    title: string;
    desc: string;
    iconSrc?: string;
};

export function CultureFeature({ feature }: { feature: Feature }) {
    return (
        <article className="text-center">
            <div className="mx-auto flex h-[78px] w-[96px] items-center justify-center">
                {feature.iconSrc ? (
                    <Image
                        src={feature.iconSrc}
                        alt={feature.title}
                        width={96}
                        height={78}
                        className="object-contain"
                    />
                ) : (
                    <FallbackIcon />
                )}
            </div>

            <h3 className="mt-2 font-serif text-[18px] font-semibold text-ink">
                {feature.title}
            </h3>
            <p className="mx-auto mt-1 max-w-[260px] text-[14px] text-ink2/80">
                {feature.desc}
            </p>
        </article>
    );
}

function FallbackIcon() {
    return (
        <svg viewBox="0 0 120 90" fill="none" aria-hidden>
            <rect x="36" y="18" width="48" height="50" rx="12" fill="rgba(236,188,117,.35)" stroke="rgba(50,41,24,.35)" strokeWidth="2" />
            <path d="M46 18c2-8 26-8 28 0" stroke="rgba(50,41,24,.45)" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 48c10-6 10-18 0-24" stroke="rgba(50,41,24,.25)" strokeWidth="2" strokeLinecap="round" />
            <path d="M96 48c-10-6-10-18 0-24" stroke="rgba(50,41,24,.25)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
