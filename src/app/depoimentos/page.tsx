"use client";

import React, { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { Quote, Plus, Star, Loader2, X, CheckCircle } from "lucide-react";
import { Testimonial } from "@/types/firestore";

export default function DepoimentosPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/testimonials');
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (e) {
            console.error("Failed to fetch", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SiteShell>
            <div className="mx-auto max-w-4xl pb-20 relative">
                <header className="mb-12 text-center">
                    <h1 className="font-serif text-[40px] font-bold text-olive md:text-[56px]">
                        Quem Prova, Ama
                    </h1>
                    <p className="mt-4 text-lg text-ink2 font-serif italic max-w-xl mx-auto">
                        Histórias reais de quem transformou seus hábitos com Kombucha Arikê.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-8 px-6 py-3 bg-olive text-paper rounded-full text-sm font-bold uppercase tracking-widest hover:bg-olive/90 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                    >
                        <Plus size={16} /> Deixe seu depoimento
                    </button>
                </header>

                <div className="mb-10 p-4 rounded-lg bg-amber/10 border border-amber/20 text-center text-sm text-ink2">
                    <strong className="text-olive uppercase tracking-wider text-xs block mb-1">Nota de Transparência</strong>
                    Depoimentos coletados de clientes reais com autorização de uso.
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-olive" size={40} />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {testimonials.length === 0 && (
                            <div className="col-span-2 text-center py-10 text-ink/40 italic">
                                Seja o primeiro a deixar um depoimento!
                            </div>
                        )}
                        {testimonials.map((t) => (
                            <div key={t.id} className="relative rounded-2xl bg-paper2/50 p-8 border border-ink/5 hover:border-olive/20 transition-colors">
                                <Quote className="absolute top-6 left-6 text-olive/10" size={48} />

                                <div className="relative z-10 mb-6">
                                    {t.rating && (
                                        <div className="flex gap-1 mb-2 text-amber">
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" />
                                            ))}
                                        </div>
                                    )}
                                    <p className="font-serif text-lg text-ink italic leading-relaxed">
                                        &ldquo;{t.text}&rdquo;
                                    </p>
                                </div>

                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-ink/10 flex items-center justify-center font-bold text-ink/40 text-sm">
                                        {t.displayName[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-ink">{t.displayName}</h4>
                                        <span className="text-xs text-ink/50 uppercase tracking-wider">{t.role || "Cliente"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit Modal */}
                {isModalOpen && <TestimonialModal onClose={() => setIsModalOpen(false)} />}
            </div>
        </SiteShell>
    );
}

function TestimonialModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        role: "", // Optional
        text: "",
        rating: 5
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.displayName || !formData.text) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStep('SUCCESS');
            } else {
                alert("Erro ao enviar. Tente novamente.");
            }
        } catch (e) {
            alert("Erro ao enviar.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-paper w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                {step === 'FORM' ? (
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-olive">Conte sua experiência</h2>
                            <button type="button" onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full text-ink/40 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">Seu Nome *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.displayName}
                                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-ink/10 bg-paper2/50 outline-none focus:border-olive transition-colors"
                                    placeholder="Como quer ser identificado?"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">Ocupação (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-ink/10 bg-paper2/50 outline-none focus:border-olive transition-colors"
                                    placeholder="Ex: Mãe, Atleta, Advogada..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">Seu Depoimento *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-ink/10 bg-paper2/50 outline-none focus:border-olive transition-colors resize-none"
                                    placeholder="O que você mais gosta na Kombucha Arikê?"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">Nota</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="text-amber hover:scale-110 transition-transform"
                                        >
                                            <Star size={24} fill={star <= formData.rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-olive text-paper rounded-xl font-bold uppercase tracking-widest hover:bg-olive/90 transition-colors disabled:opacity-50 flex justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "Enviar Depoimento"}
                            </button>
                            <p className="text-[10px] text-center text-ink/30 mt-3">
                                Ao enviar, você autoriza o uso do seu depoimento em nosso site.
                            </p>
                        </div>
                    </form>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-ink mb-2">Obrigado! ❤</h3>
                        <p className="text-ink/60 mb-8 max-w-xs mx-auto">
                            Seu depoimento foi enviado e aparecerá aqui assim que for aprovado por nossa equipe.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-full border border-ink/10 font-bold uppercase tracking-widest text-xs hover:bg-ink/5 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
