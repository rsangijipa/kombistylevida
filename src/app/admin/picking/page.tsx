"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/firestore";
import { Printer, RefreshCw } from "lucide-react";

export default function PickingPage() {
    return (
        <AuthProvider>
            <PickingView />
        </AuthProvider>
    );
}

function PickingView() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [mode, setMode] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // Aggregations
    const [summary, setSummary] = useState<Record<string, number>>({});

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch relevant orders
            const q = query(
                collection(db, "orders"),
                where("schedule.date", "==", date),
                where("schedule.deliveryMethod", "==", mode.toLowerCase()), // data model uses lowercase 'delivery'/'pickup' in customerSnapshot/schedule?
                // Wait, OrderScheduleSnapshot defines 'date', 'slotId'. Mode is in customer.deliveryMethod
            );

            // Note: Compound query might be needed for status check, doing client side filter for MVP simplicity
            const snap = await getDocs(query(collection(db, "orders"), where("schedule.date", "==", date)));
            const allOrders = snap.docs.map(d => d.data() as Order);

            const filtered = allOrders.filter(o =>
                o.customer.deliveryMethod === mode.toLowerCase() &&
                ['NEW', 'CONFIRMED', 'IN_PRODUCTION'].includes(o.status)
            );

            setOrders(filtered);

            // Calculate Summary
            const sum: Record<string, number> = {};
            filtered.forEach(o => {
                o.items.forEach(item => {
                    sum[item.productName] = (sum[item.productName] || 0) + item.qty;
                    // Could also summarize by item.productId if names vary, but name is snapshot
                });
            });
            setSummary(sum);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [date, mode]); // Reload on change

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto pb-20 print:p-0 print:max-w-none">
                {/* Header (No Print) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 print:hidden">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink">Picking List (Separação)</h1>
                        <p className="text-ink2">Lista de produção e separação diária.</p>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <select
                            value={mode}
                            onChange={e => setMode(e.target.value as 'DELIVERY' | 'PICKUP')}
                            className="bg-white border rounded px-3 py-2 font-bold"
                        >
                            <option value="DELIVERY">Delivery</option>
                            <option value="PICKUP">Retirada</option>
                        </select>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="bg-white border rounded px-3 py-2 text-ink"
                        />
                        <button onClick={loadData} className="p-2 border rounded hover:bg-gray-50 text-ink/50" title="Atualizar">
                            <RefreshCw size={20} />
                        </button>
                        <button onClick={handlePrint} className="bg-ink text-white px-4 py-2 rounded font-bold hover:bg-ink/90 flex items-center gap-2">
                            <Printer size={18} /> Imprimir
                        </button>
                    </div>
                </div>

                {/* Print Header */}
                <div className="hidden print:block mb-8 text-center border-b pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Picking List - {mode}</h1>
                    <p className="text-xl">{new Date(date).toLocaleDateString("pt-BR")}</p>
                </div>

                {loading ? <div className="p-10 text-center">Carregando...</div> : (
                    <div className="space-y-8">

                        {/* 1. PRODUCT SUMMARY */}
                        <div className="bg-white p-6 rounded-xl border border-ink/10 shadow-sm print:shadow-none print:border print:border-black">
                            <h2 className="font-bold text-lg text-ink mb-4 uppercase tracking-wider border-b pb-2">Resumo de Produtos</h2>
                            {Object.keys(summary).length === 0 ? <span className="text-ink/40 italic">Nenhum item.</span> : (
                                <ul className="grid grid-cols-2 gap-4">
                                    {Object.entries(summary).map(([name, qty]) => (
                                        <li key={name} className="flex justify-between items-center bg-paper2 p-3 rounded print:bg-transparent print:border-b print:rounded-none">
                                            <span className="font-serif font-bold text-lg">{name}</span>
                                            <span className="text-xl font-bold text-olive print:text-black">{qty}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* 2. ORDER LIST */}
                        <div className="bg-white p-6 rounded-xl border border-ink/10 shadow-sm print:shadow-none print:border-none print:p-0">
                            <h2 className="font-bold text-lg text-ink mb-4 uppercase tracking-wider border-b pb-2">Pedidos Detalhados ({orders.length})</h2>
                            {orders.length === 0 ? <div className="text-center p-8 text-ink/40 italic">Sem pedidos para os filtros selecionados.</div> : (
                                <div className="space-y-4 print:space-y-6">
                                    {orders.map((order, idx) => (
                                        <div key={order.id} className="border rounded-lg p-4 bg-gray-50 print:bg-transparent print:border-black print:break-inside-avoid">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-mono text-xs font-bold text-ink/40">#{order.shortId}</span>
                                                    <h3 className="font-bold text-lg">{order.customer.name}</h3>
                                                </div>
                                                <div className="text-right">
                                                    {order.schedule.slotLabel && <span className="block text-xs uppercase font-bold bg-white px-2 py-1 rounded border mb-1 print:border-black">{order.schedule.slotLabel}</span>}
                                                    <span className="text-xs text-ink/50">{order.customer.phone}</span>
                                                </div>
                                            </div>

                                            <ul className="text-sm space-y-1 mb-3">
                                                {order.items.map((item, i) => (
                                                    <li key={i} className="flex gap-2">
                                                        <span className="font-bold w-6 text-right">{item.qty}x</span>
                                                        <span>{item.productName}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {order.notes && (
                                                <div className="text-xs italic bg-amber-50 p-2 rounded text-amber-900 border border-amber-100 print:bg-transparent print:border-black print:text-black">
                                                    Obs: {order.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
