import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { Calendar } from "lucide-react";
import Image from "next/image";

const NEWS = [
    {
        id: 1,
        title: "Kombistyle Vida agora em 4 novos pontos de venda",
        date: "14 Jan 2026",
        excerpt: "Estamos expandindo! Encontre nossas garrafas no Empório Natural, Mercadinho da Vila e mais dois locais parceiros.",
        image: "/images/news-expansion.jpg"
    },
    {
        id: 2,
        title: "Por que fermentação lenta faz diferença?",
        date: "02 Jan 2026",
        excerpt: "Explicamos o nosso processo de 14 dias e como ele garante mais sabor e menos acidez avinagrada.",
        image: "/images/news-fermentation.jpg"
    },
    {
        id: 3,
        title: "Lançamento: Kit Imunidade para o Verão",
        date: "20 Dez 2025",
        excerpt: "Uma combinação especial de gengibre e cúrcuma para manter sua saúde em dia neste calor.",
        image: "/images/news-summer.jpg"
    }
];

export default function NoticiasPage() {
    return (
        <SiteShell>
            <div className="mx-auto max-w-4xl pb-20">
                <header className="mb-12 text-center">
                    <h1 className="font-serif text-[40px] font-bold text-olive md:text-[56px]">
                        Notícias & Blog
                    </h1>
                    <p className="mt-4 text-lg text-ink2 font-serif italic max-w-xl mx-auto">
                        Novidades frescas, direto da nossa cozinha.
                    </p>
                </header>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {NEWS.map((item) => (
                        <article key={item.id} className="group overflow-hidden rounded-xl border border-ink/10 bg-paper transition-all hover:shadow-md hover:bg-paper2/50 cursor-pointer">
                            <div className="aspect-video relative bg-ink/5">
                                {/* Placeholder for images if not present, generic pattern */}
                                <div className="absolute inset-0 opacity-10 bg-[url('/images/paper-texture.png')] mix-blend-multiply" />
                                <div className="absolute inset-0 flex items-center justify-center text-ink/20 font-serif italic">
                                    [Imagem do Post]
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/40">
                                    <Calendar size={12} />
                                    {item.date}
                                </div>
                                <h3 className="mb-3 font-serif text-xl font-bold text-ink group-hover:text-olive transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-ink2 leading-relaxed">
                                    {item.excerpt}
                                </p>
                                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-olive group-hover:underline">
                                    Ler mais &rarr;
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </SiteShell>
    );
}
