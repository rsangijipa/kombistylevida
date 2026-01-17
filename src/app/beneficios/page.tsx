import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { Heart, Activity, Zap, ShieldPlus, Brain } from "lucide-react";

export default function BeneficiosPage() {
    return (
        <SiteShell>
            <div className="mx-auto max-w-4xl pb-20">
                <header className="mb-12 text-center">
                    <h1 className="font-serif text-[40px] font-bold text-olive md:text-[56px]">
                        Benefícios
                    </h1>
                    <p className="mt-4 text-lg text-ink2 font-serif italic max-w-xl mx-auto">
                        Muito além do sabor: um brinde à sua microbiota.
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
                    {/* Benefit Cards */}
                    <div className="rounded-xl border border-ink/10 bg-paper p-6 hover:shadow-md transition-shadow">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/10 text-olive">
                            <Activity size={24} />
                        </div>
                        <h3 className="mb-2 font-serif text-xl font-bold text-ink">Saúde Intestinal</h3>
                        <p className="text-sm text-ink2 leading-relaxed">
                            Rica em probióticos e ácidos orgânicos que auxiliam no equilíbrio da flora intestinal, essencial para a digestão e absorção de nutrientes.
                        </p>
                    </div>

                    <div className="rounded-xl border border-ink/10 bg-paper p-6 hover:shadow-md transition-shadow">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber/20 text-ink">
                            <ShieldPlus size={24} />
                        </div>
                        <h3 className="mb-2 font-serif text-xl font-bold text-ink">Imunidade</h3>
                        <p className="text-sm text-ink2 leading-relaxed">
                            Um intestino saudável é a primeira linha de defesa do corpo. Os antioxidantes do chá também combatem radicais livres.
                        </p>
                    </div>

                    <div className="rounded-xl border border-ink/10 bg-paper p-6 hover:shadow-md transition-shadow">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/10 text-olive">
                            <Zap size={24} />
                        </div>
                        <h3 className="mb-2 font-serif text-xl font-bold text-ink">Energia Natural</h3>
                        <p className="text-sm text-ink2 leading-relaxed">
                            Contém vitaminas do complexo B e uma dose suave de cafeína do chá, proporcionando energia estável sem o "crash" do café.
                        </p>
                    </div>
                </div>

                {/* Layered Science - "Evidence Layer" */}
                <section className="rounded-[24px] bg-paper2/50 p-8 md:p-12 border border-ink/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Brain size={200} />
                    </div>

                    <h2 className="relative z-10 font-serif text-3xl font-bold text-olive mb-6">
                        O que a Ciência Diz?
                    </h2>

                    <div className="relative z-10 space-y-6 text-ink/80 leading-relaxed">
                        <p>
                            Estudos preliminares e a tradição milenar sugerem que a kombucha pode atuar como um modulador metabólico leve. O <strong>ácido acético</strong>, também presente no vinagre de maçã, tem sido associado ao controle dos níveis de açúcar no sangue.
                        </p>
                        <p>
                            Além disso, os <strong>polifenóis</strong> derivados do chá são potentes antioxidantes, protegendo as células contra o estresse oxidativo.
                        </p>

                        <div className="mt-8 p-4 rounded-lg bg-white/60 border border-ink/10 text-xs text-ink/60 italic">
                            <strong className="block text-ink mb-1 not-italic font-bold uppercase tracking-wider">Disclaimer Legal</strong>
                            A Kombucha é um alimento funcional, não um medicamento. Nossas alegações não substituem aconselhamento médico profissional. Os efeitos podem variar de pessoa para pessoa. Se você tem condições de saúde específicas, consulte seu médico.
                        </div>
                    </div>
                </section>
            </div>
        </SiteShell>
    );
}
