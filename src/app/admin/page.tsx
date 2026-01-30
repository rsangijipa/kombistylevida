"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Package, RotateCcw, TrendingUp, Loader2, AlertCircle, ShoppingCart, Truck, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export default function AdminPage() {
    const { stats, loading, error } = useDashboardStats();

    // Skeleton Component
    const Skel = ({ className }: { className?: string }) => (
        <span className={cn("animate-pulse bg-ink/5 rounded inline-block", className)} />
    );

    return (
        <AuthProvider>
            <AdminLayout>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink">Dashboard</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-olive"></span>
                            </span>
                            <p className="text-ink2 text-sm">Tempo Real Ativo</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* KPI GUIDES */}
                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {/* Pedidos Hoje */}
                    <Link href="/admin/orders" className="group rounded-xl border border-ink/10 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-olive/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShoppingCart size={64} className="text-olive rotate-[-15deg]" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 relative z-10">Pedidos (Hoje)</h3>
                        <div className="mt-2 min-h-[36px] relative z-10">
                            {loading ? <Skel className="h-9 w-16" /> : (
                                <p className="text-3xl font-bold text-olive">{stats?.ordersToday ?? 0}</p>
                            )}
                        </div>
                        <p className="text-xs text-ink2 mt-1 relative z-10 font-mono">
                            {loading ? <Skel className="h-3 w-24" /> : `R$ ${((stats?.revenueToday || 0) / 100).toFixed(2).replace(".", ",")}`}
                        </p>
                    </Link>

                    {/* A Entregar */}
                    <Link href="/admin/delivery" className="group rounded-xl border border-ink/10 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-amber/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Truck size={64} className="text-amber rotate-[-15deg]" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 relative z-10">A Entregar</h3>
                        <div className="mt-2 min-h-[36px] relative z-10">
                            {loading ? <Skel className="h-9 w-12" /> : (
                                <p className="text-3xl font-bold text-amber">{stats?.pendingDelivery ?? 0}</p>
                            )}
                        </div>
                        <p className="text-xs text-ink2 mt-1 relative z-10">Pedidos ativos</p>
                    </Link>

                    {/* Packs (Hoje) */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-purple-100">
                            <Package size={48} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 relative z-10">Packs (Hoje)</h3>
                        <div className="mt-2 min-h-[36px] relative z-10">
                            {loading ? <Skel className="h-9 w-12" /> : (
                                <p className="text-3xl font-bold text-purple-600">{stats?.packsSold ?? 0}</p>
                            )}
                        </div>
                        <p className="text-xs text-ink2 mt-1 relative z-10">Unidades vendidas</p>
                    </div>

                    {/* Estoque Crítico */}
                    <Link href="/admin/inventory" className={cn(
                        "rounded-xl border p-6 shadow-sm md:col-span-2 lg:col-span-1 transition-all hover:shadow-md",
                        (stats?.lowStockCount || 0) > 0 ? "bg-red-50/50 border-red-100" : "bg-white border-ink/10"
                    )}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40">Estoque Crítico</h3>
                        <div className="mt-2 min-h-[36px]">
                            {loading ? <Skel className="h-9 w-12" /> : (
                                <p className={cn("text-3xl font-bold", (stats?.lowStockCount || 0) > 0 ? "text-red-600" : "text-green-600")}>
                                    {stats?.lowStockCount ?? 0}
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-ink2 mt-1">
                            {(stats?.lowStockCount || 0) > 0 ? "Itens abaixo do mínimo!" : "Estoque saudável"}
                        </p>
                    </Link>
                </div>

                {/* Quick Actions Row */}
                <div className="mt-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">Ações Rápidas</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        <Link href="/monte-seu-pack" target="_blank" className="flex items-center gap-2 px-4 py-3 bg-olive text-white rounded-lg text-sm font-bold shadow-sm hover:bg-olive/90 whitespace-nowrap">
                            <PlusCircle size={16} />
                            Novo Pedido (Loja)
                        </Link>
                        <Link href="/admin/customers" className="flex items-center gap-2 px-4 py-3 bg-white border border-ink/10 text-ink rounded-lg text-sm font-medium hover:bg-paper2 whitespace-nowrap">
                            <Search size={16} />
                            Buscar Cliente
                        </Link>
                        <Link href="/admin/inventory" className="flex items-center gap-2 px-4 py-3 bg-white border border-ink/10 text-ink rounded-lg text-sm font-medium hover:bg-paper2 whitespace-nowrap">
                            <Package size={16} />
                            Ajustar Estoque
                        </Link>
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
                                <div className="flex h-full w-full items-center justify-center text-ink/20 gap-1">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span className="text-[10px]">Carregando...</span>
                                </div>
                            ) : (
                                stats?.salesHistory.map((day, i) => {
                                    // Calculate relative height. Max value?
                                    const maxVal = Math.max(...(stats?.salesHistory.map(d => d.value) || [100]));
                                    const hPercent = maxVal === 0 ? 0 : Math.round((day.value / maxVal) * 100);

                                    return (
                                        <div key={i} className="flex flex-1 flex-col items-center gap-2 group">
                                            <div className="relative w-full rounded-t-sm bg-olive/20 transition-all duration-500 hover:bg-olive group-hover:shadow-md" style={{ height: `${Math.max(4, hPercent)}%` }}>
                                                {/* Tooltip */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-ink px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                                    R$ {day.value.toFixed(2)}
                                                </div>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] font-medium opacity-60">{day.date}</span>
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
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i}>
                                            <Skel className="h-4 w-32 mb-1" />
                                            <Skel className="h-2 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                stats?.topFlavors.map((flavor, i) => {
                                    const maxQty = stats?.topFlavors[0]?.quantity || 1;
                                    const percent = Math.round((flavor.quantity / maxQty) * 100);

                                    return (
                                        <div key={i}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="font-medium text-ink truncate max-w-[200px]">{flavor.name}</span>
                                                <span className="text-ink/60 text-xs">{flavor.quantity} un.</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/5">
                                                <div
                                                    className="h-full bg-amber/80 rounded-full transition-all duration-1000 ease-out"
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
