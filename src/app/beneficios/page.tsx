"use client";

import React from "react";
import { SiteShell } from "@/components/SiteShell";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Clock, Sun, Wind, Shield, Activity, Leaf, Droplet, Coffee } from "lucide-react";

export default function BeneficiosPage() {
    return (
        <SiteShell>
            <div className="pb-24 relative">

                {/* HERO SECTION - Full Bleed */}
                <div className="mb-12 text-center relative px-4 pt-32 pb-24 md:pt-40 -mx-4 md:-mx-12 rounded-t-[32px] md:rounded-t-[48px] overflow-hidden">
                    {/* Generated Background Image */}
                    <div className="absolute inset-0 -z-10">
                        <Image
                            src="/images/beneficios/header_bg.jpg"
                            alt="Background Texture"
                            fill
                            className="object-cover opacity-90"
                            priority
                        />
                        <div className="absolute inset-0 bg-paper/20" />
                    </div>

                    <h1 className="font-serif text-[40px] leading-[1.1] text-ink font-bold md:text-[64px] tracking-tight mb-8 drop-shadow-sm relative z-10">
                        Por que beber <br className="md:hidden" /> Kombucha Arikê?
                    </h1>
                    <div className="mx-auto h-[1px] w-24 bg-ink/20 mb-8 relative z-10" />
                    <p className="font-serif text-xl md:text-2xl text-ink font-normal italic mb-6 relative z-10">
                        Muito além do sabor. Um aliado vivo para o seu equilíbrio diário.
                    </p>
                    <p className="mx-auto max-w-3xl text-ink2/80 text-base md:text-lg leading-relaxed font-sans glass-panel p-6 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm relative z-10">
                        A kombucha é uma bebida fermentada naturalmente, viva, funcional e cheia de camadas — de sabor, de cultura e de benefícios. Incorporá-la à rotina é uma escolha consciente por bem-estar, leveza e conexão com o próprio corpo.
                    </p>
                </div>

                {/* SEÇÃO 1: BENEFÍCIOS FUNCIONAIS */}
                <section className="mb-16 max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                        {/* Card 1: Saúde Intestinal */}
                        <div className="group bg-paper rounded-[32px] p-6 md:p-8 shadow-sm border border-ink/5 relative overflow-hidden transition-all hover:shadow-paper hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-olive/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                            <div className="mb-8 relative h-32 w-32 mx-auto md:mx-0">
                                <Image
                                    src="/images/beneficios/gut_icon.png"
                                    alt="Saúde Intestinal"
                                    fill
                                    className="object-contain drop-shadow-md"
                                />
                            </div>

                            <h3 className="font-serif text-3xl font-bold text-ink mb-2">Saúde Intestinal</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-olive mb-6">Um intestino feliz sustenta todo o corpo.</p>

                            <p className="text-ink2/80 leading-relaxed text-base font-serif">
                                Rica em probióticos naturais, a kombucha pode auxiliar no equilíbrio da microbiota intestinal, favorecendo a digestão e a absorção de nutrientes. Um intestino em harmonia reflete diretamente na energia, no humor e na imunidade.
                            </p>
                        </div>

                        {/* Card 2: Energia Natural (Fallback to Icon) */}
                        <div className="group bg-paper rounded-[32px] p-6 md:p-8 shadow-sm border border-ink/5 relative overflow-hidden transition-all hover:shadow-paper hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                            <div className="mb-8 relative h-32 w-32 bg-amber/5 rounded-full flex items-center justify-center border border-amber/10 mx-auto md:mx-0">
                                <Activity className="text-amber w-12 h-12 opacity-80" />
                            </div>

                            <h3 className="font-serif text-3xl font-bold text-ink mb-2">Energia Natural</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-amber mb-6">Vitalidade que respeita o ritmo do corpo.</p>

                            <p className="text-ink2/80 leading-relaxed text-base font-serif">
                                Durante a fermentação, a kombucha desenvolve vitaminas do complexo B e enzimas ativas. Isso resulta em uma energia limpa e gradual, sem picos abruptos de açúcar ou cafeína excessiva.
                            </p>
                        </div>

                        {/* Card 3: Imunidade */}
                        <div className="group bg-paper rounded-[32px] p-6 md:p-8 shadow-sm border border-ink/5 relative overflow-hidden transition-all hover:shadow-paper hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-ink/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                            <div className="mb-8 relative h-32 w-32 mx-auto md:mx-0">
                                <Image
                                    src="/images/beneficios/immunity_icon.png"
                                    alt="Imunidade"
                                    fill
                                    className="object-contain drop-shadow-md"
                                />
                            </div>

                            <h3 className="font-serif text-3xl font-bold text-ink mb-2">Imunidade</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-6">Cuidar do intestino é fortalecer a defesa.</p>

                            <p className="text-ink2/80 leading-relaxed text-base font-serif">
                                Cerca de 70% do sistema imunológico está relacionado ao intestino. Ao apoiar o equilíbrio da microbiota, alimentos fermentados podem contribuir para defesas naturais mais estáveis ao longo do tempo.
                            </p>
                        </div>

                        {/* Card 4: Antioxidantes */}
                        <div className="group bg-paper rounded-[32px] p-6 md:p-8 shadow-sm border border-ink/5 relative overflow-hidden transition-all hover:shadow-paper hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-olive/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                            <div className="mb-8 relative h-32 w-32 mx-auto md:mx-0">
                                <Image
                                    src="/images/beneficios/antioxidants_icon.png"
                                    alt="Antioxidantes"
                                    fill
                                    className="object-contain drop-shadow-md"
                                />
                            </div>

                            <h3 className="font-serif text-3xl font-bold text-ink mb-2">Antioxidantes Naturais</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-olive mb-6">Renovação começa de dentro.</p>

                            <p className="text-ink2/80 leading-relaxed text-base font-serif">
                                Produzida a partir do chá (Camellia sinensis), a kombucha preserva polifenóis antioxidantes, que auxiliam no combate aos radicais livres e na proteção celular.
                            </p>
                        </div>

                    </div>
                </section>

                {/* SEÇÃO 2: LIFESTYLE (BOHO CLEAN) */}
                <section className="mb-16 -mx-4 md:-mx-12">
                    <div className="bg-paper2/50 border-y border-ink/5 py-16 px-4 md:px-12 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber/5 rounded-full blur-3xl -z-10" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-olive/5 rounded-full blur-3xl -z-10" />

                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-center font-serif text-3xl md:text-4xl text-ink mb-16 italic">
                                Um estilo de vida com mais...
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Lifestyle 1 */}
                                <div className="bg-paper p-8 rounded-2xl text-center shadow-sm relative group">
                                    <div className="mx-auto w-16 h-16 bg-paper2 rounded-full flex items-center justify-center mb-6 text-olive group-hover:scale-110 transition-transform">
                                        <Wind size={24} />
                                    </div>
                                    <h3 className="font-serif text-xl font-bold mb-3">Leveza no Dia a Dia</h3>
                                    <p className="text-sm text-ink2/80 leading-relaxed">
                                        A melhor alternativa aos refrigerantes. Menos açúcar, mais consciência e mais leveza na rotina.
                                    </p>
                                </div>

                                {/* Lifestyle 2 */}
                                <div className="bg-paper p-8 rounded-2xl text-center shadow-sm relative group">
                                    <div className="mx-auto w-16 h-16 bg-paper2 rounded-full flex items-center justify-center mb-6 text-amber group-hover:scale-110 transition-transform">
                                        <Droplet size={24} />
                                    </div>
                                    <h3 className="font-serif text-xl font-bold mb-3">Hidratação com Propósito</h3>
                                    <p className="text-sm text-ink2/80 leading-relaxed">
                                        Refrescante e funcional. Hidrata enquanto entrega compostos vivos e naturais ao organismo.
                                    </p>
                                </div>

                                {/* Lifestyle 3 */}
                                <div className="bg-paper p-8 rounded-2xl text-center shadow-sm relative group">
                                    <div className="mx-auto w-16 h-16 bg-paper2 rounded-full flex items-center justify-center mb-6 text-ink/60 group-hover:scale-110 transition-transform">
                                        <Coffee size={24} />
                                    </div>
                                    <h3 className="font-serif text-xl font-bold mb-3">Ritual de Pausa</h3>
                                    <p className="text-sm text-ink2/80 leading-relaxed">
                                        Um convite à pausa. Um pequeno ritual diário que conecta sabor, cuidado e presença.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 3: COMO CONSUMIR & AVISO */}
                <section className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-6">Como incluir na rotina</h2>
                        <p className="text-lg text-ink2/90 font-serif leading-relaxed max-w-2xl mx-auto mb-10">
                            A kombucha pode ser consumida diariamente, preferencialmente gelada. Comece com pequenas quantidades e observe como seu corpo responde.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest text-ink/60">
                            <span className="px-4 py-2 bg-ink/5 rounded-full border border-ink/10">Substituta de refri</span>
                            <span className="px-4 py-2 bg-ink/5 rounded-full border border-ink/10">Entre refeições</span>
                            <span className="px-4 py-2 bg-ink/5 rounded-full border border-ink/10">Dias quentes</span>
                            <span className="px-4 py-2 bg-ink/5 rounded-full border border-ink/10">Refeições leves</span>
                        </div>
                    </div>

                    {/* Aviso Importante (Refinado) */}
                    <div className="bg-paper2 rounded-xl p-8 md:p-10 border border-ink/10 relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-ink/10" />
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-ink/40 mb-4">Aviso Legal</h4>
                        <p className="font-serif text-ink2/80 italic text-sm leading-relaxed max-w-2xl mx-auto">
                            Conteúdo informativo. A kombucha é um alimento funcional, não um medicamento. Não substitui orientação médica ou nutricional.
                            Em casos específicos — como gestação, imunossupressão ou condições gastrointestinais — consulte sempre um profissional de saúde.
                        </p>
                    </div>
                </section>

            </div>
        </SiteShell>
    );
}
