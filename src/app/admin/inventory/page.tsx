"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InventoryItem } from "@/types/firestore";
import { PRODUCTS as CATALOG } from "@/data/catalog";
import { Loader2, Plus, Minus, Settings2 } from "lucide-react";
import { adjustStock } from "@/services/inventoryService";

export default function InventoryPage() {
    return (
        <AuthProvider>
            <InventoryManager />
        </AuthProvider>
    );
}

function InventoryManager() {
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});

    // Action State
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
    const [amount, setAmount] = useState(0);
    const [reason, setReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
            const map: Record<string, InventoryItem> = {};
            snapshot.docs.forEach(doc => {
                map[doc.id] = doc.data() as InventoryItem;
            });
            setInventory(map);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!selectedProduct || amount <= 0) return;
        setProcessing(true);
        try {
            await adjustStock(selectedProduct, amount, reason || "Manual Adjustment", actionType);
            // Reset
            setAmount(0);
            setReason("");
            setSelectedProduct(null);
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar ajuste.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-ink">Estoque</h1>
                <p className="text-ink2">Gerencie a produção e disponibilidade.</p>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-olive">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {CATALOG.map(product => {
                        const inv = inventory[product.id] || { currentStock: 0, reservedStock: 0 };
                        const available = inv.currentStock - inv.reservedStock;

                        return (
                            <div key={product.id} className="relative rounded-xl border border-ink/10 bg-white p-6 shadow-sm overflow-hidden group">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 items-center justify-center rounded-lg bg-paper2 p-1 hidden sm:flex">
                                        <img src={product.imageSrc} alt="" className="h-full w-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-ink text-lg">{product.name}</h3>
                                        <p className="text-xs text-ink/60">{product.size}</p>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-ink/40 tracking-wider">Disponível</div>
                                                <div className={`text-2xl font-mono font-bold ${available < 5 ? "text-red-500" : "text-green-600"}`}>
                                                    {available}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[10px] uppercase font-bold text-ink/40 tracking-wider">Físico / Reservado</div>
                                                <div className="text-sm font-mono text-ink">
                                                    {inv.currentStock} / <span className="text-amber-600">{inv.reservedStock}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Overlay (visible on hover or always on mobile?) Let's make it always visible actions bottom */}
                                <div className="mt-6 flex gap-2">
                                    <button
                                        onClick={() => { setSelectedProduct(product.id); setActionType('IN'); }}
                                        className="flex-1 rounded-lg bg-green-50 py-2 text-xs font-bold text-green-700 hover:bg-green-100 flex items-center justify-center gap-1"
                                    >
                                        <Plus size={14} /> Produção (Entrada)
                                    </button>
                                    <button
                                        onClick={() => { setSelectedProduct(product.id); setActionType('OUT'); }}
                                        className="flex-1 rounded-lg bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100 flex items-center justify-center gap-1"
                                    >
                                        <Minus size={14} /> Perda/Saída
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Adjustment Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-ink">
                                {actionType === 'IN' ? 'Entrada de Estoque' : actionType === 'OUT' ? 'Saída de Estoque' : 'Ajuste Manual'}
                            </h3>
                            <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-full"><Settings2 size={16} /></button>
                        </div>

                        <p className="mb-4 text-sm text-ink2">
                            Produto: <span className="font-bold text-ink">{CATALOG.find(p => p.id === selectedProduct)?.name}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    autoFocus
                                    className="w-full rounded-lg border border-ink/10 bg-gray-50 p-3 text-lg font-bold outline-none focus:border-olive"
                                    value={amount}
                                    onChange={e => setAmount(parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Motivo</label>
                                <input
                                    type="text"
                                    placeholder={actionType === 'IN' ? "Produção do lote X" : "Quebra, consumo, etc"}
                                    className="w-full rounded-lg border border-ink/10 bg-gray-50 p-3 text-sm outline-none focus:border-olive"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex-1 rounded-lg border border-ink/10 py-3 text-sm font-bold text-ink/60 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={processing || amount <= 0}
                                    className={`flex-1 rounded-lg py-3 text-sm font-bold text-white shadow-lg ${actionType === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {processing ? "Salvando..." : "Confirmar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
