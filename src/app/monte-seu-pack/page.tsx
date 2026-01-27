import React from "react";
import { PackBuilder } from "@/components/pack/PackBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Monte Seu Pack | Kombucha Arikê",
    description: "Escolha seus sabores favoritos e monte sua caixa personalizada.",
};

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export default function MonteSeuPackPage() {
    return (
        <SiteShell>
            <div className="md:pt-0"> {/* Removed plain padding, managed inside */}

                {/* HERO SECTION - Full Bleed */}
                <div className="relative mb-12 -mx-6 md:-mx-12 rounded-t-[32px] md:rounded-t-[48px] overflow-hidden">
                    <div className="relative h-[240px] md:h-[320px] w-full">
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/images/lifestyle/delivery-bag.jpg" // Updated to new delivery bag image
                                alt="Monte Seu Pack - Delivery"
                                className="w-full h-full object-cover object-[center_30%] blur-[2px] scale-105 opacity-90"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-paper to-transparent opacity-90" />
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-center z-20">
                            <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-4 drop-shadow-sm">Monte Seu Pack</h1>
                            <p className="text-ink2 text-lg max-w-md mx-auto font-medium">
                                Escolha entre 6 ou 12 garrafas e misture seus sabores favoritos para criar a caixa perfeita.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-lg px-4 pb-24">
                    <PackBuilder />
                </div>
            </div>
        </SiteShell>
    );
}
