"use client";

import React, { useState } from "react";
import { ContentModeToggle } from "./ContentModeToggle";
import { cn } from "@/lib/cn";

import { CultureFeature } from "./CultureFeature";

// Reuse existing features for "Light" mode
const cultureFeatures = [
    {
        title: "Fermentação\nnatural",
        desc: "Processo lento e controlado para desenvolver o sabor complexo, ácidos orgânicos e os probióticos essenciais.",
        iconSrc: "/images/icon-fermentation.png",
    },
    {
        title: "Ingredientes\nnaturais",
        desc: "Apenas frutas de verdade, chás selecionados e especiarias. Nada de corantes, conservantes ou atalhos.",
        iconSrc: "/images/icon-ingredients.png",
    },
    {
        title: "Levemente\ngaseificada",
        desc: "Carbonatação natural da própria fermentação, criando bolhas finas e refrescantes na medida certa.",
        iconSrc: "/images/icon-carbonation.png",
    },
];

export function ScientificSection() {
    const [mode, setMode] = useState<"light" | "scientific">("light");

    return (
        <section id="base-cientifica" className="mx-auto max-w-5xl px-4 text-center">
            {/* Header & Toggle */}
            <div className="mb-12 flex flex-col items-center gap-6">
                <div>
                    <h2 className="font-serif text-[36px] font-semibold text-olive md:text-[42px]">
                        Cultura Viva
                    </h2>
                    <div className="mt-4 h-[2px] w-12 mx-auto bg-amber rounded-full opacity-60" />
                </div>

                <ContentModeToggle mode={mode} onChange={setMode} />

                <p className="max-w-2xl text-[16px] text-ink2/80 font-serif italic">
                    {mode === "light"
                        ? "Descubra o coração da nossa bebida em três pilares essenciais."
                        : "Explore a bioquímica, microbiologia e as evidências por trás do Kombucha."}
                </p>
            </div>

            {/* Mode: LIGHT */}
            <div className={cn("transition-opacity duration-500", mode === "light" ? "opacity-100 block" : "opacity-0 hidden")}>
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 bg-paper2/40 p-8 rounded-[30px] border border-ink/5">
                    {cultureFeatures.map((c) => (
                        <CultureFeature key={c.title} feature={c} />
                    ))}
                </div>
            </div>

            {/* Mode: SCIENTIFIC */}
            <div className={cn("transition-opacity duration-500 text-left", mode === "scientific" ? "opacity-100 block" : "opacity-0 hidden")}>
                <div className="flex flex-col gap-8">

                    {/* 1. Mini Chart & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MiniChartSugarAcid />
                        <SafetyChecklist />
                    </div>

                    {/* 2. Accordions Deep Dive */}
                    <div className="flex flex-col gap-4 mt-4">
                        <ScientificAccordion
                            title="01. O que é o SCOBY?"
                            content="SCOBY é o acrônimo para Symbiotic Culture Of Bacteria and Yeast. Trata-se de um biofilme de celulose (película) onde convivem bactérias (principalmente Komagataeibacter xylinus) e leveduras (como Zygosaccharomyces). Elas trabalham em sintonia: as leveduras convertem o açúcar em álcool e CO2, e as bactérias convertem o álcool em ácidos orgânicos saudáveis."
                        />
                        <ScientificAccordion
                            title="02. Metamorfose Bioquímica"
                            content="Durante a fermentação (1a e 2a etapas), o chá doce se transforma. O nível de açúcar cai drasticamente, enquanto a acidez aumenta. Compostos como Ácido Acético, Ácido Glucônico e Ácido Lático são produzidos, além de vitaminas do complexo B e polifenóis antioxidantes do chá (Camellia sinensis) serem liberados e potencializados."
                        />
                        <ScientificAccordion
                            title="03. Segurança e Regulamentação"
                            content="Seguimos rigorosamente a IN 41/2019 do MAPA. Nosso Kombucha é controlado para manter o teor alcoólico abaixo de 0,5% (não alcoólico) e pH seguro (< 4.2) para impedir patógenos. Diferenciamos mofo (prejudicial) de Kahm Yeast (benigno, mas indesejado sensorialmente) com controle estrito de higiene e lote."
                        />
                        <ScientificAccordion
                            title="04. O que a ciência diz?"
                            content="Estudos in vitro e em modelos animais sugerem potencial antioxidante, antimicrobiano e modulação da microbiota intestinal. Ensaios clínicos em humanos ainda são limitados. Portanto, consuma Kombucha como um alimento funcional vivo e parte de uma dieta equilibrada, não como medicamento milagroso."
                        />
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 rounded-xl bg-amber/10 border border-amber/20 p-4 text-center">
                        <p className="text-[13px] text-ink2/90 font-medium">
                            ⚠️ Nota Legal: As informações acima têm caráter educativo e baseiam-se na literatura científica disponível. O Kombucha é um alimento, não um remédio, e não substitui tratamento médico.
                        </p>
                    </div>
                </div>
            </div>

        </section>
    );
}

