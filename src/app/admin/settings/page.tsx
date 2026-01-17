"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
    const [currentSettings, setCurrentSettings] = useState<any>(null);
    const [message, setMessage] = useState("");

    // Load current settings
    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDoc(doc(db, SETTINGS_DOC_PATH));
                if (snap.exists()) {
                    setCurrentSettings(snap.data());
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

            await setDoc(doc(db, SETTINGS_DOC_PATH), defaultSettings, { merge: true });
            setCurrentSettings(defaultSettings);
            setMessage("Configurações padrão aplicadas com sucesso! (Capacidade: 20, Slots, Cutoff 14h)");
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
                </div>
            </div>
        </AdminLayout>
    );
}
