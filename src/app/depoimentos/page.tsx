import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
    {
        id: 1,
        name: "Mariana Costa",
        role: "Cliente fiel",
        text: "Eu nunca gostei de kombucha até provar a de Uva. Parece vinho frisante! Agora não fico sem o meu kit semanal."
    },
    {
        id: 2,
        name: "Carlos Eduardo",
        role: "Chef de Cozinha",
        text: "Uso a de Gengibre para harmonizar com meus pratos asiáticos. A acidez é perfeita e não tem aquele gosto forte de vinagre."
    },
    {
        id: 3,
        name: "Fernanda Lima",
        role: "Nutricionista",
        text: "Indico para todos os meus pacientes. Uma das poucas marcas que respeita o tempo de fermentação e usa ingredientes reais."
    },
    {
        id: 4,
        name: "Lucas Pereira",
        role: "Atleta",
        text: "Meu pós-treino favorito. Refrescante e me ajuda na recuperação. O atendimento pelo WhatsApp também é super ágil."
    }
];

export default function DepoimentosPage() {
    return (
        <SiteShell>
            <div className="mx-auto max-w-4xl pb-20">
                <header className="mb-12 text-center">
                    <h1 className="font-serif text-[40px] font-bold text-olive md:text-[56px]">
                        Quem Prova, Ama
                    </h1>
                    <p className="mt-4 text-lg text-ink2 font-serif italic max-w-xl mx-auto">
                        Histórias reais de quem transformou seus hábitos com Kombistyle.
                    </p>
                </header>

                <div className="mb-10 p-4 rounded-lg bg-amber/10 border border-amber/20 text-center text-sm text-ink2">
                    <strong className="text-olive uppercase tracking-wider text-xs block mb-1">Nota de Transparência</strong>
                    Depoimentos coletados de clientes reais com autorização de uso.
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {TESTIMONIALS.map((t) => (
                        <div key={t.id} className="relative rounded-2xl bg-paper2/50 p-8 border border-ink/5">
                            <Quote className="absolute top-6 left-6 text-olive/10" size={48} />

                            <p className="relative z-10 mb-6 font-serif text-lg text-ink italic leading-relaxed">
                                "{t.text}"
                            </p>

                            <div className="relative z-10 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-ink/10 flex items-center justify-center font-bold text-ink/40">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-ink">{t.name}</h4>
                                    <span className="text-xs text-ink/50 uppercase tracking-wider">{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SiteShell>
    );
}
