"use client";

import React from "react";
import { FrameChrome } from "@/components/FrameChrome";
import { BubblesOverlay } from "@/components/BubblesOverlay";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyCTA } from "@/components/StickyCTA";

interface SiteShellProps {
    children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
    return (
        <div className="min-h-screen w-full px-4 py-8 md:px-6 md:py-12 lg:py-16">

            {/* Global Elements */}
            <StickyCTA />
            <CartDrawer />

            {/* 
        Container Principal (O Quadro)
        - Max-width restrito: 1040px
        - Relative + Overflow hidden
      */}
            <div className="relative mx-auto max-w-[1040px] overflow-hidden rounded-frame bg-paper2/95 shadow-paper min-h-[85vh]">

                {/* Camadas Decorativas Absolutas */}
                <FrameChrome />
                <BubblesOverlay />

                {/* Conteúdo Scrollável (dentro da moldura) */}
                <div className="relative z-10 px-6 pb-16 pt-8 md:px-12 md:pt-10">

                    {/* NAV SECTION */}
                    <header className="mb-14">
                        <TopNav />
                    </header>

                    <main>
                        {children}
                    </main>

                    {/* FOOTER GLOBAL - Opcional, mantendo aqui para consistência */}
                    <footer id="contato-footer" className="mt-20 md:mt-24 mx-auto max-w-2xl text-center">
                        <div className="rounded-[22px] border border-ink/20 bg-paper p-8 shadow-sm">
                            <h3 className="mb-4 font-serif text-[24px] text-ink font-semibold">Fale com a gente</h3>
                            <p className="mb-6 text-[16px] text-ink2/80 font-serif">
                                Para pedidos, dúvidas ou parcerias. Bebida artesanal feita com tempo e carinho.
                            </p>
                            <div className="flex justify-center gap-6">
                                <a href="#" className="font-medium text-ink2 hover:text-ink hover:underline decoration-amber decoration-2 underline-offset-4">
                                    Instagram
                                </a>
                                <span className="text-ink/20">•</span>
                                <a href="#" className="font-medium text-ink2 hover:text-ink hover:underline decoration-amber decoration-2 underline-offset-4">
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                        <p className="mt-10 text-[13px] text-ink/40 font-serif italic tracking-wide">
                            © 2026 Kombistyle Vida. Todos os direitos reservados.
                        </p>
                        <div className="mt-4 flex justify-center">
                            <Link href="/admin" className="text-[11px] text-ink/40 hover:text-ink/80 font-bold uppercase tracking-widest transition-colors">
                                Área Administrativa
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
