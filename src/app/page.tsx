import React from "react";
import Image from "next/image";
import { TopNav } from "@/components/TopNav";
import { OrnateFrame } from "@/components/OrnateFrame";
import { Bubbles } from "@/components/Bubbles";
import { FlavorCard } from "@/components/FlavorCard";
import { CultureFeature } from "@/components/CultureFeature";
import { Faq } from "@/components/Faq";

export default function Page() {
    const flavors = [
        { title: "Gengibre\n& Limão", subtitle: "Gengibre &", imageSrc: "/images/flavor-ginger-lemon.png" },
        { title: "Frutas\nVermelhas", subtitle: "Frutas Vermelhas", imageSrc: "/images/flavor-red-berries.png" },
        { title: "Uva Roxa", subtitle: "Uva Roxa", imageSrc: "/images/flavor-purple-grape.png" },
        { title: "Maracujá", subtitle: "Maracujá", imageSrc: "/images/flavor-passionfruit.png" },
    ].map((f) => ({ ...f, title: f.title.replace("\n", " ") }));

    const culture = [
        {
            title: "Fermentação\nnatural".replace("\n", " "),
            desc: "Lerem ipsum natural & bubbling ama scoby.",
            iconSrc: "/images/icon-fermentation.png",
        },
        {
            title: "Ingredientes\nnaturais".replace("\n", " "),
            desc: "Fresh fromilhas, anvous fruits and i roots.",
            iconSrc: "/images/icon-ingredients.png",
        },
        {
            title: "Levemente\ngaseificada".replace("\n", " "),
            desc: "Lerem ipsum ollos witi a levemente gaseificada.",
            iconSrc: "/images/icon-carbonation.png",
        },
    ];

    return (
        <main className="px-4 py-10 md:py-14">
            <section className="relative mx-auto max-w-5xl">
                {/* cartão/papel */}
                <div className="relative rounded-frame bg-paper2/80 shadow-paper">
                    {/* bordas */}
                    <div className="relative rounded-frame border border-ink/55 p-4 md:p-6">
                        <div className="relative rounded-frameInner border border-ink/30 bg-paper/85 px-5 py-6 md:px-10 md:py-8">
                            {/* ornamentos */}
                            <OrnateFrame />
                            <Bubbles side="left" />
                            <Bubbles side="right" />

                            {/* NAV */}
                            <TopNav />

                            {/* HERO / SOBRE */}
                            <section id="sobre" className="relative mx-auto mt-10 max-w-3xl text-center">
                                <h1 className="font-serif text-[44px] font-semibold leading-none text-olive md:text-[56px]">
                                    Kombistyle Vida
                                </h1>
                                <p className="mt-2 text-[16px] text-ink2/85 md:text-[17px]">
                                    Estilo e sabor em cada gole.
                                </p>

                                <a
                                    href="https://wa.me/5599999999999?text=Ol%C3%A1!%20Quero%20pedir%20Kombistyle%20Vida."
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 inline-flex items-center justify-center rounded-full border border-ink/60 bg-amber px-6 py-3 text-[15px] font-medium text-ink shadow-print transition hover:brightness-[1.03]"
                                >
                                    Pedir no WhatsApp
                                </a>

                                {/* Deco hero */}
                                <div className="pointer-events-none mx-auto mt-6 flex max-w-[740px] items-end justify-center">
                                    <div className="relative h-[180px] w-full md:h-[220px]">
                                        <Image
                                            src="/images/hero-fruits.png"
                                            alt="Composição de frutas"
                                            fill
                                            className="object-contain opacity-90"
                                            priority
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* SABORES */}
                            <section id="sabores" className="mx-auto mt-12 max-w-4xl text-center">
                                <h2 className="font-serif text-[34px] font-semibold text-olive md:text-[40px]">
                                    Sabores
                                </h2>

                                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {flavors.map((f) => (
                                        <FlavorCard
                                            key={f.title}
                                            flavor={f}
                                            variant="home"
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* CULTURA VIVA */}
                            <section id="cultura" className="mx-auto mt-14 max-w-4xl text-center">
                                <h2 className="font-serif text-[34px] font-semibold text-olive md:text-[40px]">
                                    Cultura Viva
                                </h2>

                                <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
                                    {culture.map((c) => (
                                        <CultureFeature key={c.title} feature={c} />
                                    ))}
                                </div>
                            </section>

                            {/* FAQ */}
                            <section id="faq" className="mx-auto mt-14 max-w-4xl text-center">
                                <h2 className="font-serif text-[34px] font-semibold text-olive md:text-[40px]">
                                    FAQ
                                </h2>
                                <Faq />
                            </section>

                            {/* CONTATO */}
                            <section id="contato" className="mx-auto mt-14 max-w-4xl pb-6 text-center">
                                <h2 className="font-serif text-[34px] font-semibold text-olive md:text-[40px]">
                                    Contato
                                </h2>

                                <div className="mx-auto mt-6 max-w-3xl rounded-[18px] border border-ink/35 bg-paper2/60 p-6 shadow-print">
                                    <p className="text-[15px] text-ink2/85">
                                        Para pedidos e parcerias, fale com a gente. Operação simples, qualidade alta e processo limpo — do jeitinho “raiz” que escala bem.
                                    </p>

                                    <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <a
                                            className="inline-flex items-center justify-center rounded-full border border-ink/60 bg-amber px-6 py-3 text-[15px] font-medium text-ink shadow-print transition hover:brightness-[1.03]"
                                            href="https://wa.me/5599999999999?text=Ol%C3%A1!%20Quero%20pedir%20Kombistyle%20Vida."
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            WhatsApp
                                        </a>
                                        <a
                                            className="inline-flex items-center justify-center rounded-full border border-ink/45 bg-paper px-6 py-3 text-[15px] font-medium text-ink shadow-print transition hover:bg-paper2"
                                            href="#"
                                        >
                                            Instagram
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
