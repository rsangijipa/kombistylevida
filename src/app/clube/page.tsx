"use client";

import React from "react";
import { SiteShell } from "@/components/SiteShell";
import { Check, Star, Truck, Zap } from "lucide-react";
import Image from "next/image";

export default function SubscriptionPage() {
    const handleJoin = () => {
        const text = "Olá! Tenho interesse em ser Membro VIP do Clube Arikê 🌱. Como funciona?";
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
                        Clube Arikê
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

                {/* Subscription Form Section */}
                <div id="subscribe-form" className="bg-paper2 border-t-4 border-olive rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-2 text-center">
                            Monte sua Assinatura
                        </h2>
                        <p className="text-center text-ink2 mb-12">
                            Receba saúde em casa com a frequência que preferir.
                        </p>

                        <form onSubmit={(e) => { e.preventDefault(); alert("Funcionalidade em desenvolvimento! Em breve você poderá assinar diretamente por aqui."); handleJoin(); }} className="space-y-8">

                            {/* 1. Frequência */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-ink/40 mb-4">1. Escolha a Frequência</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="cursor-pointer">
                                        <input type="radio" name="freq" value="weekly" className="peer sr-only" />
                                        <div className="border border-ink/10 rounded-xl p-4 text-center hover:bg-white peer-checked:bg-olive peer-checked:text-white peer-checked:border-olive transition-all">
                                            <span className="block font-bold">Semanal</span>
                                            <span className="text-xs opacity-80">4 entregas/mês</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input type="radio" name="freq" value="biweekly" className="peer sr-only" defaultChecked />
                                        <div className="border border-ink/10 rounded-xl p-4 text-center hover:bg-white peer-checked:bg-olive peer-checked:text-white peer-checked:border-olive transition-all">
                                            <span className="block font-bold">Quinzenal</span>
                                            <span className="text-xs opacity-80">2 entregas/mês</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input type="radio" name="freq" value="monthly" className="peer sr-only" />
                                        <div className="border border-ink/10 rounded-xl p-4 text-center hover:bg-white peer-checked:bg-olive peer-checked:text-white peer-checked:border-olive transition-all">
                                            <span className="block font-bold">Mensal</span>
                                            <span className="text-xs opacity-80">1 entrega/mês</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* 2. Quantidade */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-ink/40 mb-4">2. Tamanho do Pack</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-ink/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-olive/30 transition-colors">
                                        <span className="text-2xl font-bold text-ink">Pack 6</span>
                                        <span className="text-sm text-ink2">300ml ou 500ml</span>
                                    </div>
                                    <div className="border border-ink/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-olive/30 transition-colors">
                                        <span className="text-2xl font-bold text-ink">Pack 12</span>
                                        <span className="text-sm text-ink2">Melhor Custo-Benefício</span>
                                        <span className="bg-amber text-[10px] font-bold px-2 py-0.5 rounded text-ink uppercase">Recomendado</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-olive text-white h-14 rounded-full font-bold uppercase tracking-widest hover:bg-olive/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                Continuar para Seleção de Sabores
                            </button>

                            <p className="text-center text-xs text-ink/40">
                                * Você será redirecionado para finalizar o cadastro.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
