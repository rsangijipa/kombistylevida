"use client";

import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { Droplet, Heart, Zap, ShieldCheck } from "lucide-react";

export default function BeneficiosPage() {
    return (
        <SiteShell>
            <div className="pb-20">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="font-serif text-[40px] leading-tight text-ink font-bold md:text-[56px] tracking-tight">
                        Por Que Beber?
                    </h1>
                    <div className="mx-auto mt-6 h-[1px] w-20 bg-ink/30" />
                    <p className="mx-auto mt-6 max-w-2xl text-ink2 text-lg font-serif italic leading-relaxed">
                        Muito além do sabor. Um aliado vivo para o seu equilíbrio diário.
                    </p>
                </div>

                {/* Grid de Benefícios Editorial */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto mb-20">

                    {/* Item 1 */}
                    <article className="bg-paper2 border-l-4 border-amber p-8 shadow-sm">
                        <Heart className="w-10 h-10 text-ink mb-4 opacity-80" />
                        <h3 className="font-serif text-2xl font-bold text-ink mb-3">Saúde Intestinal</h3>
                        <p className="font-serif text-ink2 leading-relaxed">
                            Rica em probióticos naturais, a kombucha pode auxiliar no equilíbrio da microbiota intestinal, favorecendo a digestão. Um intestino feliz reflete em todo o corpo.
                        </p>
                    </article>

                    {/* Item 2 */}
                    <article className="bg-paper2 border-l-4 border-olive p-8 shadow-sm">
                        <Zap className="w-10 h-10 text-ink mb-4 opacity-80" />
                        <h3 className="font-serif text-2xl font-bold text-ink mb-3">Energia Natural</h3>
                        <p className="font-serif text-ink2 leading-relaxed">
                            Contém vitaminas do complexo B e enzimas ativas produzidas durante a fermentação. Uma fonte de vitalidade limpa, sem os picos de açúcar de refrigerantes.
                        </p>
                    </article>

                    {/* Item 3 */}
                    <article className="bg-paper2 border-l-4 border-olive p-8 shadow-sm">
                        <ShieldCheck className="w-10 h-10 text-ink mb-4 opacity-80" />
                        <h3 className="font-serif text-2xl font-bold text-ink mb-3">Imunidade</h3>
                        <p className="font-serif text-ink2 leading-relaxed">
                            O equilíbrio da microbiota é essencial para o sistema imunológico. Consumir alimentos fermentados regularmente pode contribuir para suas defesas naturais.
                        </p>
                    </article>

                    {/* Item 4 */}
                    <article className="bg-paper2 border-l-4 border-amber p-8 shadow-sm">
                        <Droplet className="w-10 h-10 text-ink mb-4 opacity-80" />
                        <h3 className="font-serif text-2xl font-bold text-ink mb-3">Antioxidantes</h3>
                        <p className="font-serif text-ink2 leading-relaxed">
                            Feita a partir do chá (Camellia sinensis), preserva os polifenóis que combatem os radicais livres, auxiliando na renovação celular.
                        </p>
                    </article>

                </div>

                {/* Disclaimer Compliance */}
                <div className="mx-auto max-w-2xl text-center border border-dashed border-ink/30 p-6 rounded-xl bg-ink/5">
                    <p className="text-xs text-ink/60 uppercase tracking-widest font-bold mb-2">Aviso Importante</p>
                    <p className="text-sm text-ink/70 font-serif italic">
                        Conteúdo informativo. A Kombucha é um alimento funcional, não um medicamento. Não substitui orientação médica. Em caso de condições específicas (gestação, imunossupressão, problemas gastrointestinais severos), consulte sempre um profissional de saúde.
                    </p>
                </div>
            </div>
        </SiteShell>
    );
}
