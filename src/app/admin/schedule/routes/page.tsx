"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { getDailyRoutes } from "@/services/adminService";
import { Order } from "@/types/firestore";
import { Printer, Copy, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export default function DeliveryRoutesPage() {
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [printMode, setPrintMode] = useState(false);

    useEffect(() => {
        setLoading(true);
        getDailyRoutes(date)
            .then(setOrders)
            .finally(() => setLoading(false));
    }, [date]);

    // Group by Neighborhood
    const groupedOrders = orders.reduce((acc, order) => {
        const hood = order.customer.neighborhood || "Outros";
        if (!acc[hood]) acc[hood] = [];
        acc[hood].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    const handleCopyRoute = () => {
        let text = `📦 *ROTA DE ENTREGA - ${date.split("-").reverse().join("/")}*\n\n`;
        Object.entries(groupedOrders).forEach(([hood, list]) => {
            text += `📍 *${hood.toUpperCase()}*\n`;
            list.forEach(o => {
                text += `- ${o.customer.name} (${o.customer.address})\n`;
                if (o.notes) text += `  Obs: ${o.notes}\n`;
                if (o.bottlesToReturn) text += `  ♻️ Retorna: ${o.bottlesToReturn}\n`;
            });
            text += "\n";
        });
        navigator.clipboard.writeText(text);
        alert("Rota copiada para a área de transferência!");
    };

    return (
        <AuthProvider>
            <AdminLayout>
                <div className={cn("mb-8 transition-all", printMode && "hidden")}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-ink">Rotas de Entrega</h1>
                            <p className="text-ink2">Planejamento logístico diário.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-md border border-ink/10 bg-white text-sm focus:border-olive outline-none"
                                />
                            </div>
                            <button
                                onClick={handleCopyRoute}
                                className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/10 rounded-md text-sm font-bold text-ink hover:bg-white transition-colors"
                            >
                                <Copy size={16} />
                                <span className="hidden md:inline">Copiar</span>
                            </button>
                            <button
                                onClick={() => setPrintMode(!printMode)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-bold transition-colors",
                                    printMode ? "bg-olive text-white border-olive" : "bg-ink text-paper border-ink hover:bg-ink/90"
                                )}
                            >
                                <Printer size={16} />
                                <span className="hidden md:inline">{printMode ? "Sair do Modo Impressão" : "Imprimir"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* VISUALIZAÇÃO DA ROTA */}
                <div className={cn("bg-white rounded-xl shadow-sm border border-ink/10 p-6 opacity-0 animate-fadeIn", printMode && "shadow-none border-none p-0")}>

                    {printMode && (
                        <div className="mb-8 text-center border-b pb-4 border-black">
                            <h2 className="text-2xl font-bold uppercase">Rota de Entrega</h2>
                            <p className="text-lg">{date.split("-").reverse().join("/")}</p>
                            <button
                                onClick={() => setPrintMode(false)}
                                className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md no-print"
                            >
                                Sair
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-12 text-center text-ink/40">Carregando rota...</div>
                    ) : orders.length === 0 ? (
                        <div className="py-12 text-center text-ink/40">Nenhum pedido para esta data.</div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedOrders).map(([hood, list]) => (
                                <div key={hood} className="break-inside-avoid">
                                    <h3 className="flex items-center gap-2 font-bold text-lg text-olive mb-4 border-b border-olive/20 pb-1">
                                        <MapPin size={20} />
                                        {hood.toUpperCase()}
                                        <span className="text-sm font-normal text-ink/40 ml-auto">{list.length} pedidos</span>
                                    </h3>

                                    <div className="space-y-3">
                                        {list.map(order => (
                                            <div key={order.id} className="p-4 rounded-lg bg-paper/50 border border-ink/5 flex flex-col md:flex-row gap-4 md:items-center justify-between print:border-black print:bg-white">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-ink">{order.customer.name}</span>
                                                        <span className="text-xs bg-ink/5 px-2 py-0.5 rounded text-ink/60">#{order.shortId}</span>
                                                    </div>
                                                    <p className="text-sm text-ink2 mt-1">{order.customer.address}</p>
                                                    {order.notes && (
                                                        <p className="text-xs text-amber-600 mt-1 font-medium bg-amber/5 inline-block px-1 rounded">Obs: {order.notes}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm">
                                                    {order.bottlesToReturn ? (
                                                        <div className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded">
                                                            <RotateCcw size={14} />
                                                            <span>Retorna: {order.bottlesToReturn}</span>
                                                        </div>
                                                    ) : null}

                                                    <div className="font-bold text-ink whitespace-nowrap">
                                                        {order.items.length} itens
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <style jsx global>{`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white; }
                        * { -webkit-print-color-adjust: exact; }
                    }
                `}</style>
            </AdminLayout>
        </AuthProvider>
    );
}

function RotateCcw({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    )
}
