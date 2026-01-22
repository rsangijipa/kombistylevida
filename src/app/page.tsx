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
            {/* Edge-to-Edge: No negative top margin needed since SiteShell has pt-0 */}
            <div className="relative -mx-4 md:-mx-12 mb-8 text-center md:mb-16 overflow-hidden pb-8 rounded-t-[32px] md:rounded-t-[48px]">

                {/* Custom Hero Background */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/home-hero-bg.jpg"
                        alt="Hero Background"
                        fill
                        className="object-cover opacity-100" // Increased opacity for immersion
                        priority
                    />
                    {/* Scrim for readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-paper2/10 via-paper2/20 to-paper2/95" />
                    <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_0%,_rgba(0,0,0,0.1)_100%]" />
                </div>

                <div className="mx-auto max-w-4xl px-4 pt-24 md:pt-40 relative z-10 flex flex-col items-center">
                    {/* Logo: Significantly Increased Size */}
                    <div className="relative mb-8 h-[160px] w-[300px] md:h-[400px] md:w-[860px] transition-all duration-700 ease-out animate-in fade-in zoom-in-95">
                        <Image
                            src="/images/logo.png"
                            alt="Kombucha Arikê"
                            fill
                            className="object-contain drop-shadow-lg"
                            priority
                        />
                    </div>

                    {/* Slogan: Editorial Serif */}
                    <p className="max-w-xl font-serif text-2xl leading-relaxed text-ink md:text-3xl animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-150 drop-shadow-sm font-medium">
                        Estilo e sabor em cada gole. <br className="hidden md:block" />
                        <span className="text-ink2 text-lg md:text-2xl mt-2 block">Fermentação natural, ingredientes reais.</span>
                    </p>

                    {/* CTA Section */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 min-[450px]:flex-row animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
                        <a
                            href="https://wa.me/5548999999999"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-amber px-8 text-xs font-bold uppercase tracking-widest text-ink shadow-paper transition-all hover:-translate-y-1 hover:bg-amber2 hover:shadow-xl active:scale-95"
                        >
                            Pedir no WhatsApp
                        </a>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
                            Entrega em Ariquemes e Região
                        </span>
                    </div>
                </div>


            </div>

            {/* SABORES SECTION */}
            <section id="sabores" className="relative z-10 mx-auto mb-12 max-w-6xl px-4">
                <div className="mb-10 text-center">
                    <h2 className="font-serif text-3xl font-bold text-ink md:text-5xl">Nossos Sabores</h2>
                    <div className="mx-auto mt-6 h-px w-20 bg-ink/20" />
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6 xl:gap-8">
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

            {/* CIÊNCIA LEVE / POR QUE BEBER */}
            <div className="my-8">
                <ScientificSection />
            </div>

            {/* FAQ */}
            <div className="mx-auto max-w-2xl px-4 py-8">
                <h2 className="mb-8 text-center font-serif text-3xl font-bold text-ink">Perguntas Frequentes</h2>
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
