"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/firestore";
import { Search, Loader2 } from "lucide-react";

export default function OrdersPage() {
    return (
        <AuthProvider>
            <OrdersList />
        </AuthProvider>
    );
}

function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Real-time listener for orders
        const q = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
            setOrders(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredOrders = orders.filter(o =>
        o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shortId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Pedidos</h1>
                    <p className="text-ink2">Acompanhe os pedidos em tempo real.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou ID..."
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
                                <th className="px-6 py-4">ID / Data</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Entrega</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-ink2 italic">
                                        Nenhum pedido encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-paper2/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold font-mono text-ink">#{order.shortId}</div>
                                            <div className="text-xs text-ink2">
                                                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                                {' '}
                                                {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-ink">{order.customer.name}</div>
                                            <div className="text-xs text-ink/60">{order.customer.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.customer.deliveryMethod === 'delivery' ? (
                                                <div>
                                                    <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 mb-1">
                                                        Entrega
                                                    </span>
                                                    <div className="text-xs text-ink truncate max-w-[150px]">
                                                        {order.schedule.date ? new Date(order.schedule.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'S/ Data'}
                                                        {' - '}
                                                        {order.schedule.slotLabel || '?'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">
                                                    Retirada
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-olive">
                                            R$ {(order.totalCents / 100).toFixed(2).replace(".", ",")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-xs font-bold text-olive hover:underline">
                                                Ver Detalhes
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'NEW': 'bg-blue-100 text-blue-800',
        'CONFIRMED': 'bg-purple-100 text-purple-800',
        'IN_PRODUCTION': 'bg-yellow-100 text-yellow-800',
        'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELED': 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
        'NEW': 'Novo',
        'CONFIRMED': 'Confirmado',
        'IN_PRODUCTION': 'Em Produção',
        'OUT_FOR_DELIVERY': 'Saiu p/ Entrega',
        'DELIVERED': 'Entregue',
        'CANCELED': 'Cancelado',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {labels[status] || status}
        </span>
    );
}
