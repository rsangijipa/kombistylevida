import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { Sun, Moon, AlertTriangle, CheckCircle } from "lucide-react";

export default function ComoConsumirPage() {
    return (
        <SiteShell>
            <div className="mx-auto max-w-3xl pb-20">
                <header className="mb-12 text-center">
                    <h1 className="font-serif text-[40px] font-bold text-olive md:text-[56px]">
                        Guia de Consumo
                    </h1>
                    <p className="mt-4 text-lg text-ink2 font-serif italic max-w-xl mx-auto">
                        Dicas para aproveitar o melhor da sua Kombistyle Vida.
                    </p>
                </header>

                <div className="space-y-12">
                    {/* Section 1: When to drink */}
                    <section>
                        <h2 className="mb-6 font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2">
                            Qual a melhor hora?
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex gap-4">
                                <Sun className="text-amber flex-shrink-0" size={32} />
                                <div>
                                    <h3 className="font-bold text-olive">Pela Manhã</h3>
                                    <p className="text-sm text-ink2 mt-1">
                                        Em jejum ou junto com o café da manhã para ativar o metabolismo e despertar o sistema digestivo.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Moon className="text-olive flex-shrink-0" size={32} />
                                <div>
                                    <h3 className="font-bold text-olive">À Tarde/Noite</h3>
                                    <p className="text-sm text-ink2 mt-1">
                                        Substitua o refrigerante ou a cerveja do happy hour. Ótima para a digestão após refeições pesadas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Storage */}
                    <section className="bg-paper2/50 p-6 rounded-xl border border-ink/10">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-amber" size={24} />
                            <h2 className="font-serif text-xl font-bold text-ink">
                                Armazenamento é Vital
                            </h2>
                        </div>
                        <ul className="space-y-3 text-sm text-ink2">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <span><strong>Sempre Refrigerada:</strong> Mantenha entre 2°C e 8°C. Fora da geladeira, ela continua fermentando e pode azedar ou estourar a garrafa.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <span><strong>Não Agite:</strong> É naturalmente gaseificada. Se agitar, pode espumar muito ao abrir.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <span><strong>Validade:</strong> Fechada: 3 a 4 meses. Aberta: Consumir em até 2 dias para manter o gás e sabor.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 3: FAQ Short */}
                    <section>
                        <h2 className="mb-6 font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2">
                            Dúvidas Comuns
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-ink text-sm">Tem álcool?</h4>
                                <p className="text-sm text-ink2">Pode conter traços (menos de 0,5%) devido à fermentação natural, similar a um suco de uva maduro ou pão de fermentação natural. Não é alcoólico.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-ink text-sm">Tem açúcar?</h4>
                                <p className="text-sm text-ink2">Sim, o açúcar é o alimento da cultura. Porém, a maior parte é consumida durante a fermentação. O residual é baixo, tornando a bebida menos calórica que refrigerantes.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </SiteShell>
    );
}
