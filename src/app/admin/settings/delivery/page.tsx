"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { DeliveryConfig, SlotConfig, WeekdayTemplate } from "@/types/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, AlertTriangle, Plus, Trash2 } from "lucide-react";

const INITIAL_CONFIG: DeliveryConfig = {
    version: 1,
    timezone: "America/Porto_Velho",
    maxAdvanceDays: 7,
    cutoffPolicy: { type: "DAY_BEFORE_AT", dayBeforeAt: "16:00" },
    modes: {
        DELIVERY: {
            enabled: true,
            weekdayTemplates: {
                mon: { open: true, dailyCapacity: 20, slots: [{ id: "morning", label: "Manhã (09-12)", start: "09:00", end: "12:00", capacity: 10, enabled: true }] },
                tue: { open: true, dailyCapacity: 20, slots: [{ id: "morning", label: "Manhã (09-12)", start: "09:00", end: "12:00", capacity: 10, enabled: true }] },
                wed: { open: true, dailyCapacity: 20, slots: [{ id: "morning", label: "Manhã (09-12)", start: "09:00", end: "12:00", capacity: 10, enabled: true }] },
                thu: { open: true, dailyCapacity: 20, slots: [{ id: "morning", label: "Manhã (09-12)", start: "09:00", end: "12:00", capacity: 10, enabled: true }] },
                fri: { open: true, dailyCapacity: 20, slots: [{ id: "morning", label: "Manhã (09-12)", start: "09:00", end: "12:00", capacity: 10, enabled: true }] },
                sat: { open: false, dailyCapacity: 0, slots: [] },
                sun: { open: false, dailyCapacity: 0, slots: [] },
            }
        },
        PICKUP: {
            enabled: true,
            weekdayTemplates: {
                mon: { open: true, dailyCapacity: 50, slots: [] }, // Pickup might not need slots
                tue: { open: true, dailyCapacity: 50, slots: [] },
                wed: { open: true, dailyCapacity: 50, slots: [] },
                thu: { open: true, dailyCapacity: 50, slots: [] },
                fri: { open: true, dailyCapacity: 50, slots: [] },
                sat: { open: true, dailyCapacity: 50, slots: [] }, // Pickup open on Sat
                sun: { open: false, dailyCapacity: 0, slots: [] },
            }
        }
    },
    closedDates: [],
    notesForCustomer: "Entregas sujeitas a disponibilidade.",
    updatedAt: new Date().toISOString()
};

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function DeliverySettingsPage() {
    return (
        <AuthProvider>
            <DeliverySettingsEditor />
        </AuthProvider>
    );
}