// Sub-components for Scientific View

function MiniChartSugarAcid() {
    return (
        <div className="rounded-[22px] border border-ink/10 bg-white/50 p-6 shadow-sm">
            <h4 className="font-serif text-lg font-bold text-olive mb-4">Metabolismo Fermentativo</h4>
            <div className="relative h-[120px] w-full flex items-end justify-between px-2 pb-6 border-b border-ink/20">
                {/* Labels Y */}
                <span className="absolute left-0 top-0 text-[10px] text-ink/40">Alta Conc.</span>
                <span className="absolute left-0 bottom-6 text-[10px] text-ink/40">Baixa Conc.</span>

                {/* Lines (CSS Art) */}
                <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                    {/* Açúcar (Decrescente) */}
                    <path d="M 40 20 C 100 20, 150 100, 280 110" fill="none" stroke="#ECBC75" strokeWidth="3" strokeDasharray="4 2" />
                    <text x="50" y="15" className="text-[10px] fill-amber font-bold">Açúcar</text>

                    {/* Ácidos (Crescente) */}
                    <path d="M 40 110 C 100 110, 150 40, 280 30" fill="none" stroke="#353424" strokeWidth="3" />
                    <text x="260" y="25" className="text-[10px] fill-olive font-bold">Ácidos Orgânicos</text>
                </svg>
            </div>
            <div className="flex justify-between text-[11px] text-ink/60 mt-2 font-medium">
                <span>Dia 0 (Chá Doce)</span>
                <span>Dia 14 (Kombucha)</span>
            </div>
        </div>
    )
}

function SafetyChecklist() {
    const items = [
        "pH controlado (< 4.0)",
        "Rastreabilidade de lote",
        "Água filtrada tripla",
        "Cultura (SCOBY) certificada",
    ]
    return (
        <div className="rounded-[22px] border border-ink/10 bg-white/50 p-6 shadow-sm flex flex-col justify-center">
            <h4 className="font-serif text-lg font-bold text-olive mb-4">Checklist de Segurança</h4>
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[14px] text-ink2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-olive/10 text-olive">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

function ScientificAccordion({ title, content }: { title: string; content: string }) {
    return (
        <details className="group rounded-[18px] border border-ink/10 bg-paper transition-all open:bg-paper2">
            <summary className="flex cursor-pointer items-center justify-between p-5 font-serif text-[18px] font-semibold text-ink transition-colors hover:text-olive">
                {title}
                <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 text-[14px] transition-transform group-open:rotate-180">
                    ▼
                </span>
            </summary>
            <div className="px-5 pb-5 pt-0 text-[15px] leading-relaxed text-ink2/90 animate-in slide-in-from-top-2">
                {content}
            </div>
        </details>
    )
}
