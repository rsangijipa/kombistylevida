import React from "react";
import Image from "next/image";

const STEPS = [
    {
        id: 1,
        title: "Infusão & Preparo",
        description: "Tudo começa com a seleção de chás orgânicos (Camellia sinensis) e açúcar demerara. Preparamos uma infusão rica e doce, o alimento perfeito para nossa cultura.",
        imageSrc: "/images/illustrations/process/passo-1-cha-scoby.png", // Placeholder
        alt: "Infusão de chá a 85 graus"
    },
    {
        id: 2,
        title: "Fermentação Natural",
        description: "Adicionamos o SCOBY (cultura simbiótica). Durante 14 a 21 dias, a mágica acontece: o açúcar é consumido e transformado em ácidos orgânicos, vitaminas e gás natural.",
        imageSrc: "/images/illustrations/process/passo-2-fermentacao.png", // Placeholder
        alt: "Jarras fermentando com tecido cobrindo"
    },
    {
        id: 3,
        title: "Envase & Saborização",
        description: "Adicionamos frutas frescas e envasamos. Ocorre aqui a segunda fermentação, criando o gás natural (carbonatação) que faz aquele 'pop' ao abrir.",
        imageSrc: "/images/illustrations/process/passo-3-envase.jpg",
        alt: "Garrafas sendo rotuladas a mão"
    }
];

export function ProcessTimeline() {
    return (
        <div className="relative max-w-5xl mx-auto px-4 py-16">
            {STEPS.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                    <div key={step.id} className="relative mb-24 last:mb-0">
                        {/* Connecting Line (except last) */}
                        {index !== STEPS.length - 1 && (
                            <div className="absolute left-1/2 bottom-[-100px] h-[100px] w-[1px] border-l border-dashed border-ink/20 hidden md:block" />
                        )}

                        <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isEven ? "" : "md:flex-row-reverse"}`}>
                            {/* Image Side */}
                            <div className="flex-1 w-full max-w-sm">
                                <div className="relative aspect-square w-full rounded-2xl border-2 border-ink/5 bg-paper2 p-4 rotate-1 transition-transform hover:rotate-0">
                                    <div className="relative h-full w-full overflow-hidden rounded-xl bg-paper">
                                        {/* We use Next/Image but anticipate it might missing, so we use a fallback strategy visually if needed by wrapper bg */}
                                        <Image
                                            src={step.imageSrc}
                                            alt={step.alt}
                                            fill
                                            className="object-contain p-4 opacity-90"
                                            sizes="(max-width: 768px) 100vw, 400px"
                                        />
                                        <div className="absolute inset-0 bg-ink/5 pointer-events-none mix-blend-multiply" />
                                    </div>
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="mb-4 inline-block rounded-full border border-ink/20 px-3 py-1 font-serif text-sm italic text-ink/60">
                                    Passo {step.id}
                                </div>
                                <h3 className="mb-4 font-serif text-3xl font-bold text-ink md:text-4xl">
                                    {step.title}
                                </h3>
                                <p className="font-serif text-lg leading-relaxed text-ink2">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
