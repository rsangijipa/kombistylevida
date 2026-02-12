"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function ScheduleLegacyPage() {
    return (
        <AuthProvider>
            <ScheduleLegacyContent />
        </AuthProvider>
    );
}

function ScheduleLegacyContent() {
    const router = useRouter();

    useEffect(() => {
        const t = window.setTimeout(() => {
            router.replace("/admin/agenda");
        }, 900);

        return () => window.clearTimeout(t);
    }, [router]);

    return (
        <AdminLayout>
            <div className="mx-auto max-w-2xl rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-sm">
                <h1 className="font-serif text-3xl font-bold text-ink">Agenda unificada</h1>
                <p className="mt-3 text-sm text-ink/70">
                    Esta rota antiga foi consolidada no novo painel de agenda para evitar divergencia de operacao.
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-ink/40">Redirecionando para /admin/agenda...</p>

                <Link
                    href="/admin/agenda"
                    className="mt-6 inline-flex rounded-full bg-olive px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
                >
                    Ir agora
                </Link>
            </div>
        </AdminLayout>
    );
}
