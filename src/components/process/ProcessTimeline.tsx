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
        imageSrc: "/images/illustrations/process/passo-3-envase.png",
        alt: "Garrafas sendo rotuladas a mão"
    }
];

export function ProcessTimeline() {
    return (
        <div className="relative max-w-5xl mx-auto px-4 py-8">
            {/* Central Organic Line (Vine) - subtle dotted */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px border-l border-dashed border-ink/20 hidden md:block"></div>

            {STEPS.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                    <div key={step.id} className="relative mb-20 last:mb-0 group">
                        {/* Center Marker */}
                        <div className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 w-4 h-4 rounded-full bg-paper border-2 border-olive z-10 box-content p-[2px]">
                            <div className="w-full h-full rounded-full bg-olive"></div>
                        </div>

                        <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-20 ${isEven ? "" : "md:flex-row-reverse"}`}>
                            {/* Image Side - Refined */}
                            <div className="flex-1 w-full max-w-[280px] md:max-w-[320px] relative">
                                <div className="relative aspect-square w-full">
                                    {/* Abstract organic blob background - More subtle */}
                                    <div className={`absolute inset-4 rounded-[40px] bg-paper2 shadow-sm transition-transform duration-700 group-hover:rotate-1 ${isEven ? 'rotate-2' : '-rotate-2'}`} />
                                    <div className={`absolute inset-4 rounded-[40px] border border-ink/10 transition-transform duration-700 delay-100 group-hover:-rotate-1 ${isEven ? '-rotate-1' : 'rotate-1'}`} />

                                    <div className="relative h-full w-full overflow-hidden p-6 flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-105">
                                        <Image
                                            src={step.imageSrc}
                                            alt={step.alt}
                                            width={300}
                                            height={300}
                                            className="object-contain drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className={`flex-1 text-center ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                                <span className={`inline-block mb-3 font-sans font-bold tracking-[0.2em] text-xs uppercase text-white bg-olive px-3 py-1 rounded-full shadow-sm`}>
                                    Passo 0{step.id}
                                </span>

                                <h3 className="mb-4 font-serif text-3xl font-normal text-ink md:text-4xl leading-tight">
                                    {step.title}
                                </h3>

                                <p className="font-serif text-base md:text-lg leading-relaxed text-ink2/80 max-w-sm mx-auto md:mx-0">
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
