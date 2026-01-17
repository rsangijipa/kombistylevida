"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";

export default function AdminPage() {
    return (
        <AuthProvider>
            <AdminLayout>
                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-bold text-ink">Dashboard</h1>
                    <p className="text-ink2">Visão geral da operação de hoje.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-ink/40">Pedidos Hoje</h3>
                        <p className="mt-2 text-3xl font-bold text-olive">--</p>
                    </div>
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-ink/40">A Entregar</h3>
                        <p className="mt-2 text-3xl font-bold text-amber">--</p>
                    </div>
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-ink/40">Estoque Crítico</h3>
                        <p className="mt-2 text-3xl font-bold text-red-600">--</p>
                    </div>
                </div>

                <div className="mt-12 rounded-xl bg-blue-50 p-6 border border-blue-100 text-blue-800">
                    <h4 className="font-bold mb-2">👋 Bem-vindo ao Kombistyle Ops!</h4>
                    <p className="text-sm">
                        A infraestrutura está pronta. Atualmente estamos na <strong>Fase 0</strong>.
                        <br />
                        Conecte-se ao Firestore para ver dados reais aqui.
                    </p>
                </div>
            </AdminLayout>
        </AuthProvider>
    );
}
