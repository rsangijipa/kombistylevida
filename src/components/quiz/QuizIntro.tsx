import React from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

interface QuizIntroProps {
    onStart: () => void;
}

export function QuizIntro({ onStart }: QuizIntroProps) {
    return (
        <div className="flex flex-col items-center text-center animate-in fade-in duration-700">
            {/* Badge */}
            <div className="mb-10 inline-flex items-center gap-3 rounded-full border-2 border-olive/20 bg-olive/5 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-olive">
                <Sparkles size={18} />
                <span>Consultoria de Sabor</span>
            </div>

            {/* Title */}
            <h1 className="mb-8 max-w-2xl font-serif text-5xl font-bold leading-tight text-ink md:text-7xl">
                Vamos descobrir seu sabor?
            </h1>

            {/* Description */}
            <p className="mb-12 max-w-lg text-xl font-serif italic text-ink2 leading-relaxed">
                Responda a perguntas rápidas sobre seu paladar. Vamos indicar qual Kombucha combina mais com você.
            </p>

            {/* Illustration/Image Placeholder */}
            <div className="relative mb-14 h-64 w-64 md:h-80 md:w-80 opacity-90 mix-blend-multiply transition-all duration-1000">
                <Image
                    src="/images/illustrations/badges/caneca-simbolo.png"
                    alt="Ilustração Consultoria"
                    fill
                    className="object-contain"
                />
            </div>

            {/* CTA */}
            <button
                onClick={onStart}
                className="group relative flex h-20 w-full max-w-sm items-center justify-center gap-4 overflow-hidden rounded-full bg-olive text-paper shadow-xl transition-all hover:scale-105 active:scale-95 touch-target"
                aria-label="Começar a consultoria de sabor agora"
            >
                <span className="text-xl font-bold uppercase tracking-widest">Toque para Começar</span>
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={28} />
            </button>

            <div className="mt-8 text-sm font-bold text-ink/60 max-w-xs mx-auto text-center" role="note">
                ⓘ Não substitui orientação médica.
            </div>
        </div>
    );
}
