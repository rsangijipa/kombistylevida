import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { FlaskConical, Sprout, ShieldCheck, Thermometer, Clock } from "lucide-react";

export default function ComoFazemosPage() {
    return (
        <SiteShell>
            <div className="mx-auto max-w-3xl pb-20">
                {/* Header */}
                <header className="mb-12 text-center">
                    <h1 className="font-serif text-[40px] font-bold text-olive md:text-[56px]">
                        Como Fazemos
                    </h1>
                    <p className="mt-4 text-lg text-ink2 font-serif italic max-w-xl mx-auto">
                        Do chá à garrafa, um processo vivo, lento e cheio de respeito pelo tempo.
                    </p>
                </header>

                {/* Steps */}
                <div className="space-y-16">
                    <section className="relative pl-8 md:pl-0">
                        {/* Vertical Line */}
                        <div className="absolute left-[11px] top-6 h-full w-[2px] bg-ink/10 md:left-1/2 md:-ml-[1px]" />

                        {/* Step 1 */}
                        <div className="relative mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="order-2 w-full pl-8 md:w-[45%] md:pl-0 md:text-right">
                                <h3 className="font-serif text-2xl font-bold text-olive">1. O Chá e a Base</h3>
                                <p className="mt-2 text-ink2">
                                    Tudo começa com Camellia sinensis orgânica (chá verde ou preto) e açúcar orgânico. Preparamos uma infusão forte e doce, o alimento perfeito para nossa cultura.
                                </p>
                            </div>
                            <div className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-olive ring-4 ring-paper md:left-1/2 md:-ml-3 order-1">
                                <Sprout size={14} className="text-paper" />
                            </div>
                            <div className="order-3 w-full pl-8 md:w-[45%] md:pl-0 md:hidden" /> {/* Spacer */}
                        </div>

                        {/* Step 2 */}
                        <div className="relative mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="order-3 w-full pl-8 md:w-[45%] md:pl-0">
                                <h3 className="font-serif text-2xl font-bold text-olive">2. A Fermentação (F1)</h3>
                                <p className="mt-2 text-ink2">
                                    Adicionamos o SCOBY (Nossa cultura mãe). O chá descansa em tanques de inox por 10 a 14 dias. Aqui, o açúcar é consumido e transformado em ácidos saudáveis e enzimas.
                                </p>
                            </div>
                            <div className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-amber ring-4 ring-paper md:left-1/2 md:-ml-3 order-1">
                                <Clock size={14} className="text-ink" />
                            </div>
                            <div className="order-2 w-full md:w-[45%]" /> {/* Spacer */}
                        </div>

                        {/* Step 3 */}
                        <div className="relative mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="order-2 w-full pl-8 md:w-[45%] md:pl-0 md:text-right">
                                <h3 className="font-serif text-2xl font-bold text-olive">3. Saborização Natural</h3>
                                <p className="mt-2 text-ink2">
                                    Nada de xaropes. Usamos frutas de verdade, gengibre fresco e especiarias. Fazemos uma maceração a frio para extrair o máximo de sabor e nutrientes.
                                </p>
                            </div>
                            <div className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-olive ring-4 ring-paper md:left-1/2 md:-ml-3 order-1">
                                <FlaskConical size={14} className="text-paper" />
                            </div>
                            <div className="order-3 w-full md:w-[45%]" /> {/* Spacer */}
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="order-3 w-full pl-8 md:w-[45%] md:pl-0">
                                <h3 className="font-serif text-2xl font-bold text-olive">4. Envase e Gás (F2)</h3>
                                <p className="mt-2 text-ink2">
                                    Engarrafamos e deixamos refermentar levemente na garrafa para criar o gás natural. Depois, refrigeração imediata para estabilizar.
                                </p>
                            </div>
                            <div className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-amber ring-4 ring-paper md:left-1/2 md:-ml-3 order-1">
                                <Thermometer size={14} className="text-ink" />
                            </div>
                            <div className="order-2 w-full md:w-[45%]" /> {/* Spacer */}
                        </div>
                    </section>

                    {/* Quality & Safety Section */}
                    <section className="mt-20 rounded-xl bg-paper2/50 p-8 border border-ink/10">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-olive" size={32} />
                            <h2 className="font-serif text-2xl font-bold text-ink">Padrão de Qualidade</h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <h4 className="font-bold text-olive uppercase tracking-wider text-sm mb-2">O que é normal?</h4>
                                <ul className="space-y-2 text-sm text-ink2 list-disc list-inside">
                                    <li><span className="font-bold text-ink">Sedimentos:</span> Pequenos pedaços de fruta ou levedura no fundo são sinal de vida e ingredientes reais.</li>
                                    <li><span className="font-bold text-ink">Mini-scoby:</span> Uma película gelatinosa pode formar no topo. É apenas celulose saudável.</li>
                                    <li><span className="font-bold text-ink">Variação de acidez:</span> Sendo artesanal, cada lote tem personalidade própria.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-700 uppercase tracking-wider text-sm mb-2">O que não é normal?</h4>
                                <ul className="space-y-2 text-sm text-ink2 list-disc list-inside">
                                    <li>Cheiro ou gosto de mofo/bolor.</li>
                                    <li>Gás excessivo que "explode" ao abrir (gushing violento).</li>
                                    <li>Alteração drástica de cor ou textura viscosa.</li>
                                </ul>
                                <p className="mt-4 text-xs italic text-ink/60">
                                    Em qualquer desses casos, não consuma e fale com a gente. Trocamos sua garrafa imediatamente.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </SiteShell>
    );
}
