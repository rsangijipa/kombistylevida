import Image from "next/image";
import React from "react";

export function HeroFruitBand() {
    return (
        <div className="absolute top-0 left-0 w-full h-12 md:h-16 z-20 pointer-events-none overflow-hidden">
            <div className="relative w-full h-full max-w-[1920px] mx-auto opacity-90">
                <Image
                    src="/images/hero-fruits.png"
                    alt="Frutas frescas"
                    fill
                    className="object-cover object-top md:object-contain md:object-top"
                    priority
                />
            </div>
            {/* Optional: Gradient Fade to blend with background if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-paper/10 to-transparent" />
        </div>
    );
}
