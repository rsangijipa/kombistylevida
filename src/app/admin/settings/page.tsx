"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
// import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
import { DELIVERY_SLOTS, CLOSED_DAYS } from "@/data/deliverySlots";

const SETTINGS_DOC_PATH = "settings/global";

export default function SettingsPage() {
    return (
        <AuthProvider>
            <SettingsContent />
        </AuthProvider>
    );
}

function SettingsContent() {
    const [loading, setLoading] = useState(false);
    const [currentSettings, setCurrentSettings] = useState<Record<string, unknown> | null>(null);
    const [message, setMessage] = useState("");

    // Load current settings
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (Object.keys(data).length > 0) {
                        setCurrentSettings(data);
                    }
                }
            } catch (e) {
                console.error("Error loading settings", e);
            }
        };
        load();
    }, []);

    const handleSeed = async () => {
        setLoading(true);
        setMessage("");
        try {
            const defaultSettings = {
                dailyCapacity: 20, // Example limit
                deliverySlots: DELIVERY_SLOTS,
                closedDays: CLOSED_DAYS,
                cutoffHours: 14, // Orders for tomorrow until 14h
                updatedAt: new Date().toISOString()
            };

            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(defaultSettings)
            });

            if (res.ok) {
                setCurrentSettings(defaultSettings);
                setMessage("Configurações padrão aplicadas com sucesso! (Capacidade: 20, Slots, Cutoff 14h)");
            } else {
                throw new Error("API Error");
            }
        } catch (e) {
            console.error(e);
            setMessage("Erro ao salvar: " + (e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl">
                <header className="mb-8">
                    <h1 className="font-serif text-3xl font-bold text-ink">Configurações Gerais</h1>
                    <p className="text-ink2">Definição de regras operacionais do sistema.</p>
                </header>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg border ${message.includes("Erro") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-olive">Estado Atual</h2>
                        {currentSettings ? (
                            <pre className="overflow-auto rounded bg-gray-50 p-4 text-xs text-ink/80">
                                {JSON.stringify(currentSettings, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Nenhuma configuração encontrada no Firestore.</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-olive">Ações de Inicialização</h2>
                        <p className="text-sm text-ink2 mb-6">
                            Use este botão para gravar as configurações padrão (Slots, Horários, Capacidade) no banco de dados pela primeira vez.
                        </p>

                        <button
                            onClick={handleSeed}
                            disabled={loading}
                            className="rounded-lg bg-olive px-6 py-3 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : "Aplicar Configurações Padrão"}
                        </button>
                    </div>

                    {/* Maintenance Card */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-amber-800 flex items-center gap-2">
                            ⚠️ Manutenção do Sistema
                        </h2>
                        <p className="text-sm text-amber-900/70 mb-6">
                            Use esta ferramenta se perceber discrepâncias entre a Agenda e os Pedidos reais.
                            Isso vai recalcular todos os contadores de &ldquo;Booked&rdquo; baseados nos pedidos ativos dos próximos 30 dias.
                        </p>

                        <button
                            onClick={async () => {
                                if (!confirm("Isso vai sobrescrever os contadores da agenda com base nos pedidos atuais. Continuar?")) return;
                                setLoading(true);
                                try {
                                    const res = await fetch('/api/admin/schedule/sync', { method: 'POST' });
                                    const data = await res.json();
                                    if (data.success) alert(`Sincronização concluída! ${data.processed} dias processados.`);
                                    else alert("Erro: " + data.error);
                                } catch (e) {
                                    alert("Erro ao conectar.");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="rounded-lg border border-amber-500 text-amber-900 hover:bg-amber-100 px-6 py-3 font-bold transition-transform active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Processando..." : "🔄 Sincronizar Agenda (Reparar)"}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
