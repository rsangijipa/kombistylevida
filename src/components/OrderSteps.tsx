import React from "react";

export function OrderSteps() {
    const steps = [
        {
            num: "01",
            title: "Escolha seu Sabor",
            desc: "Navegue pelo menu e descubra nossas combinações únicas.",
        },
        {
            num: "02",
            title: "Peça no WhatsApp",
            desc: "Fale direto com a gente. Atendimento humano, sem robôs chatos.",
        },
        {
            num: "03",
            title: "Receba em Casa",
            desc: "Entregamos geladinho no conforto do seu lar. É só abrir e curtir.",
        },
    ];

    return (
        <div className="mx-auto max-w-4xl rounded-[22px] border border-ink/10 bg-paper2/50 px-6 py-10 md:px-12">
            <h3 className="mb-8 text-center font-serif text-[28px] font-semibold text-olive">
                Como funciona?
            </h3>
            <div className="grid gap-8 md:grid-cols-3">
                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber bg-amber/20 text-[18px] font-bold text-ink shadow-sm">
                            {s.num}
                        </div>
                        <h4 className="mb-2 font-serif text-[20px] font-bold text-ink">
                            {s.title}
                        </h4>
                        <p className="text-[15px] leading-relaxed text-ink2/80">
                            {s.desc}
                        </p>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <p className="text-[14px] text-ink/40 italic">
                    *Entregas disponíveis para a região metropolitana. Consulte taxas.
                </p>
            </div>
        </div>
    );
}
