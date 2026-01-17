"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Customer } from "@/types/firestore"; // Ensure this matches Updated type
import { adjustCustomerCredits } from "@/services/customerService";
import { Search, Plus, Minus, User as UserIcon, RefreshCw, Star } from "lucide-react";
import { cn } from "@/lib/cn";

export default function CustomersPage() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Adjustment Modal State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [adjustReason, setAdjustReason] = useState("");
    const [adjustValue, setAdjustValue] = useState(1);
    const [isAdjusting, setIsAdjusting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // For MVP, we fetch latest 50. Search enters separate flow?
            // Or just fetch all if small (<1000). Let's fetch 50 sorted by lastOrder.
            const q = query(collection(db, "customers"), orderBy("lastOrderAt", "desc"), limit(50));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => d.data() as Customer);
            setCustomers(data);
        } catch (e) {
            console.error("Failed to fetch customers", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustCredits = async (type: 'ADD' | 'REMOVE') => {
        if (!selectedCustomer || !user) return;
        setIsAdjusting(true);

        const delta = type === 'ADD' ? adjustValue : -adjustValue;
        const reason = adjustReason || "Ajuste manual administrativo";

        try {
            await adjustCustomerCredits(selectedCustomer.phone, delta, reason, user.uid);

            // Optimistic Update
            setCustomers(prev => prev.map(c =>
                c.phone === selectedCustomer.phone
                    ? { ...c, ecoPoints: (c.ecoPoints || 0) + delta }
                    : c
            ));

            // Reset Modal
            setSelectedCustomer(null);
            setAdjustReason("");
            setAdjustValue(1);

        } catch (e) {
            alert("Erro ao ajustar créditos.");
        } finally {
            setIsAdjusting(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-olive font-serif">Gestão de Clientes</h1>
                <button
                    onClick={fetchCustomers}
                    className="p-2 text-ink/50 hover:text-olive transition-colors"
                    title="Atualizar lista"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-paper focus:border-olive/50 outline-none transition-all"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-ink/40">Carregando clientes...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCustomers.map(customer => (
                        <div key={customer.phone} className="bg-paper border border-ink/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-olive/10 flex items-center justify-center text-olive font-bold">
                                        {customer.name?.[0]?.toUpperCase() || <UserIcon size={18} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-ink">{customer.name}</h3>
                                        <p className="text-xs text-ink/50">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-olive font-serif">
                                        {customer.ecoPoints || 0}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-ink/40">Créditos</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-ink/60 bg-paper2/50 p-2 rounded-lg mb-4">
                                <div>
                                    <span className="block font-bold text-ink">{customer.orderCount}</span>
                                    <span>Pedidos</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-ink">R$ {(customer.lifetimeValueCents / 100).toFixed(2).replace('.', ',')}</span>
                                    <span>Gasto Total</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedCustomer(customer);
                                        setAdjustValue(1);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-ink/10 hover:bg-olive/5 hover:border-olive/30 transition-colors text-xs font-bold uppercase tracking-wider text-ink/70"
                                >
                                    Gerenciar Pontos
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!user) return;
                                        const newState = !customer.isSubscriber;
                                        if (confirm(`Confirmar: ${newState ? "Tornar" : "Remover"} VIP para ${customer.name}?`)) {
                                            await import("@/services/customerService").then(m => m.toggleCustomerSubscription(customer.phone, newState, user.uid));
                                            // Optimistic
                                            setCustomers(prev => prev.map(c => c.phone === customer.phone ? { ...c, isSubscriber: newState } : c));
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors text-xs font-bold uppercase tracking-wider",
                                        customer.isSubscriber
                                            ? "bg-amber/10 border-amber/30 text-amber hover:bg-amber/20"
                                            : "border-ink/10 text-ink/30 hover:text-amber hover:border-amber/30"
                                    )}
                                    title={customer.isSubscriber ? "Remover VIP" : "Tornar VIP"}
                                >
                                    <Star size={16} fill={customer.isSubscriber ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredCustomers.length === 0 && !loading && (
                <div className="text-center py-12 text-ink/40 italic">
                    Nenhum cliente encontrado.
                </div>
            )}

            {/* Adjustment Modal (Simple Inline Overlay) */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-paper w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-ink mb-1">Ajustar Eco-Points</h3>
                        <p className="text-sm text-ink/60 mb-4">Cliente: <span className="font-bold">{selectedCustomer.name}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 block mb-1">Quantidade</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setAdjustValue(Math.max(1, adjustValue - 1))}
                                        className="h-10 w-10 rounded-lg border border-ink/10 flex items-center justify-center hover:bg-black/5"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <div className="flex-1 text-center font-bold text-2xl text-olive">{adjustValue}</div>
                                    <button
                                        onClick={() => setAdjustValue(adjustValue + 1)}
                                        className="h-10 w-10 rounded-lg border border-ink/10 flex items-center justify-center hover:bg-black/5"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 block mb-1">Motivo (Opcional)</label>
                                <input
                                    type="text"
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value)}
                                    placeholder="Ex: Devolução de 5 garrafas"
                                    className="w-full px-3 py-2 rounded-lg border border-ink/10 bg-white text-sm outline-none focus:border-olive"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => handleAdjustCredits('REMOVE')}
                                    disabled={isAdjusting}
                                    className="py-3 rounded-lg bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider hover:bg-red-200"
                                >
                                    Remover
                                </button>
                                <button
                                    onClick={() => handleAdjustCredits('ADD')}
                                    disabled={isAdjusting}
                                    className="py-3 rounded-lg bg-olive text-white font-bold text-xs uppercase tracking-wider hover:bg-olive/90"
                                >
                                    Adicionar
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="w-full py-2 text-xs text-ink/40 hover:text-ink font-bold uppercase tracking-wider mt-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
