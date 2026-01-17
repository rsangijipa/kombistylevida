"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { FlavorCard } from "@/components/FlavorCard";
import { Faq } from "@/components/Faq";
import { ScientificSection } from "@/components/ScientificSection";
import { FlavorModal } from "@/components/FlavorModal";
import { CulturaVivaSection } from "@/components/CulturaVivaSection";
import { FLAVORS, FlavorDetails } from "@/data/flavors";

// Minimal data for Home (Top items)
const flavors: FlavorDetails[] = FLAVORS;

export default function Page() {
    const [selectedFlavor, setSelectedFlavor] = useState<FlavorDetails | null>(null);

    return (
        <SiteShell>
            {/* HERO SECTION */}
            <div className="relative mb-20 text-center md:mb-32">
                <div className="mx-auto max-w-2xl px-4 pt-10 md:pt-16">
                    <div className="relative mx-auto mb-6 h-[156px] w-[364px] md:h-[234px] md:w-[546px]">
                        <Image
                            src="/images/logo.png"
                            alt="Kombistyle Vida"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <p className="mx-auto mt-8 max-w-lg font-serif text-lg leading-relaxed text-ink2 md:text-xl">
                        Bebida fermentada naturalmente, feita com paciência e ingredientes de verdade.
                        Um brinde à sua saúde.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 min-[450px]:flex-row">
                        <a
                            href="https://wa.me/5548999999999" // TODO: config
                            className="inline-flex h-12 items-center justify-center rounded-full bg-amber px-8 text-sm font-bold uppercase tracking-widest text-ink shadow-paper transition-all hover:-translate-y-0.5 hover:bg-amber2 hover:shadow-lg"
                        >
                            Pedir no WhatsApp
                        </a>
                        <span className="text-xs font-bold uppercase tracking-widest text-ink/40">
                            Entrega em Florianópolis
                        </span>
                    </div>
                </div>
            </div>

            {/* SABORES SECTION */}
            <section id="sabores" className="relative z-10 mx-auto mb-24 max-w-6xl px-4">
                <div className="mb-14 text-center">
                    <h2 className="font-serif text-3xl font-bold text-ink md:text-5xl">Nossos Sabores</h2>
                    <div className="mx-auto mt-6 h-px w-20 bg-ink/20" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
                    {flavors.map((flavor) => (
                        <FlavorCard
                            key={flavor.id}
                            flavor={flavor}
                            onOpen={() => setSelectedFlavor(flavor)}
                        />
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/menu" className="inline-block border-b border-ink/30 pb-1 font-serif text-lg italic text-ink transition-colors hover:border-ink hover:text-olive">
                        Ver cardápio completo →
                    </Link>
                </div>
            </section>

            {/* CULTURA VIVA */}
            <CulturaVivaSection />

            {/* CIÊNCIA / POR QUE BEBER */}
            <div className="my-20">
                <ScientificSection />
            </div>

            {/* FAQ */}
            <div className="mx-auto max-w-2xl px-4 py-12">
                <h2 className="mb-10 text-center font-serif text-3xl font-bold text-ink">Perguntas Frequentes</h2>
                <Faq />
            </div>

            {/* MODALS */}
            {selectedFlavor && (
                <FlavorModal
                    isOpen={!!selectedFlavor}
                    onClose={() => setSelectedFlavor(null)}
                    flavor={selectedFlavor}
                />
            )}
        </SiteShell>
    );
}
