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

            </AdminLayout>
        </AuthProvider>
    );
}
