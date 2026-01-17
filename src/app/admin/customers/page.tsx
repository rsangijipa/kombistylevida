"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { collection, query, orderBy, onSnapshot, limit, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Customer } from "@/types/firestore";
import { Search, Loader2, Users, Trash2 } from "lucide-react";

export default function CustomersPage() {
    return (
        <AuthProvider>
            <CustomersList />
        </AuthProvider>
    );
}

function CustomersList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const q = query(
            collection(db, "customers"),
            orderBy("lastOrderAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => d.data() as Customer);
            setCustomers(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching customers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (phone: string, name: string) => {
        if (confirm(`ATENÇÃO: Deseja realmente excluir ${name}?\n\nEsta ação é irreversível e remove os dados pessoais do cliente (LGPD).`)) {
            try {
                await deleteDoc(doc(db, "customers", phone));
                alert("Cliente removido com sucesso.");
            } catch (e) {
                console.error("Erro ao excluir", e);
                alert("Erro ao excluir cliente.");
            }
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Clientes</h1>
                    <p className="text-ink2">Base de clientes (CRM) com consentimento LGPD.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-lg border border-ink/10 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-olive w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-olive">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-paper2/50 text-xs font-bold uppercase tracking-wider text-ink/50">
                            <tr>
                                <th className="px-6 py-4">Nome / Tel</th>
                                <th className="px-6 py-4">Localização</th>
                                <th className="px-6 py-4">Pedidos</th>
                                <th className="px-6 py-4">LTV (R$)</th>
                                <th className="px-6 py-4">Último Pedido</th>
                                <th className="px-6 py-4">LGPD</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-ink2 italic">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.phone} className="hover:bg-paper2/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-ink">{c.name}</div>
                                            <div className="text-xs text-ink/60">{c.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-ink">{c.neighborhood || "-"}</div>
                                            <div className="text-xs text-ink/50 truncate max-w-[200px]">{c.address || ""}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-olive">
                                            {c.orderCount}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-ink">
                                            R$ {(c.lifetimeValueCents / 100).toFixed(2).replace(".", ",")}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-ink/70">
                                            {new Date(c.lastOrderAt).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(c.phone, c.name)}
                                                className="rounded p-2 text-ink/40 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                title="Excluir dados pessoais (LGPD)"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
