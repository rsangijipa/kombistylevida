"use client";

import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { Check, Star, Truck, Zap } from "lucide-react";
import Image from "next/image";

export default function SubscriptionPage() {
    const handleJoin = () => {
        const text = "Olá! Tenho interesse em ser Membro VIP do Clube Kombistyle Vida 🌱. Como funciona?";
        const url = `https://wa.me/5599999999999?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    return (
        <SiteShell>
            <div className="mx-auto max-w-4xl pb-24">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] text-amber uppercase border border-amber/30 rounded-full bg-amber/5">
                        Lançamento Exclusivo
                    </span>
                    <h1 className="font-serif text-[44px] leading-tight text-ink font-bold md:text-[64px] tracking-tight mb-6">
                        Clube Kombistyle Vida
                    </h1>
                    <p className="max-w-xl mx-auto text-ink2 text-lg font-serif italic leading-relaxed">
                        Garanta sua saúde em dia sem se preocupar em pedir toda semana. <br />
                        Benefícios exclusivos para quem vive o estilo natural.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16 px-4">
                    {/* Card 1 */}
                    <div className="bg-paper border border-ink/10 rounded-2xl p-8 hover:shadow-lg transition-all hover:border-olive/30 group">
                        <div className="h-12 w-12 rounded-full bg-olive/10 flex items-center justify-center text-olive mb-6 group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-ink mb-3">Prioridade na Produção</h3>
                        <p className="text-ink2/80 text-sm leading-relaxed">
                            Seu lote é reservado antes de todos. Nunca fique sem seus sabores favoritos, mesmo nos dias de alta demanda.
                        </p>
                    </div>

                    {/* Card 2 - Featured */}
                    <div className="bg-olive/5 border border-olive/20 rounded-2xl p-8 relative transform md:-translate-y-4 hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 bg-olive text-paper text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                            Melhor Escolha
                        </div>
                        <div className="h-12 w-12 rounded-full bg-olive flex items-center justify-center text-paper mb-6 shadow-lg shadow-olive/20">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-ink mb-3">Descontos Exclusivos</h3>
                        <p className="text-ink2/80 text-sm leading-relaxed mb-4">
                            Membros VIP têm tabela de preços diferenciada em todos os produtos, inclusive lançamentos e sazonais.
                        </p>
                        <ul className="space-y-2 mb-0">
                            <li className="flex items-center gap-2 text-sm text-ink font-medium">
                                <Check size={14} className="text-olive" /> 10% OFF em Packs
                            </li>
                            <li className="flex items-center gap-2 text-sm text-ink font-medium">
                                <Check size={14} className="text-olive" /> Brindes ocasionais
                            </li>
                        </ul>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-paper border border-ink/10 rounded-2xl p-8 hover:shadow-lg transition-all hover:border-olive/30 group">
                        <div className="h-12 w-12 rounded-full bg-amber/10 flex items-center justify-center text-amber mb-6 group-hover:scale-110 transition-transform">
                            <Truck size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-ink mb-3">Entrega Facilitada</h3>
                        <p className="text-ink2/80 text-sm leading-relaxed">
                            Agendamos suas entregas automaticamente. Você define a frequência e nós cuidamos do resto.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-ink rounded-[32px] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-olive/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-paper mb-6">
                            Faça parte da nossa comunidade
                        </h2>
                        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                            Assinatura simplificada: sem taxas de adesão, sem cancelamento complicado. Apenas o melhor da Kombucha na sua porta.
                        </p>
                        <button
                            onClick={handleJoin}
                            className="inline-flex items-center gap-3 bg-olive hover:bg-olive/90 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-olive/20"
                        >
                            Quero ser Membro VIP
                            <Star size={18} fill="currentColor" />
                        </button>
                        <p className="mt-6 text-white/30 text-xs uppercase tracking-widest">
                            Vagas limitadas para garantir a qualidade artesanal
                        </p>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
