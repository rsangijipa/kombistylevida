"use client";

import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Testimonial } from "@/types/firestore";
import { CheckCircle, XCircle, Trash2, User, Star, Loader2, Quote } from "lucide-react";
import { cn } from "@/lib/cn";

export default function AdminTestimonialsPage() {
    return (
        <AuthProvider>
            <AdminTestimonialsContent />
        </AuthProvider>
    );
}

function AdminTestimonialsContent() {
    const { user } = useAuth();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    useEffect(() => {
        fetchTestimonials();
    }, [filter]);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/testimonials?status=${filter}`);
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

    const handleStatusUpdate = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Confirmar status ${newStatus}?`)) return;

        try {
            const res = await fetch('/api/admin/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'UPDATE_STATUS',
                    id,
                    status: newStatus,
                    adminUid: user?.uid
                })
            });

            if (res.ok) {
                // Optimistic update - remove from list if we are in a specific filter view
                if (filter !== 'ALL') {
                    setTestimonials(prev => prev.filter(t => t.id !== id));
                } else {
                    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
                }
            }
        } catch (e) {
            alert("Falha ao atualizar status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja EXCLUIR este depoimento permanentemente?")) return;

        try {
            const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTestimonials(prev => prev.filter(t => t.id !== id));
            }
        } catch (e) {
            alert("Erro ao excluir");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-olive font-serif">Moderação de Depoimentos</h1>
                </div>

                {/* Filters */}
                <div className="flex gap-2 border-b border-ink/10 pb-1">
                    {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-colors border-b-2",
                                filter === f
                                    ? "border-olive text-olive bg-olive/5"
                                    : "border-transparent text-ink/40 hover:text-ink hover:bg-ink/5"
                            )}
                        >
                            {f === 'PENDING' ? 'Pendentes' :
                                f === 'APPROVED' ? 'Aprovados' :
                                    f === 'REJECTED' ? 'Rejeitados' : 'Todos'}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="py-20 text-center flex justify-center">
                        <Loader2 className="animate-spin text-olive" />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {testimonials.length === 0 && (
                            <div className="col-span-full py-20 text-center text-ink/40 italic">
                                Nenhum depoimento nesta lista.
                            </div>
                        )}

                        {testimonials.map(t => (
                            <div key={t.id} className="bg-paper border border-ink/5 rounded-xl p-6 shadow-sm relative group overflow-hidden">
                                <Quote className="absolute top-4 right-4 text-ink/5 rotate-180" size={40} />

                                <div className="relative z-10 mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-olive/10 flex items-center justify-center font-bold text-olive">
                                            {t.displayName[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-ink leading-tight">{t.displayName}</h3>
                                            <span className="text-[10px] uppercase tracking-widest text-ink/50">{t.role || "Cliente"}</span>
                                        </div>
                                    </div>

                                    {t.rating && (
                                        <div className="flex gap-1 mb-3 text-amber-500">
                                            {[...Array(t.rating || 5)].map((_, i) => (
                                                <Star key={i} size={12} fill="currentColor" />
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-sm text-ink/80 italic leading-relaxed">
                                        &ldquo;{t.text}&rdquo;
                                    </p>

                                    <div className="mt-4 text-[10px] text-ink/30 font-mono">
                                        Enviado em: {new Date(t.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t border-ink/5 pt-4 flex justify-between gap-2 mt-auto">
                                    <div className="flex gap-2 flex-1">
                                        {t.status !== 'APPROVED' && (
                                            <button
                                                onClick={() => handleStatusUpdate(t.id, 'APPROVED')}
                                                className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-200 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={14} /> Aprovar
                                            </button>
                                        )}
                                        {t.status !== 'REJECTED' && (
                                            <button
                                                onClick={() => handleStatusUpdate(t.id, 'REJECTED')}
                                                className="flex-1 py-2 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-200 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={14} /> Rejeitar
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="p-2 text-ink/30 hover:text-red-500 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
