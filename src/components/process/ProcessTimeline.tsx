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
        <div className="relative max-w-4xl mx-auto px-4 py-16">
            {/* Central Organic Line (Vine) */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-ink/10 hidden md:block"></div>

            {STEPS.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                    <div key={step.id} className="relative mb-32 last:mb-0 group">
                        {/* Leaf decoration on line */}
                        <div className={`hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 w-8 h-8 items-center justify-center bg-paper z-10 rounded-full border border-ink/10 text-olive`}>
                            <div className="w-2 h-2 rounded-full bg-olive/40" />
                        </div>

                        <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${isEven ? "" : "md:flex-row-reverse"}`}>
                            {/* Image Side - Organic Shape */}
                            <div className="flex-1 w-full max-w-[320px] relative">
                                <div className="relative aspect-square w-full">
                                    {/* Abstract organic blob background */}
                                    <div className={`absolute inset-0 rounded-[40px] bg-paper2 transition-transform duration-700 group-hover:rotate-2 ${isEven ? 'rotate-3' : '-rotate-3'}`} />
                                    <div className={`absolute inset-0 rounded-[40px] border border-ink/10 transition-transform duration-700 delay-100 group-hover:-rotate-1 ${isEven ? '-rotate-2' : 'rotate-2'}`} />

                                    <div className="relative h-full w-full overflow-hidden p-6 flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-105">
                                        <Image
                                            src={step.imageSrc}
                                            alt={step.alt}
                                            width={300}
                                            height={300}
                                            className="object-contain drop-shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className={`flex-1 text-center ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                                <h3 className="mb-4 font-serif text-3xl font-bold text-ink md:text-5xl tracking-tight">
                                    <span className="text-amber/60 text-lg md:text-xl block mb-2 font-sans font-bold tracking-widest uppercase">0{step.id}</span>
                                    {step.title}
                                </h3>
                                <div className={`h-px w-16 bg-ink/20 mb-6 mx-auto ${isEven ? 'md:mx-0' : 'md:ml-auto'}`} />
                                <p className="font-serif text-lg leading-relaxed text-ink2/90">
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
