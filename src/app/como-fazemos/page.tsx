"use client";

import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import Image from "next/image";

export default function ComoFazemosPage() {
    return (
        <SiteShell>
            {/* Header - Full Bleed */}
            <div className="relative mb-12 md:mb-16 py-16 md:py-20 text-center -mx-6 md:-mx-12 rounded-t-[32px] md:rounded-t-[48px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/process/header_bg.jpg"
                        alt="Background Texture"
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper to-transparent" />
                </div>

                <div className="relative z-10 px-6">
                    <h1 className="font-serif text-[40px] leading-tight text-ink font-bold md:text-[56px] tracking-tight drop-shadow-sm">
                        Nossa Alquimia
                    </h1>
                    <div className="mx-auto mt-6 h-[1px] w-20 bg-ink/30" />
                    <p className="mx-auto mt-6 max-w-2xl text-ink2 text-lg font-serif italic leading-relaxed font-medium">
                        Não fabricamos refrigerante. Cultivamos vida. <br className="hidden md:block" />
                        Entenda como transformamos chá doce em saúde.
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <ProcessTimeline />

            {/* Bottom Note */}
            <div className="mt-12 text-center bg-paper2 p-6 md:p-8 rounded-2xl border border-ink/10 max-w-4xl mx-auto relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8 z-10 relative">
                    <div className="relative w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                        <Image
                            src="/images/illustrations/process/tempo-fermentacao.png"
                            alt="Ampulheta do tempo"
                            fill
                            className="object-contain opacity-80"
                        />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-serif text-2xl font-bold text-ink mb-4 text-center md:text-left">Por que demora?</h3>
                        <p className="font-serif text-ink2 leading-relaxed">
                            Respeitamos o tempo da natureza. Nossa fermentação não é acelerada artificialmente.
                            Cada lote leva cerca de 20 dias para ficar pronto, garantindo o máximo de probióticos e sabor real.
                        </p>
                    </div>
                </div>
                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-paper opacity-50 mix-blend-multiply pointer-events-none z-0" />
            </div>
        </SiteShell>
    );
}
