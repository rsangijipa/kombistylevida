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

            <div className={`w-full p-6 rounded-xl border mb-10 ${result.color}`}>
                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Sua Faixa de Consumo</div>
                <div className="font-serif text-2xl font-bold text-ink">
                    {result.dosage}
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
