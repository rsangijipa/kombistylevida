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

import { HeroFruitBand } from "@/components/decor/HeroFruitBand";

export default function Page() {
    const [selectedFlavor, setSelectedFlavor] = useState<FlavorDetails | null>(null);

    return (
        <SiteShell>
            {/* HERO SECTION */}
            <div className="relative mb-24 text-center md:mb-40 overflow-hidden pb-16"> {/* Increased margins */}
                <div className="mx-auto max-w-2xl px-6 pt-12 md:pt-20 relative z-10">
                    {/* Logo: Smaller on mobile for balance */}
                    <div className="relative mx-auto mb-8 h-[120px] w-[280px] md:h-[234px] md:w-[546px] transition-all duration-700 ease-out animate-in fade-in zoom-in-95">
                        <Image
                            src="/images/logo.png"
                            alt="Kombistyle Vida"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Slogan: Editorial Serif */}
                    <p className="mx-auto mt-10 max-w-lg font-serif text-xl leading-relaxed text-ink md:text-2xl animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-150">
                        Estilo e sabor em cada gole. <br className="hidden md:block" />
                        <span className="text-ink2/80 text-lg md:text-xl">Fermentação natural, ingredientes reais.</span>
                    </p>

                    {/* CTA Section */}
                    <div className="mt-12 flex flex-col items-center justify-center gap-6 min-[450px]:flex-row animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
                        <a
                            href="https://wa.me/5548999999999"
                            className="inline-flex h-14 items-center justify-center rounded-full bg-amber px-10 text-sm font-bold uppercase tracking-widest text-ink shadow-paper transition-all hover:-translate-y-1 hover:bg-amber2 hover:shadow-xl active:scale-95"
                        >
                            Pedir no WhatsApp
                        </a>
                        <span className="text-xs font-bold uppercase tracking-widest text-ink/40">
                            Entrega em Florianópolis
                        </span>
                    </div>
                </div>

                {/* Decorative Fruit Band */}
                <HeroFruitBand />
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
