import React from "react";

export function Faq() {
    const items = [
        { q: "O que é kombucha?", a: "Kombucha é uma bebida fermentada a partir de chá adoçado e uma cultura simbiótica (SCOBY), resultando em acidez suave, aroma e carbonatação natural." },
        { q: "Como devo conservar?", a: "Manter refrigerada. Ao abrir, consumir preferencialmente em poucos dias. Evite calor e agitação excessiva para preservar a carbonatação." },
        { q: "Sedimentos são normais?", a: "Sim. Sedimentos podem ocorrer por leveduras e subprodutos naturais da fermentação. Não indica defeito, desde que o cheiro e sabor estejam adequados." },
    ];

    return (
        <div className="mx-auto mt-6 max-w-3xl space-y-3">
            {items.map((it, idx) => (
                <details key={idx} className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full bg-faq px-5 py-3 text-[16px] text-ink shadow-print">
                        <span className="inline-flex h-5 w-5 items-center justify-center opacity-70">
                            <Orn />
                        </span>
                        <span className="font-serif">{it.q}</span>
                        <span className="ml-auto text-ink2/70 transition group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="px-6 pb-2 pt-3 text-[14px] text-ink2/85">
                        {it.a}
                    </div>
                </details>
            ))}
        </div>
    );
}

function Orn() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 12c4-6 8-6 12 0-4 6-8 6-12 0Z" fill="rgba(50,41,24,.18)" stroke="rgba(50,41,24,.35)" />
        </svg>
    );
}
