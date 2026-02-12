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
import { BUSINESS, buildBusinessWhatsAppLink } from "@/config/business";

// Minimal data for Home (Top items)
const flavors: FlavorDetails[] = FLAVORS;

export default function Page() {
    const [selectedFlavor, setSelectedFlavor] = useState<FlavorDetails | null>(null);

    return (
        <SiteShell>
            {/* HERO SECTION */}
            {/* Split Layout: Image takes main space, Text Bar below it */}
            <div className="relative -mx-4 md:-mx-12 mb-8 text-center md:mb-12 rounded-t-[32px] md:rounded-t-[48px] overflow-hidden bg-paper2">

                {/* 1. Image Area (Unobstructed) */}
                <div className="relative w-full h-[60vh] md:h-[75vh]">
                    <Image
                        src="/images/hero-new.jpg"
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* 2. Text Bar (Compact) */}
                <div className="bg-paper2 py-4 px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl relative z-10 -mt-10 rounded-t-[24px] mx-auto max-w-4xl animate-in slide-in-from-bottom-4 fade-in duration-700">

                    {/* Slogan */}
                    <div className="text-center md:text-left">
                        <p className="font-serif text-xl text-ink font-bold leading-tight">
                            Estilo e sabor em cada gole.
                        </p>
                        <p className="text-ink2 text-sm mt-0.5">Fermentação natural, ingredientes reais.</p>
                    </div>

                    {/* CTA Section */}
                    <div className="flex flex-col items-center md:items-end justify-center gap-1.5">
                        <a
                            href={buildBusinessWhatsAppLink()}
                            className="inline-flex h-10 items-center justify-center rounded-full bg-amber px-6 text-xs font-bold uppercase tracking-widest text-ink shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber2 hover:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            Pedir no WhatsApp
                        </a>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40">
                            Entrega em {BUSINESS.deliveryRegion}
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
