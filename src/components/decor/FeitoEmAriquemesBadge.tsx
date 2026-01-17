import Image from "next/image";
import React from "react";

export function FeitoEmAriquemesBadge() {
    return (
        <div className="relative h-[100px] w-[100px] md:h-[120px] md:w-[120px] opacity-90 rotate-[-1deg] select-none pointer-events-none mx-auto mt-6">
            <Image
                src="/images/decor/feito-em-ariquemes.jpg"
                alt="Feito em Ariquemes - Rondônia"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 768px) 100px, 120px"
            />
        </div>
    );
}
