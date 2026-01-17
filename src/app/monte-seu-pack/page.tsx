"use client";

import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { PackBuilder } from "@/components/pack/PackBuilder";

export default function MonteSeuPackPage() {
    return (
        <SiteShell>
            <div className="pb-32 pt-10">
                <div className="text-center mb-12">
                    <p className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-olive mb-4">Experiência</p>
                    <h1 className="font-serif text-[40px] leading-tight text-ink font-bold md:text-[56px] tracking-tight">
                        Monte Seu Pack
                    </h1>
                    <div className="mx-auto mt-6 h-[1px] w-20 bg-ink/30" />
                    <p className="mx-auto mt-6 max-w-2xl text-ink2 text-lg font-serif italic leading-relaxed">
                        Escolha entre caixa de 6 ou 12 unidades e misture seus sabores favoritos.
                    </p>
                </div>

                <PackBuilder />
            </div>
        </SiteShell>
    );
}
