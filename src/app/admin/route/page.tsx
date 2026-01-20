"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/firestore";
import { Truck, CheckCircle, XCircle, Copy, MapPin } from "lucide-react";

export default function RoutePage() {
    return (
        <AuthProvider>
            <RouteView />
        </AuthProvider>
    );
}

function RouteView() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Today YYYY-MM-DD
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const loadRoute = async () => {
        setLoading(true);
        try {
            // Fetch CONFIRMED, IN_PRODUCTION, OUT_FOR_DELIVERY orders for this date
            // Note: In real app, might need compound query index
            const q = query(
                collection(db, "orders"),
                where("schedule.date", "==", date),
                where("status", "in", ["CONFIRMED", "IN_PRODUCTION", "OUT_FOR_DELIVERY", "DELIVERED"])
                // orderBy("createdAt") // Requires index
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));

            // Client-side sort by slot/time if needed
            // Ideally sort by address/neighborhood (Routing algo is out of scope for MVP)
            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoute();
    }, [date]);

    const updateStatus = async (orderId: string, status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELED') => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status });
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (e) {
            alert("Erro ao atualizar status");
        }
    };

    const copyToClipboard = () => {
        const text = `Rota ${date}:\n` + orders.map((o, i) =>
            `${i + 1}. ${o.customer.name} - ${o.customer.neighborhood}\n${o.customer.address}\nItems: ${o.items.length}\n`
        ).join("\n");
        navigator.clipboard.writeText(text);
        alert("Rota copiada!");
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Rota de Entrega 🚚</h1>
                    <p className="text-ink2">Pedidos agendados para o dia.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-white border rounded px-3 py-2 text-ink"
                    />
                    <button onClick={copyToClipboard} className="bg-white border text-ink px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-50">
                        <Copy size={16} /> Copiar
                    </button>
                    <button onClick={loadRoute} className="bg-olive text-white px-4 py-2 rounded font-bold shadow hover:bg-olive/90">
                        Atualizar
                    </button>
                </div>
            </div>

            {loading ? <div className="p-10 text-center">Carregando rota...</div> : (
                <div className="space-y-4 max-w-2xl">
                    {orders.length === 0 ? <div className="text-center p-10 bg-white rounded border border-ink/10 text-ink/50 italic">Sem entregas para esta data.</div> : (
                        orders.map(order => (
                            <div key={order.id} className={`p-4 rounded-xl border flex gap-4 ${order.status === 'DELIVERED' ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-ink/10'}`}>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-ink">{order.customer.name}</h3>
                                        <span className="text-[10px] font-bold bg-gray-100 px-2 rounded uppercase text-ink/50">{order.status}</span>
                                    </div>
                                    <div className="flex items-start gap-1 text-sm text-ink/80 mb-2">
                                        <MapPin size={14} className="mt-0.5 shrink-0 text-olive" />
                                        <div>
                                            {order.customer.address || "Sem endereço"}
                                            {order.customer.neighborhood && <span className="block text-xs font-bold text-ink/50">{order.customer.neighborhood}</span>}
                                        </div>
                                    </div>
                                    <div className="text-xs text-ink/50 bg-paper2 p-2 rounded">
                                        {order.items.map(i => `${i.quantity}x ${i.productName}`).join(", ")}
                                    </div>
                                    {order.notes && <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-1 rounded font-bold">Obs: {order.notes}</div>}
                                </div>
                                <div className="flex flex-col gap-2 justify-center border-l pl-4">
                                    {order.status !== 'DELIVERED' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')}
                                                className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100" title="Saiu para entrega"
                                            >
                                                <Truck size={20} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(order.id, 'DELIVERED')}
                                                className="p-2 text-green-600 bg-green-50 rounded hover:bg-green-100" title="Entregue"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'DELIVERED' && (
                                        <div className="text-green-600 font-bold text-xs text-center">Entregue</div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
