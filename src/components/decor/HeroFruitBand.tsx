import Image from "next/image";
import React from "react";

export function HeroFruitBand() {
    return (
        <div className="absolute bottom-0 left-0 right-0 h-[120px] md:h-[180px] w-full pointer-events-none z-0 opacity-90 overflow-hidden select-none">
            {/* 
                Use object-cover or object-contain depending on desired fit. 
                object-cover bottom ensures the bottom is aligned.
            */}
            <Image
                src="/images/illustrations/decor/hero-fruit-band.png"
                alt="Frutas tropicais e folhas de chá"
                fill
                className="object-cover object-bottom"
                priority
                quality={90}
            />
            {/* Optional: Gradient Fade to blend with background if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-paper/10 to-transparent" />
        </div>
    );
}
