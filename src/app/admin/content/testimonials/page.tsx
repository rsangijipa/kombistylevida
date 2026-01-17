"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Testimonial } from "@/types/firestore";
import { getAllTestimonials, saveTestimonial, updateTestimonialStatus, deleteTestimonial } from "@/services/contentService";
import { Loader2, Plus, Trash2, CheckCircle, XCircle, Star, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export default function TestimonialsPage() {
    return (
        <AuthProvider>
            <TestimonialManager />
        </AuthProvider>
    );
}

function TestimonialManager() {
    const { user } = useAuth();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    // Form and Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        loadData();
    }, [tab]);

    async function loadData() {
        setLoading(true);
        const data = await getAllTestimonials(tab); // Service supports filtering
        setTestimonials(data);
        setLoading(false);
    }

    // Actions
    async function handleApprove(id: string) {
        if (!confirm("Aprovar este depoimento para exibição pública?")) return;
        if (!user?.uid) return;
        await updateTestimonialStatus(id, 'APPROVED', user.uid);
        loadData();
    }

    async function handleReject(id: string) {
        // Just opens modal
        setRejectId(id);
        setRejectReason("");
    }

    async function submitReject() {
        if (!rejectId || !user?.uid) return;
        if (!rejectReason.trim()) return alert("Informe o motivo da rejeição.");

        await updateTestimonialStatus(rejectId, 'REJECTED', user.uid, rejectReason);
        setRejectId(null);
        loadData();
    }

    async function handleManualSave(newItem: Partial<Testimonial>) {
        if (!user?.uid) return;
        // Construct full object
        const t: Testimonial = {
            id: `tm_${Date.now()}`,
            displayName: newItem.displayName || "Anônimo",
            role: newItem.role || "Cliente",
            text: newItem.text || "",
            rating: newItem.rating || 5,
            source: newItem.source || 'WHATSAPP',
            consent: { granted: true, at: new Date().toISOString() }, // Manual entry implies consent check
            status: 'APPROVED', // Auto-approve manual entries
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            approvedBy: { uid: user.uid, name: "Admin (Manual)" },
            approvedAt: new Date().toISOString()
        };

        await saveTestimonial(t, user.uid);
        setIsFormOpen(false);
        // If we added manual, it goes to APPROVED, so if we are on PENDING we won't see it immediately unless we switch
        if (tab !== 'APPROVED') setTab('APPROVED');
        else loadData();
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink">Depoimentos</h1>
                        <p className="text-ink2">Moderação e entrada manual.</p>
                    </div>
                    <button onClick={() => setIsFormOpen(true)} className="bg-olive text-white px-4 py-2 rounded-lg font-bold hover:bg-olive/90 flex items-center gap-2">
                        <Plus size={18} /> Manual (WhatsApp)
                    </button>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 mb-6 border-b pb-1">
                    {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                                tab === t ? "border-olive text-olive" : "border-transparent text-ink/50 hover:text-ink"
                            )}
                        >
                            {t === 'PENDING' && <AlertTriangle size={14} />}
                            {t === 'APPROVED' && <CheckCircle size={14} />}
                            {t === 'REJECTED' && <XCircle size={14} />}
                            {t === 'PENDING' ? 'Pendentes' : t === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
                        </button>
                    ))}
                </div>

                {isFormOpen && (
                    <ManualEntryForm onClose={() => setIsFormOpen(false)} onSave={handleManualSave} />
                )}

                {/* Rejection Modal */}
                {rejectId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4 animate-in zoom-in-95">
                            <h3 className="font-bold text-lg text-ink">Motivo da Rejeição</h3>
                            <textarea
                                className="w-full border p-2 rounded h-24"
                                placeholder="Ex: Linguagem imprópria, spam..."
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setRejectId(null)} className="px-4 py-2 text-sm">Cancelar</button>
                                <button onClick={submitReject} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">Confirmar Rejeição</button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? <div className="text-center p-10"><Loader2 className="animate-spin inline" /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testimonials.length === 0 && (
                            <div className="col-span-full py-12 text-center text-ink/40 italic">Nenhum depoimento nesta aba.</div>
                        )}
                        {testimonials.map(tm => (
                            <TestimonialCard
                                key={tm.id}
                                tm={tm}
                                onApprove={() => handleApprove(tm.id)}
                                onReject={() => handleReject(tm.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// Sub-components for cleaner file

function ManualEntryForm({ onClose, onSave }: { onClose: () => void, onSave: (data: Partial<Testimonial>) => void }) {
    const [data, setData] = useState<Partial<Testimonial>>({ rating: 5, source: 'WHATSAPP' });

    return (
        <div className="bg-white p-6 rounded-xl border border-olive/20 shadow-lg mb-8 animate-in slide-in-from-top-2">
            <h3 className="font-bold text-lg mb-4 text-olive">Adicionar Depoimento Manual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs font-bold uppercase text-ink/50">Nome do Cliente</label>
                    <input className="w-full border p-2 rounded" value={data.displayName || ""} onChange={e => setData({ ...data, displayName: e.target.value })} />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-ink/50">Contexto (Role)</label>
                    <input className="w-full border p-2 rounded" placeholder="Ex: Cliente Mensal" value={data.role || ""} onChange={e => setData({ ...data, role: e.target.value })} />
                </div>
            </div>

            <div className="mb-4">
                <label className="text-xs font-bold uppercase text-ink/50">Texto</label>
                <textarea className="w-full border p-2 rounded h-24" value={data.text || ""} onChange={e => setData({ ...data, text: e.target.value })} />
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm font-bold">
                        Nota:
                        <select className="border p-1 rounded" value={data.rating} onChange={e => setData({ ...data, rating: parseInt(e.target.value) })}>
                            <option value="5">5</option>
                            <option value="4">4</option>
                            <option value="3">3</option>
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold">
                        Fonte:
                        <select className="border p-1 rounded text-xs" value={data.source} onChange={e => setData({ ...data, source: e.target.value as Testimonial['source'] })}>
                            <option value="WHATSAPP">WhatsApp</option>
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="PRESENCIAL">Presencial</option>
                        </select>
                    </label>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-ink/60 hover:underline">Cancelar</button>
                    <button onClick={() => onSave(data)} className="bg-olive text-white px-4 py-2 rounded font-bold hover:bg-olive/90">Salvar & Aprovar</button>
                </div>
            </div>
        </div>
    );
}

function TestimonialCard({ tm, onApprove, onReject }: { tm: Testimonial, onApprove: () => void, onReject: () => void }) {
    return (
        <div className={cn("p-4 rounded-xl border flex flex-col gap-3 transition-all", tm.status === 'PENDING' ? "bg-amber-50 border-amber-100" : "bg-white border-ink/10")}>
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-ink/5 flex items-center justify-center text-ink font-bold text-sm uppercase">
                        {tm.displayName[0]}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-ink">{tm.displayName}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-ink/50 uppercase tracking-wide">
                            <span>{tm.source}</span> • <span>{new Date(tm.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex text-amber-400 text-xs">
                    {Array(tm.rating || 5).fill(0).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
            </div>

            <blockquote className="text-sm text-ink/80 italic bg-white/50 p-3 rounded relative min-h-[4rem]">
                "{tm.text}"
            </blockquote>

            {tm.status === 'REJECTED' && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <strong>Motivo:</strong> {tm.rejectedReason}
                </div>
            )}

            <div className="mt-auto pt-3 border-t border-black/5 flex justify-end gap-2">
                {tm.status === 'PENDING' && (
                    <>
                        <button onClick={onReject} className="flex-1 py-2 rounded bg-white text-red-600 border border-red-100 font-bold text-xs hover:bg-red-50">
                            Rejeitar
                        </button>
                        <button onClick={onApprove} className="flex-1 py-2 rounded bg-green-600 text-white font-bold text-xs hover:bg-green-700 shadow-sm">
                            Aprovar
                        </button>
                    </>
                )}
                {tm.status === 'APPROVED' && (
                    <button onClick={onReject} className="text-xs text-red-400 hover:text-red-600 underline">Revogar</button>
                )}
            </div>
        </div>
    );
}
