import React from "react";
import Image from "next/image";
import { FEATURES } from "@/data/features";

export function CulturaVivaSection() {
    return (
        <section className="relative px-4 py-16 md:py-24">
            {/* Decorative Divider Top */}
            <div className="mx-auto mb-16 h-px w-24 bg-ink/30 md:w-32" />

            <div className="mb-12 text-center">
                <h2 className="font-serif text-[32px] font-bold leading-tight text-ink md:text-[42px]">
                    Cultura Viva
                </h2>
                <p className="mt-4 font-serif text-lg italic text-ink2/80">
                    O segredo está em respeitar o tempo da natureza.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
                {FEATURES.map((feature, idx) => (
                    <div key={idx} className="group flex flex-col items-center text-center">
                        {/* Icon Wrapper with subtle arabesque background if desired, currently clean */}
                        <div className="relative mb-6 flex h-32 w-32 items-center justify-center transition-transform duration-500 group-hover:-translate-y-2">
                            <Image
                                src={feature.icon}
                                alt={feature.title}
                                width={128}
                                height={128}
                                className="object-contain opacity-90 transition-opacity group-hover:opacity-100"
                            />
                            {/* Sombra de chão sutil */}
                            <div className="absolute -bottom-2 h-4 w-24 rounded-[100%] bg-ink/5 blur-md" />
                        </div>

                        <h3 className="mb-3 font-serif text-xl font-bold text-ink transition-colors group-hover:text-olive">
                            {feature.title}
                        </h3>
                        <p className="max-w-[240px] text-[15px] leading-relaxed text-ink2">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Selo Artesanal como assinatura visual */}
            <div className="mt-20 flex justify-center opacity-80 mix-blend-multiply">
                <Image
                    src="/images/ornaments/stamp-artesanal.png"
                    alt="Selo Artesanal Fermentado com Vida"
                    width={160}
                    height={160}
                    className="rotate-[-6deg]"
                />
            </div>
        </section>
    );
}
