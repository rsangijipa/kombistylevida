import React from "react";
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";

export function NewsEmptyState() {
    return (
        <div className="py-12 md:py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Visual Icon/Illustration */}
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-paper2 border border-ink/10 shadow-paper">
                <span className="text-4xl">✒️</span>
            </div>

            <h2 className="mb-4 font-serif text-3xl font-bold text-ink md:text-4xl text-olive">
                Nossas histórias estão fermentando...
            </h2>
            <p className="mx-auto mb-12 max-w-lg font-serif text-lg text-ink2/80 italic leading-relaxed">
                Estamos preparando conteúdos especiais sobre saúde, bem-estar e o universo da fermentação natural. Volte em breve!
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-24">
                <Link
                    href="/quiz"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-olive px-8 text-sm font-bold uppercase tracking-widest text-paper transition-all hover:bg-olive/90 hover:shadow-lg active:scale-95"
                >
                    Faça o Quiz
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="h-px w-8 bg-ink/10 sm:h-8 sm:w-px" />
                <a
                    href="https://instagram.com/kombistylevida"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 bg-paper px-8 text-sm font-bold uppercase tracking-widest text-ink transition-all hover:border-amber hover:text-amber active:scale-95"
                >
                    <Instagram size={16} />
                    Siga no Instagram
                </a>
            </div>

            {/* Editorial Placeholders (What's coming) */}
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-center gap-4 opacity-50">
                    <div className="h-px w-12 bg-ink/20" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-ink/60">Em Breve no Journal</span>
                    <div className="h-px w-12 bg-ink/20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-100 cursor-default">
                    {[
                        { title: "Desvendando o SCOBY", category: "Ciência" },
                        { title: "5 Benefícios para o Intestino", category: "Saúde" },
                        { title: "Receitas de Mocktails com Kombucha", category: "Estilo de Vida" }
                    ].map((item, i) => (
                        <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-paper2 shadow-sm border border-ink/10 p-6 flex flex-col justify-end text-left select-none">
                            <div className="mb-auto text-[10px] font-bold uppercase tracking-widest text-ink/30 border-b border-ink/5 pb-2">{item.category}</div>
                            <div className="w-8 h-8 rounded-full bg-ink/5 mb-4 flex items-center justify-center text-ink/20 font-serif font-bold italic">?</div>
                            <h3 className="font-serif text-xl font-bold text-ink/40 leading-tight group-hover:text-ink/60 transition-colors">{item.title}</h3>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
