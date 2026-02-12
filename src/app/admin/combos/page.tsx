"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { Combo } from "@/types/firestore";
import { Loader2, Save, ShoppingBag, Plus, Trash2, Edit2, X } from "lucide-react";
import { PRODUCTS as CATALOG } from "@/data/catalog";

// Helper Component for Icon
const SimpleIcon = ({ name, size }: { name: React.ComponentType<{ size?: number }>, size: number }) => {
    const Icon = name;
    return <Icon size={size} />;
};

export default function CombosPage() {
    return (
        <AuthProvider>
            <CombosManager />
        </AuthProvider>
    );
}

function CombosManager() {
    const [loading, setLoading] = useState(true);
    const [combos, setCombos] = useState<Combo[]>([]);
    // Global Save Loading State (e.g. toggling active)
    const [saving, setSaving] = useState<string | null>(null);

    // Edit Modal State
    const [editingCombo, setEditingCombo] = useState<Partial<Combo> | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [modalSaving, setModalSaving] = useState(false);

    const fetchCombos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/combos');
            if (res.ok) {
                const data = await res.json();
                setCombos(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCombos();
    }, []);

    const handleSaveCombo = async () => {
        if (!editingCombo || !editingCombo.name) return;
        setModalSaving(true);
        try {
            const res = await fetch('/api/admin/combos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCombo)
            });

            if (res.ok) {
                await fetchCombos();
                setEditingCombo(null);
            } else {
                alert("Erro ao salvar combo.");
            }
        } catch (e) {
            alert("Erro ao salvar combo.");
        } finally {
            setModalSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este combo?")) return;
        try {
            const res = await fetch(`/api/admin/combos?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchCombos();
        } catch (e) {
            alert("Erro ao excluir.");
        }
    };

    const toggleStatus = async (combo: Combo) => {
        const newStatus = !combo.active;
        // Optimistic UI
        setCombos(prev => prev.map(c => c.id === combo.id ? { ...c, active: newStatus } : c));

        try {
            await fetch('/api/admin/combos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: combo.id, active: newStatus })
            });
        } catch (e) {
            fetchCombos(); // Revert on error
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Combos & Kits</h1>
                    <p className="text-ink2">Gerencie ofertas especiais e descontos.</p>
                </div>
                <button
                    onClick={() => { setIsNew(true); setEditingCombo({ active: true, items: [] }); }}
                    className="bg-olive hover:bg-olive/90 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Novo Combo
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-olive"><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {combos.map(combo => (
                        <div key={combo.id} className={`relative rounded-xl border p-6 shadow-sm transition-all ${combo.active ? 'bg-white border-ink/10' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded bg-purple-50 p-2 text-purple-600 flex items-center justify-center">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-ink">{combo.name}</h3>
                                        <p className="text-xs text-ink/60">{combo.active ? 'Ativo' : 'Inativo'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setIsNew(false); setEditingCombo({ ...combo }); }} className="p-2 hover:bg-gray-100 rounded-lg text-ink/60">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(combo.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs text-ink/80 h-10 line-clamp-2">{combo.description}</p>

                                <div className="flex items-center justify-between border-t border-ink/5 pt-3">
                                    <span className="text-sm font-bold text-ink/60">
                                        {combo.size || '300ml'}
                                    </span>
                                    <span className="text-xs font-mono bg-ink/5 px-2 py-1 rounded">
                                        {(combo.items || []).reduce((acc, i) => acc + i.quantity, 0)} itens
                                    </span>
                                </div>

                                <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                                    <span className="text-sm font-bold text-purple-900">R$ {(combo.priceCents / 100).toFixed(2).replace('.', ',')}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={combo.active}
                                            onChange={() => toggleStatus(combo)}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Create Modal */}
            {editingCombo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold font-serif text-ink">{isNew ? 'Criar Novo Combo' : 'Editar Combo'}</h2>
                            <button onClick={() => setEditingCombo(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-ink/50 mb-1">Nome</label>
                                    <input
                                        className="w-full border rounded-lg p-2 font-bold"
                                        value={editingCombo.name || ''}
                                        onChange={e => setEditingCombo(p => ({ ...p!, name: e.target.value }))}
                                        placeholder="Ex: Kit Verão"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-ink/50 mb-1">Badge (Opcional)</label>
                                    <input
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={editingCombo.badge || ''}
                                        onChange={e => setEditingCombo(p => ({ ...p!, badge: e.target.value }))}
                                        placeholder="Ex: Mais Vendido"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-ink/50 mb-1">Descrição</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 text-sm h-24 resize-none"
                                        value={editingCombo.description || ''}
                                        onChange={e => setEditingCombo(p => ({ ...p!, description: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink/50 mb-1">Tamanho Garrafas</label>
                                        <select
                                            className="w-full border rounded-lg p-2 font-bold bg-white"
                                            value={editingCombo.size || '300ml'}
                                            onChange={e => setEditingCombo(p => ({ ...p!, size: e.target.value as Combo["size"] }))}
                                        >
                                            <option value="300ml">300ml</option>
                                            <option value="500ml">500ml</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink/50 mb-1">Preço Total (R$)</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2 font-bold text-olive"
                                            value={(editingCombo.priceCents || 0) / 100}
                                            onChange={e => setEditingCombo(p => ({ ...p!, priceCents: Math.round(parseFloat(e.target.value) * 100) }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-ink/20">
                                <h3 className="font-bold text-ink mb-3 flex items-center gap-2">
                                    <ShoppingBag size={18} /> Itens do Combo
                                </h3>

                                <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                                    {(editingCombo.items || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border shadow-sm">
                                            <div className="flex-1 font-bold text-sm text-ink truncate">
                                                {CATALOG.find(p => p.id === item.productId)?.name || item.productId}
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 border rounded p-1 text-center font-bold text-sm"
                                                value={item.quantity}
                                                onChange={e => {
                                                    const newItems = [...(editingCombo.items || [])];
                                                    newItems[idx].quantity = parseInt(e.target.value) || 1;
                                                    setEditingCombo(p => ({ ...p!, items: newItems }));
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const newItems = (editingCombo.items || []).filter((_, i) => i !== idx);
                                                    setEditingCombo(p => ({ ...p!, items: newItems }));
                                                }}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {(editingCombo.items || []).length === 0 && <div className="text-center text-xs text-ink/40 py-4">Nenhum item adicionado</div>}
                                </div>

                                <div className="flex gap-2 border-t pt-3">
                                    <select id="newItemSelect" className="flex-1 text-xs border rounded p-2">
                                        {CATALOG.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const select = document.getElementById('newItemSelect') as HTMLSelectElement;
                                            const pid = select.value;
                                            const existing = (editingCombo.items || []).find(i => i.productId === pid);
                                            if (existing) return alert("Item já adicionado!");

                                            setEditingCombo(p => ({
                                                ...p!,
                                                items: [...(p!.items || []), { productId: pid, quantity: 1 }]
                                            }));
                                        }}
                                        className="bg-ink text-white px-3 py-1 rounded text-xs font-bold hover:bg-ink/80"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                            <button onClick={() => setEditingCombo(null)} className="px-5 py-2 rounded-lg font-bold text-ink/60 hover:bg-gray-100">Cancelar</button>
                            <button
                                onClick={handleSaveCombo}
                                disabled={modalSaving}
                                className="px-5 py-2 rounded-lg font-bold bg-olive text-white hover:bg-olive/90 shadow-lg disabled:opacity-50"
                            >
                                {modalSaving ? 'Salvando...' : 'Salvar Combo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
