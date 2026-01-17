"use client";

import React from "react";
import { BubblesOverlay } from "@/components/BubblesOverlay";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyCTA } from "@/components/StickyCTA";
import Image from "next/image";

interface SiteShellProps {
    children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
    return (
        <div
            className="min-h-screen w-full px-4 pb-8 md:px-6 md:pb-12 lg:pb-16"
        >
            {/* Nav Global - Fixed Viewport */}
            <TopNav />

            {/* Global Elements */}
            <StickyCTA />
            <CartDrawer />

            {/* 
        Container Principal (O Quadro)
        - Max-width restrito: 1040px
        - Relative + Overflow hidden
      */}
            <div className="relative mx-auto max-w-[1100px] overflow-hidden bg-paper2/95 min-h-[90vh] rounded-[32px] md:rounded-[48px] shadow-2xl mb-4 mt-0 md:mb-8 md:mt-0">



                {/* Camadas Decorativas Absolutas */}
                <BubblesOverlay />

                {/* Conteúdo Scrollável (dentro da moldura) */}
                <div className="relative z-10 px-4 pb-8 pt-0 md:px-12 md:pt-0">

                    <main>
                        {children}
                    </main>

                    {/* FOOTER GLOBAL */}
                    <footer id="contato-footer" className="mt-20 md:mt-24 mx-auto max-w-2xl text-center pb-8 border-t border-ink/5 pt-12">
                        <div className="rounded-[28px] border border-ink/10 bg-paper p-10 shadow-paper relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                            {/* Decorative Corner */}
                            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-ink/10 rounded-tl-[28px]" />
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-ink/10 rounded-br-[28px]" />

                            <h3 className="mb-4 font-serif text-3xl text-ink font-bold">Fale com a gente</h3>
                            <p className="mb-8 text-lg text-ink2/90 font-serif leading-relaxed">
                                Para pedidos, dúvidas ou parcerias. Bebida artesanal feita com tempo e carinho.
                            </p>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                                <a href="https://instagram.com/kombistylevida" target="_blank" rel="noreferrer" className="flex h-[48px] items-center gap-2 font-bold uppercase tracking-widest text-[11px] text-ink hover:text-amber transition-colors touch-target px-4 border border-transparent md:border-none rounded-full md:rounded-none bg-paper2 md:bg-transparent w-full md:w-auto justify-center">
                                    Instagram
                                </a>
                                <span className="hidden md:block text-ink/20">|</span>
                                <a href="https://wa.me/5599999999999" target="_blank" rel="noreferrer" className="flex h-[48px] items-center gap-2 font-bold uppercase tracking-widest text-[11px] text-ink hover:text-amber transition-colors touch-target px-4 border border-transparent md:border-none rounded-full md:rounded-none bg-paper2 md:bg-transparent w-full md:w-auto justify-center">
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Selo de Origem */}
                        <div className="mt-12 mb-6 grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100 hover:scale-105 transform cursor-pointer">
                            <Link href="/como-fazemos">
                                <div className="relative mx-auto h-[100px] w-[100px] md:h-[120px] md:w-[120px]">
                                    <Image
                                        src="/images/illustrations/badges/feito-em-ariquemes.png"
                                        alt="Feito em Ariquemes - Rondônia"
                                        fill
                                        className="object-contain drop-shadow-md mix-blend-multiply"
                                    />
                                </div>
                            </Link>
                        </div>

                        <p className="text-xs md:text-sm text-ink/60 font-serif tracking-wide">
                            © 2026 Kombucha Arikê. Todos os direitos reservados.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <Link href="/admin" className="text-[10px] text-ink/30 hover:text-ink/60 font-bold uppercase tracking-widest transition-colors border-b border-transparent hover:border-ink/20 pb-0.5">
                                Área Administrativa
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
