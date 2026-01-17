"use client";

import React from "react";
import { ResultCategory } from "@/data/quizFull";
import { buildWhatsAppShareLink } from "@/lib/whatsappQuiz";
import { Send, AlertTriangle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FLAVORS } from "@/data/flavors";

interface QuizResultProps {
    result: ResultCategory;
}

export function QuizResult({ result }: QuizResultProps) {
    const isSafety = result.id === 'safety';
    const whatsappLink = buildWhatsAppShareLink(result);

    // Get flavor details if not safety override
    const recommendedFlavors = isSafety ? [] : FLAVORS.filter(f => result.flavors.includes(f.id));

    return (
        <div className="animate-fade-in-up text-center h-full flex flex-col items-center">

            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 ${isSafety ? "bg-red-100 text-red-800" : "bg-olive/10 text-olive"}`}>
                {isSafety ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                {isSafety ? "Recomendação de Segurança" : "Perfil Identificado"}
            </div>

            <h2 className="font-serif text-3xl md:text-5xl font-bold text-ink mb-4 leading-tight">
                {result.title}
            </h2>

            <p className="font-serif text-ink2 text-lg italic mb-8 max-w-lg mx-auto leading-relaxed">
                {result.description}
            </p>

            <div className={`w-full p-8 rounded-2xl border mb-10 ${result.color} relative overflow-hidden`}>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    {/* Icon/Badge Area */}
                    <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-paper shadow-sm border border-ink/5">
                        <span className="text-4xl">
                            {result.id === 'stable' ? '🌿' : result.id === 'moderate' ? '⚖️' : '🛡️'}
                        </span>
                    </div>

                    <div className="text-left flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Diagnóstico</div>
                        <h3 className="font-serif text-xl font-bold text-ink mb-2">Por que este perfil?</h3>
                        <p className="text-sm text-ink2/90 leading-relaxed max-w-sm">
                            {result.id === 'stable' && "Você já tem familiaridade com fermentados e seu sistema é robusto. Pode explorar sabores intensos."}
                            {result.id === 'moderate' && "Você busca equilíbrio. Sabores frutados e botânicos são ideais para manter sua rotina leve."}
                            {result.id === 'gentle' && "Seu sistema pede suavidade. Começamos com uva e frutas vermelhas para uma adaptação tranquila."}
                            {result.id === 'safety' && "Sua saúde é prioridade. Neste momento, é melhor evitar fermentados vivos sem orientação médica."}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-ink/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Dose Recomendada</span>
                    <span className="font-serif font-bold text-lg text-ink bg-paper/50 px-4 py-1 rounded-full border border-ink/5">
                        {result.dosage}
                    </span>
                </div>
            </div>

            {/* Flavor Suggestions (if safe) */}
            {!isSafety && recommendedFlavors.length > 0 && (
                <div className="mb-10 w-full">
                    <div className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-4">Sabores Sugeridos</div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {recommendedFlavors.map(flavor => (
                            <div key={flavor.id} className="flex items-center gap-3 bg-paper p-2 pr-4 rounded-full border border-ink/10 shadow-sm">
                                <div className="relative w-10 h-10 bg-paper2 rounded-full overflow-hidden">
                                    <Image src={flavor.imageSrc} alt={flavor.title} fill className="object-cover p-1" />
                                </div>
                                <span className="font-serif font-bold text-ink text-sm">{flavor.title.replace("\n", " ")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-auto w-full space-y-3">
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-white font-bold uppercase tracking-widest hover:brightness-105 transition-all shadow-md active:scale-95"
                >
                    <Send size={18} />
                    Compartilhar Resultado
                </a>

                <Link
                    href="/menu"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-4 text-ink font-bold uppercase tracking-widest hover:bg-ink/5 transition-colors"
                >
                    Ver Menu Completo
                </Link>
            </div>

            {/* Compliance Footer */}
            <div className="mt-10 pt-6 border-t border-ink/10 text-left">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                    <p className="text-[10px] text-ink/70 leading-relaxed font-sans">
                        ⚠️ <strong>IMPORTANTE:</strong> Estas são recomendações gerais de bem-estar. Se você está grávida, lactante, imunossuprimido(a), tem doença gastrointestinal (SII, Crohn, etc.), diabetes descompensada, problemas renais/hepáticos ou usa medicamentos, <strong>consulte um profissional de saúde</strong> antes de consumir. Interrompa se houver desconforto.
                    </p>
                </div>
            </div>
        </div>
    );
}