function DeliverySettingsEditor() {
    const [config, setConfig] = useState<DeliveryConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');

    useEffect(() => {
        const load = async () => {
            const ref = doc(db, "settings", "deliveryConfig");
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setConfig(snap.data() as DeliveryConfig);
            } else {
                setConfig(INITIAL_CONFIG);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            const ref = doc(db, "settings", "deliveryConfig");
            await setDoc(ref, {
                ...config,
                version: (config.version || 0) + 1,
                updatedAt: new Date().toISOString()
            });
            alert("Configurações salvas!");
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-olive"><Loader2 className="animate-spin inline mr-2" /> Carregando configurações...</div>;
    if (!config) return null;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink">Configuração de Operação</h1>
                        <p className="text-ink2">Defina horários, capacidade e regras de entrega.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-olive text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-olive/90 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Salvar Alterações
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl border border-ink/10 shadow-sm space-y-4">
                    <h2 className="font-bold text-lg text-ink">Regras Gerais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-ink/50 block mb-1">Dias de Antecedência (Max)</label>
                            <input
                                type="number"
                                value={config.maxAdvanceDays}
                                onChange={e => setConfig({ ...config, maxAdvanceDays: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-ink/50 block mb-1">Timezone</label>
                            <input
                                type="text"
                                value={config.timezone}
                                disabled
                                className="w-full p-2 border rounded bg-gray-100 text-ink/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-ink/10 shadow-sm">
                    <div className="flex gap-4 border-b border-ink/10 mb-6">
                        <button
                            onClick={() => setActiveTab('DELIVERY')}
                            className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'DELIVERY' ? 'border-olive text-olive' : 'border-transparent text-ink/40'}`}
                        >
                            Entrega (Delivery)
                        </button>
                        <button
                            onClick={() => setActiveTab('PICKUP')}
                            className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'PICKUP' ? 'border-olive text-olive' : 'border-transparent text-ink/40'}`}
                        >
                            Retirada (Pickup)
                        </button>
                    </div>

                    <div className="space-y-6">
                        {WEEKDAYS.map(day => {
                            const template = config.modes[activeTab].weekdayTemplates[day];
                            return (
                                <div key={day} className={`p-4 rounded-lg border ${template.open ? 'bg-white border-ink/10' : 'bg-gray-50 border-ink/5 opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <h3 className="font-bold uppercase text-ink w-10">{day}</h3>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={template.open}
                                                    onChange={e => {
                                                        const newTemplates = { ...config.modes[activeTab].weekdayTemplates };
                                                        newTemplates[day] = { ...template, open: e.target.checked };
                                                        setConfig({ ...config, modes: { ...config.modes, [activeTab]: { ...config.modes[activeTab], weekdayTemplates: newTemplates } } });
                                                    }}
                                                />
                                                {template.open ? "Aberto" : "Fechado"}
                                            </label>
                                        </div>
                                        {template.open && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-ink/50">Capacidade Dia:</span>
                                                <input
                                                    type="number"
                                                    className="w-20 p-1 border rounded text-right"
                                                    value={template.dailyCapacity}
                                                    onChange={e => {
                                                        const newTemplates = { ...config.modes[activeTab].weekdayTemplates };
                                                        newTemplates[day] = { ...template, dailyCapacity: parseInt(e.target.value) };
                                                        setConfig({ ...config, modes: { ...config.modes, [activeTab]: { ...config.modes[activeTab], weekdayTemplates: newTemplates } } });
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {template.open && activeTab === 'DELIVERY' && (
                                        <div className="mt-2 pl-14">
                                            <p className="text-xs font-bold text-ink/40 uppercase mb-2">Janelas de Entrega (Slots)</p>
                                            <div className="space-y-2">
                                                {template.slots.map((slot, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center text-sm">
                                                        <input
                                                            value={slot.label}
                                                            onChange={e => {
                                                                const newTemplates = { ...config.modes[activeTab].weekdayTemplates };
                                                                const newSlots = [...template.slots];
                                                                newSlots[idx] = { ...slot, label: e.target.value };
                                                                newTemplates[day] = { ...template, slots: newSlots };
                                                                setConfig({ ...config, modes: { ...config.modes, [activeTab]: { ...config.modes[activeTab], weekdayTemplates: newTemplates } } });
                                                            }}
                                                            className="flex-1 border rounded p-1"
                                                        />
                                                        <span className="text-xs text-ink/40">Cap:</span>
                                                        <input
                                                            type="number"
                                                            value={slot.capacity}
                                                            onChange={e => {
                                                                const newTemplates = { ...config.modes[activeTab].weekdayTemplates };
                                                                const newSlots = [...template.slots];
                                                                newSlots[idx] = { ...slot, capacity: parseInt(e.target.value) };
                                                                newTemplates[day] = { ...template, slots: newSlots };
                                                                setConfig({ ...config, modes: { ...config.modes, [activeTab]: { ...config.modes[activeTab], weekdayTemplates: newTemplates } } });
                                                            }}
                                                            className="w-16 border rounded p-1 text-right"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newTemplates = { ...config.modes[activeTab].weekdayTemplates };
                                                                const newSlots = template.slots.filter((_, i) => i !== idx);
                                                                newTemplates[day] = { ...template, slots: newSlots };
                                                                setConfig({ ...config, modes: { ...config.modes, [activeTab]: { ...config.modes[activeTab], weekdayTemplates: newTemplates } } });
                                                            }}
                                                            className="p-1 text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const newTemplates = { ...config.modes[activeTab].weekdayTemplates };
                                                        const newSlots = [...template.slots, { id: `slot_${Date.now()}`, label: "Nova Janela", start: "00:00", end: "00:00", capacity: 10, enabled: true }];
                                                        newTemplates[day] = { ...template, slots: newSlots };
                                                        setConfig({ ...config, modes: { ...config.modes, [activeTab]: { ...config.modes[activeTab], weekdayTemplates: newTemplates } } });
                                                    }}
                                                    className="text-xs font-bold text-olive flex items-center gap-1 hover:underline mt-2"
                                                >
                                                    <Plus size={12} /> Adicionar Slot
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

