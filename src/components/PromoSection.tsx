"use client";

import React from "react";
import { BUNDLES } from "@/data/catalog";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

export function PromoSection() {
    const { addBundle } = useCartStore();

    return (
        <section className="mx-auto max-w-[1000px] px-4 text-center">
            <div className="mb-10">
                <h2 className="font-serif text-[36px] font-semibold text-olive md:text-[42px]">
                    Combos & Promoções
                </h2>
                <div className="mt-4 h-[2px] w-12 mx-auto bg-amber rounded-full opacity-60" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {BUNDLES.map((bundle) => (
                    <div
                        key={bundle.id}
                        className="relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-ink/10 bg-yellow-50/50 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                    >
                        {/* Badge */}
                        {bundle.badge && (
                            <div className="absolute right-0 top-0 rounded-bl-[16px] bg-amber px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink shadow-sm">
                                {bundle.badge}
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="mb-2 font-serif text-[22px] font-bold text-ink leading-tight">
                                {bundle.name}
                            </h3>
                            <p className="text-[14px] leading-relaxed text-ink2/80">
                                {bundle.description}
                            </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-ink/5">
                            <div className="mb-4 font-serif text-[24px] font-bold text-olive">
                                R$ {(bundle.priceCents! / 100).toFixed(2).replace(".", ",")}
                            </div>
                            <button
                                onClick={() => addBundle(bundle.id)}
                                className="w-full rounded-full border border-ink/20 bg-white py-2.5 text-[13px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber hover:border-amber shadow-sm"
                            >
                                Adicionar Combo
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
