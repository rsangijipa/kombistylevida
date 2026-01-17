import React from "react";

export function Faq() {
    const items = [
        { q: "O que é kombucha?", a: "Kombucha é uma bebida fermentada a partir de chá adoçado e uma cultura simbiótica (SCOBY), resultando em acidez suave, aroma e carbonatação natural." },
        { q: "Como devo conservar?", a: "Manter refrigerada. Ao abrir, consumir preferencialmente em poucos dias. Evite calor e agitação excessiva para preservar a carbonatação." },
        { q: "Sedimentos são normais?", a: "Sim. Sedimentos podem ocorrer por leveduras e subprodutos naturais da fermentação. Não indica defeito, desde que o cheiro e sabor estejam adequados." },
    ];

    return (
        <div className="mx-auto mt-8 flex max-w-[700px] flex-col gap-5">
            {items.map((it, idx) => (
                <details key={idx} className="group open:pb-4">
                    {/* 
             Pill Style Summary
             - bg-faq
             - rounded-full 
             - no heavy borders
          */}
                    <summary className="flex cursor-pointer list-none items-center gap-4 rounded-full bg-faq px-6 py-4 text-[17px] font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all hover:brightness-[1.02] group-open:shadow-none items-center">
                        {/* Ornamento lateral esquerdo */}
                        <Orn className="h-4 w-4 text-ink/50 transition-transform group-hover:text-ink/70" />

                        <span className="font-serif tracking-wide text-ink font-semibold">{it.q}</span>

                        {/* Chevron direito discreto */}
                        <span className="ml-auto text-ink/40 transition-transform duration-300 group-open:rotate-180">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 4l4 4 4-4" />
                            </svg>
                        </span>
                    </summary>
                    <div className="animate-in fade-in slide-in-from-top-1 px-8 pt-4 text-[16px] leading-relaxed text-ink2/90 font-serif">
                        {it.a}
                    </div>
                </details>
            ))}
        </div>
    );
}

function Orn({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm1-4c-3.31 0-6-2.69-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4v2c2.21 0 4 1.79 4 4s-1.79 4-4 4z" fill="currentColor" fillOpacity="0.4" />
        </svg>
    );
}
