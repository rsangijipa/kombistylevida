"use client";

import React, { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { Loader2, Plus, Minus, Settings2 } from "lucide-react";
import { useInventoryRealtime } from "@/hooks/useInventoryRealtime";
import { useToast } from "@/context/ToastContext";

export default function InventoryPage() {
    return (
        <AuthProvider>
            <InventoryManager />
        </AuthProvider>
    );
}

function InventoryManager() {
    const { products, loading } = useInventoryRealtime();
    const toast = useToast();

    // DYNAMIC GRID: Derived purely from Realtime Firestore Data
    const inventoryItems = useMemo(() => {
        return products.flatMap(product => {
            if (product.variants && product.variants.length > 0) {
                return product.variants.map(v => ({
                    id: v.size === '300ml' ? product.id : `${product.id}::${v.size}`,
                    baseId: product.id,
                    name: product.name,
                    imageSrc: product.imageSrc,
                    size: v.size,
                    isVariant: true,
                    // Direct access to data since we are mapping from it
                    currentStock: v.stockQty || 0,
                    reserved: (product.reservedStock || 0), // Note: Reserved is usually per product, needing refinement if per variant
                }));
            }
            // Fallback for non-variant products
            return [{
                id: product.id,
                baseId: product.id,
                name: product.name,
                imageSrc: product.imageSrc,
                size: '300ml',
                isVariant: false,
                currentStock: product.stockQty || 0,
                reserved: (product.reservedStock || 0)
            }];
        });
    }, [products]);

    // Action State
    const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
    const [amount, setAmount] = useState(0);
    const [reason, setReason] = useState("");
    const [processing, setProcessing] = useState(false);

    // Find the item being edited for the modal (from dynamic list)
    const editingItem = useMemo(() =>
        selectedInventoryId ? inventoryItems.find(i => i.id === selectedInventoryId) : null,
        [selectedInventoryId, inventoryItems]);

    const handleSave = async () => {
        if (!selectedInventoryId || amount <= 0) return;

        const tid = toast.loading("Atualizando estoque...");
        setProcessing(true);

        try {
            const adminUid = "admin"; // In real usage, get from AuthContext

            // ID Parsing logic
            let finalProductId = selectedInventoryId;
            let finalVariantKey = '300ml';

            if (selectedInventoryId.includes("::")) {
                const parts = selectedInventoryId.split("::");
                finalProductId = parts[0];
                finalVariantKey = parts[1];
            } else if (editingItem?.size === '500ml') {
                finalVariantKey = '500ml';
            }

            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: finalProductId,
                    amount,
                    reason: reason || "Manual Adjustment",
                    type: actionType,
                    variantKey: finalVariantKey,
                    adminUid
                })
            });

            if (res.ok) {
                toast.removeToast(tid);
                toast.success("Estoque atualizado!");
                setAmount(0);
                setReason("");
                setSelectedInventoryId(null);
            } else {
                const txt = await res.text();
                throw new Error(txt);
            }
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            toast.removeToast(tid);
            toast.error("Erro ao atualizar", message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-ink">Estoque</h1>
                <p className="text-ink2">Gerencie a produção em tempo real.</p>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-olive">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {inventoryItems.map(item => {
                        // Current Stock is already in the item from the map
                        const currentStock = item.currentStock;
                        const reserved = item.reserved;
                        const available = currentStock - reserved;

                        return (
                            <div key={item.id} className="relative rounded-xl border border-ink/10 bg-white p-6 shadow-sm overflow-hidden group">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 items-center justify-center rounded-lg bg-paper2 p-1 hidden sm:flex border border-ink/5">
                                        {item.imageSrc ? (
                                            <img src={item.imageSrc} alt="" className="h-full w-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 rounded" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-ink text-lg leading-tight">{item.name}</h3>
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${item.size === '500ml' ? 'bg-purple-100 text-purple-700' : 'bg-ink/5 text-ink/50'}`}>
                                            {item.size}
                                        </span>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-ink/40 tracking-wider">Disponível</div>
                                                <div className={`text-2xl font-mono font-bold ${available < 5 ? "text-red-500" : "text-green-600"}`}>
                                                    {available}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[10px] uppercase font-bold text-ink/40 tracking-wider">Físico / Reservado</div>
                                                <div className="text-sm font-mono text-ink">
                                                    {currentStock} / <span className="text-amber-600">{reserved}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Overlay */}
                                <div className="mt-6 flex gap-2">
                                    <button
                                        onClick={() => { setSelectedInventoryId(item.id); setActionType('IN'); }}
                                        className="flex-1 rounded-lg bg-green-50 py-2 text-xs font-bold text-green-700 hover:bg-green-100 flex items-center justify-center gap-1"
                                    >
                                        <Plus size={14} /> Entrada
                                    </button>
                                    <button
                                        onClick={() => { setSelectedInventoryId(item.id); setActionType('OUT'); }}
                                        className="flex-1 rounded-lg bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100 flex items-center justify-center gap-1"
                                    >
                                        <Minus size={14} /> Saída
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {inventoryItems.length === 0 && (
                        <div className="col-span-full py-12 text-center text-ink/40 italic">
                            Nenhum produto encontrado. Cadastre produtos no banco.
                        </div>
                    )}
                </div>
            )}

            {/* Adjustment Modal */}
            {selectedInventoryId && editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-ink">
                                {actionType === 'IN' ? 'Entrada de Estoque' : actionType === 'OUT' ? 'Saída de Estoque' : 'Ajuste Manual'}
                            </h3>
                            <button onClick={() => setSelectedInventoryId(null)} className="p-2 hover:bg-gray-100 rounded-full"><Settings2 size={16} /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-6 bg-paper2 p-3 rounded-lg">
                            {editingItem.imageSrc && <img src={editingItem.imageSrc} alt="" className="w-12 h-12 object-contain" />}
                            <div>
                                <p className="font-bold text-ink">{editingItem.name}</p>
                                <p className="text-xs font-bold text-ink/50 uppercase">{editingItem.size}</p>
                            </div>
                        </div>

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
                                    onClick={() => setSelectedInventoryId(null)}
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
