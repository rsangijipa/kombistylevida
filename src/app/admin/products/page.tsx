"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { Product } from "@/types/firestore";
import { getAllProducts, saveProduct, seedCatalog, toggleProductActive } from "@/services/catalogService";
import { Loader2, Edit, Plus, Eye, EyeOff, RefreshCw } from "lucide-react";

export default function ProductsPage() {
    return (
        <AuthProvider>
            <ProductManager />
        </AuthProvider>
    );
}

function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Product | null>(null);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await getAllProducts();
            setProducts(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleSeed = async () => {
        if (confirm("Isso irá sobrescrever os produtos no banco com o catálogo estático padrão. Continuar?")) {
            await seedCatalog();
            refresh();
        }
    };

    const handleToggle = async (p: Product) => {
        await toggleProductActive(p.id, !p.active);
        refresh();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        await saveProduct(editing);
        setEditing(null);
        refresh();
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Catálogo de Produtos</h1>
                    <p className="text-ink2">Edite preços, nomes e disponibilidade.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeed}
                        className="flex items-center gap-2 rounded-lg border border-ink/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-white"
                    >
                        <RefreshCw size={14} /> Sincronizar Padrão
                    </button>
                    <button
                        onClick={() => setEditing({
                            id: `new-${Date.now()}`,
                            name: "",
                            priceCents: 0,
                            active: true,
                            updatedAt: new Date().toISOString()
                        })}
                        className="flex items-center gap-2 rounded-lg bg-olive px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-olive/90"
                    >
                        <Plus size={14} /> Novo Produto
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-olive">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.map(p => (
                        <div key={p.id} className={`group relative flex gap-4 rounded-xl border p-4 transition-all ${p.active ? "border-ink/10 bg-white" : "border-ink/5 bg-gray-50 opacity-75"}`}>
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-paper2 p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {p.imageSrc ? <img src={p.imageSrc} alt="" className="h-full w-full object-contain" /> : <div className="h-full w-full bg-gray-200" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-ink">{p.name || "(Sem Nome)"}</h3>
                                    <button onClick={() => handleToggle(p)} className="text-ink/40 hover:text-ink">
                                        {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-ink/60 line-clamp-1">{p.shortDesc}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="font-mono text-lg font-bold text-olive">
                                        R$ {(p.priceCents / 100).toFixed(2).replace('.', ',')}
                                    </span>
                                    {p.size && <span className="text-xs font-bold text-ink/40 uppercase bg-gray-100 px-1 rounded">{p.size}</span>}
                                </div>
                            </div>

                            <button
                                onClick={() => setEditing(p)}
                                className="absolute bottom-4 right-4 rounded-full bg-white p-2 text-ink shadow-sm ring-1 ring-black/5 hover:bg-paper2"
                            >
                                <Edit size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <form onSubmit={handleSave} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-xl text-ink">Editar Produto</h3>
                            <button type="button" onClick={() => setEditing(null)}><Plus size={24} className="rotate-45 text-ink/50" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold uppercase text-ink/50">Nome</label>
                                <input className="w-full rounded border p-2 font-bold" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-ink/50">Preço (Centavos)</label>
                                <input type="number" className="w-full rounded border p-2" value={editing.priceCents} onChange={e => setEditing({ ...editing, priceCents: parseInt(e.target.value) })} required />
                                <div className="text-xs text-right text-ink/40 mt-1">R$ {(editing.priceCents / 100).toFixed(2)}</div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-ink/50">Volume/Tamanho</label>
                                <input className="w-full rounded border p-2" value={editing.size || ""} onChange={e => setEditing({ ...editing, size: e.target.value })} />
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold uppercase text-ink/50">Descrição Curta</label>
                                <input className="w-full rounded border p-2" value={editing.shortDesc || ""} onChange={e => setEditing({ ...editing, shortDesc: e.target.value })} />
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold uppercase text-ink/50">URL da Imagem</label>
                                <input className="w-full rounded border p-2 text-xs font-mono" value={editing.imageSrc || ""} onChange={e => setEditing({ ...editing, imageSrc: e.target.value })} />
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold uppercase text-ink/50">ID (Slug)</label>
                                <input className="w-full rounded border p-2 text-xs font-mono bg-gray-50" value={editing.id} onChange={e => setEditing({ ...editing, id: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border py-3 font-bold hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="flex-1 rounded-lg bg-olive py-3 font-bold text-white shadow-lg hover:bg-olive/90">Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
