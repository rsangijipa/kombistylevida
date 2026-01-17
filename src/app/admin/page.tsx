"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { getDashboardStats, DashboardStats } from "@/services/adminService";
import { Package, RotateCcw, TrendingUp } from "lucide-react";

export default function AdminPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthProvider>
            <AdminLayout>
                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-bold text-ink">Dashboard</h1>
                    <p className="text-ink2">Visão geral da operação em tempo real.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {/* Pedidos Hoje */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40">Pedidos (Hoje)</h3>
                        <p className="mt-2 text-3xl font-bold text-olive">
                            {loading ? "..." : stats?.ordersToday}
                        </p>
                        <p className="text-xs text-ink2 mt-1">
                            R$ {loading ? "..." : ((stats?.revenueToday || 0) / 100).toFixed(2).replace(".", ",")}
                        </p>
                    </div>

                    {/* A Entregar */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40">A Entregar</h3>
                        <p className="mt-2 text-3xl font-bold text-amber">
                            {loading ? "..." : stats?.pendingDelivery}
                        </p>
                        <p className="text-xs text-ink2 mt-1">Pedidos ativos</p>
                    </div>

                    {/* Packs (Hoje) */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-purple-100">
                            <Package size={48} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 relative z-10">Packs (Hoje)</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 relative z-10">
                            {loading ? "..." : stats?.packsSold}
                        </p>
                        <p className="text-xs text-ink2 mt-1 relative z-10">Unidades vendidas</p>
                    </div>

                    {/* Logística Reversa */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-green-50">
                            <RotateCcw size={48} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 relative z-10">Retornos (Pend.)</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 relative z-10">
                            {loading ? "..." : stats?.returnsPending}
                        </p>
                        <p className="text-xs text-ink2 mt-1 relative z-10">Garrafas a recolher</p>
                    </div>

                    {/* Estoque Crítico */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm md:col-span-2 lg:col-span-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40">Estoque Crítico</h3>
                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {loading ? "..." : stats?.lowStockCount}
                        </p>
                        <p className="text-xs text-ink2 mt-1">Sabores abaixo de 10 un.</p>
                    </div>
                </div>

                {/* CHARTS SECTION */}
                <div className="mt-8 grid gap-6 md:grid-cols-2">

                    {/* Sales History Chart */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40">Vendas (Últimos 7 dias)</h3>
                            <TrendingUp size={16} className="text-ink/40" />
                        </div>

                        <div className="flex h-48 items-end justify-between gap-2 overflow-hidden text-xs text-ink/60 relative">
                            {/* Y-Axis Grid Lines? Keep simple for MVP: just bars */}
                            {loading ? (
                                <div className="flex h-full w-full items-center justify-center text-ink/20">Carregando...</div>
                            ) : (
                                stats?.salesHistory.map((day, i) => {
                                    // Calculate relative height. Max value?
                                    const maxVal = Math.max(...(stats?.salesHistory.map(d => d.value) || [100]));
                                    const hPercent = maxVal === 0 ? 0 : Math.round((day.value / maxVal) * 100);

                                    return (
                                        <div key={i} className="flex flex-1 flex-col items-center gap-2 group">
                                            <div className="relative w-full rounded-t-sm bg-olive/20 transition-all duration-500 hover:bg-olive group-hover:shadow-md" style={{ height: `${Math.max(4, hPercent)}%` }}>
                                                {/* Tooltip */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-ink px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
                                                    R$ {day.value.toFixed(2)}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-medium">{day.date}</span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Top Flavors */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-ink/40">Sabores Mais Vendidos</h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-sm text-ink/40">Carregando...</div>
                            ) : (
                                stats?.topFlavors.map((flavor, i) => {
                                    const maxQty = stats?.topFlavors[0]?.qty || 1;
                                    const percent = Math.round((flavor.qty / maxQty) * 100);

                                    return (
                                        <div key={i}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="font-medium text-ink truncate max-w-[200px]">{flavor.name}</span>
                                                <span className="text-ink/60 text-xs">{flavor.qty} un.</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/5">
                                                <div
                                                    className="h-full bg-amber/80 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            {(!loading && stats?.topFlavors.length === 0) && (
                                <p className="text-sm text-ink/40 italic">Nenhum dado de vendas ainda.</p>
                            )}
                        </div>
                    </div>
                </div>

            </AdminLayout>
        </AuthProvider>
    );
}
