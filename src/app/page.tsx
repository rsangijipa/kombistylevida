"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Calendar, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { FlavorCard } from "@/components/FlavorCard";
import { Faq } from "@/components/Faq";
import { ScientificSection } from "@/components/ScientificSection";
import { FlavorModal, FlavorDetails } from "@/components/FlavorModal";
import { PromoSection } from "@/components/PromoSection";

// Minimal data for Home (Top items)
const flavors: FlavorDetails[] = [
    {
        id: "ginger-lemon",
        title: "Gengibre\n& Limão",
        imageSrc: "/images/flavor-ginger-lemon.png",
        longDesc: "Um clássico revigorante. A picância natural do gengibre encontra a acidez vibrante do limão, criando uma bebida que desperta os sentidos e auxilia na digestão.",
        ingredients: ["Chá verde", "Gengibre fresco", "Suco de limão", "Açúcar orgânico"],
        pairings: ["Saladas frescas", "Peixes grelhados", "Dias de sol"]
    },
    {
        id: "red-berries",
        title: "Frutas\nVermelhas",
        imageSrc: "/images/flavor-red-berries.png",
        longDesc: "Explosão de sabores do bosque. Uma combinação antioxidante e levemente adocicada de morango, amora e mirtilo.",
        ingredients: ["Chá preto", "Morango", "Amora", "Mirtilo", "Hibisco"],
        pairings: ["Sobremesas leves", "Queijos suaves", "Fim de tarde"]
    },
    {
        id: "purple-grape",
        title: "Uva\nRoxa",
        imageSrc: "/images/flavor-purple-grape.png",
        longDesc: "Intenso e encorpado. Feito com uvas de colheita selecionada, traz notas profundas que lembram um bom vinho, mas sem álcool.",
        ingredients: ["Chá preto", "Suco de uva integral", "Açúcar orgânico"],
        pairings: ["Massas", "Risotos", "Jantares especiais"]
    },
    {
        id: "passionfruit",
        title: "Maracujá",
        imageSrc: "/images/flavor-passionfruit.png",
        longDesc: "Tropicalidade pura. O perfume inconfundível do maracujá traz calma e refrescância, com aquele azedinho que todo mundo ama.",
        ingredients: ["Chá verde", "Polpa de maracujá", "Capim-santo"],
        pairings: ["Aves", "Poke bowls", "Momentos relax"]
    },
];

export default function Page() {
    const [selectedFlavor, setSelectedFlavor] = useState<FlavorDetails | null>(null);

    return (
        <SiteShell>
            <FlavorModal
                key={selectedFlavor?.id || 'modal'}
                isOpen={!!selectedFlavor}
                onClose={() => setSelectedFlavor(null)}
                flavor={selectedFlavor}
            />

            {/* HERO SECTION */}
            <section id="sobre" className="flex flex-col items-center text-center">
                <h1 className="font-serif text-[48px] leading-[1.05] text-olive font-semibold md:text-[64px] lg:text-[72px] tracking-tight">
                    Kombistyle Vida
                </h1>

                <p className="mt-3 font-serif text-[20px] italic text-ink2/80 md:text-[22px]">
                    Estilo e sabor em cada gole.
                </p>

                {/* CTA */}
                <div className="mt-8">
                    <Link
                        href="/menu"
                        className="group flex items-center gap-3 rounded-full bg-olive px-8 py-4 text-sm font-bold uppercase tracking-widest text-paper shadow-lg shadow-olive/20 transition-all hover:scale-105 hover:bg-olive/90 active:scale-95"
                    >
                        <span className="relative">
                            Peça Agora
                            <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-amber transition-all group-hover:w-full" />
                        </span>
                        <ArrowRight size={18} />
                    </Link>
                    <div className="mt-3 text-[11px] font-bold uppercase tracking-widest text-ink/40">
                        Entrega ou Retirada
                    </div>
                </div>

                {/* Hero Fruits Image */}
                <div className="mt-8 relative h-[200px] w-full max-w-[800px] md:h-[260px]">
                    <Image
                        src="/images/hero-fruits.png"
                        alt="Frutas frescas"
                        fill
                        priority
                        className="object-contain drop-shadow-xl"
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                </div>
            </section>

            {/* STEPS: COMO PEDIR */}
            <section className="mt-16 border-y border-ink/5 bg-paper2/50 py-12">
                <div className="mx-auto max-w-5xl px-4 text-center">
                    <h2 className="mb-10 font-serif text-2xl font-bold text-olive">Como Pedir sua Kombi</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-ink/10 text-olive shadow-sm">
                                <ShoppingBag size={24} />
                            </div>
                            <h3 className="font-bold text-ink uppercase tracking-wide text-sm">1. Escolha no Menu</h3>
                            <p className="mt-2 text-sm text-ink2 leading-relaxed max-w-[200px]">Navegue pelos sabores e monte sua sacola com avulsos ou combos.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-ink/10 text-olive shadow-sm">
                                <Calendar size={24} />
                            </div>
                            <h3 className="font-bold text-ink uppercase tracking-wide text-sm">2. Agende a Entrega</h3>
                            <p className="mt-2 text-sm text-ink2 leading-relaxed max-w-[200px]">Defina o melhor dia e horário ou escolha retirar com a gente.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-ink/10 text-olive shadow-sm">
                                <MessageCircle size={24} />
                            </div>
                            <h3 className="font-bold text-ink uppercase tracking-wide text-sm">3. Finalize no Whats</h3>
                            <p className="mt-2 text-sm text-ink2 leading-relaxed max-w-[200px]">Seu pedido vai pronto para o WhatsApp. É só enviar e pagar no Pix.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SABORES SECTION */}
            <section id="sabores" className="mt-20 md:mt-24">
                <div className="mb-10 text-center">
                    <h2 className="font-serif text-[36px] font-semibold text-olive md:text-[42px]">
                        Sabores
                    </h2>
                    <div className="mt-4 h-[2px] w-12 mx-auto bg-amber rounded-full opacity-60" />
                </div>

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 px-4">
                    {flavors.map((f) => (
                        <FlavorCard
                            key={f.title}
                            flavor={f}
                            onOpen={() => setSelectedFlavor(f)}
                        />
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link href="/menu" className="text-sm font-bold uppercase tracking-widest text-olive hover:underline">
                        Ver cardápio completo &rarr;
                    </Link>
                </div>
            </section>

            {/* PROMO SECTION */}
            <div className="mt-20 md:mt-24">
                <PromoSection />
            </div>

            {/* CULTURA VIVA / SCIENTIFIC SECTION */}
            <div className="mt-24 md:mt-28">
                <ScientificSection />
            </div>

            {/* FAQ SECTION */}
            <section id="faq" className="mt-20 md:mt-24">
                <div className="mb-10 text-center">
                    <h2 className="font-serif text-[36px] font-semibold text-olive md:text-[42px]">
                        FAQ
                    </h2>
                    <div className="mt-4 h-[2px] w-12 mx-auto bg-amber rounded-full opacity-60" />
                </div>
                <Faq />
            </section>

        </SiteShell>
    );
}
