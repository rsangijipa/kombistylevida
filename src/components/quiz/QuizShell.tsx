import React from "react";
import { SiteShell } from "@/components/SiteShell";

export function QuizShell({ children }: { children: React.ReactNode }) {
    return (
        <SiteShell>
            <div className="min-h-screen bg-paper text-ink">
                {/* Header */}
                <header className="py-16 px-6 text-center relative overflow-hidden -mx-4 md:-mx-12 rounded-t-[32px] md:rounded-t-[48px]">
                    {/* Custom Background Image */}
                    <div className="absolute inset-0 z-0 bg-stone-200">
                        <img
                            src="/images/quiz/header-bg.jpg"
                            alt="Background"
                            className="w-full h-full object-cover opacity-60"
                        />
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-paper to-transparent pointer-events-none z-10" />

                    <div className="relative z-20 max-w-4xl mx-auto">
                        <span className="text-olive/80 font-bold uppercase tracking-[0.2em] text-sm mb-4 block drop-shadow-sm">Kombucha Arikê</span>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive mb-6 leading-tight drop-shadow-sm">
                            Descubra seu <br /> <span className="italic text-ink/80">Sabor Ideal</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-ink/80 text-lg md:text-xl leading-relaxed font-serif font-medium drop-shadow-sm">
                            Responda algumas perguntas rápidas e encontre a combinação perfeita para o seu paladar e bem-estar.
                        </p>
                    </div>
                </header>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-4 pb-20 relative z-10">
                    {children}
                </div>
            </div>
        </SiteShell>
    );
}
