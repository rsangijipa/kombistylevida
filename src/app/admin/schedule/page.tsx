"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { DayAvailability, getScheduleAvailability } from "@/services/scheduleService";
import { Loader2, Calendar as CalIcon, Settings, AlertTriangle } from "lucide-react";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SchedulePage() {
    return (
        <AuthProvider>
            <ScheduleDashboard />
        </AuthProvider>
    );
}

function ScheduleDashboard() {
    const [availability, setAvailability] = useState<DayAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');

    const load = async () => {
        setLoading(true);
        // Load next 14 days
        const data = await getScheduleAvailability(new Date(), 14, mode);
        setAvailability(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [mode]);

    const handleToggleDay = async (date: string, currentOpen: boolean) => {
        if (!confirm(`Deseja ${currentOpen ? "FECHAR" : "ABRIR"} o dia ${date}?`)) return;
        try {
            // Write override to deliveryDays
            // Using ID `${date}_${mode}` for specific overrides.

            const docId = `${date}_${mode}`;
            const ref = doc(db, "deliveryDays", docId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                await setDoc(ref, { overrideClosed: currentOpen }, { merge: true }); // If open -> close (overrideClosed=true)
            } else {
                await setDoc(ref, {
                    date,
                    mode,
                    overrideClosed: currentOpen,
                    dailyBooked: 0,
                    slots: {},
                    updatedAt: new Date().toISOString()
                });
            }
            load(); // Reload to see effect
        } catch (e) {
            console.error(e);
            alert("Erro ao alterar dia.");
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink">Agenda & Capacidade</h1>
                        <p className="text-ink2">Visão geral da ocupação da cozinha.</p>
                    </div>
                    <select
                        value={mode}
                        onChange={e => setMode(e.target.value as 'DELIVERY' | 'PICKUP')}
                        className="bg-white border rounded px-3 py-2 font-bold"
                    >
                        <option value="DELIVERY">Delivery</option>
                        <option value="PICKUP">Retirada</option>
                    </select>
                </div>

                {loading ? <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availability.map(day => {
                            const percent = Math.min(100, (day.dailyBooked / day.dailyCapacity) * 100);
                            const isFull = day.dailyBooked >= day.dailyCapacity;

                            return (
                                <div key={day.date} className={`border rounded-xl p-4 flex flex-col gap-3 ${day.open ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-serif font-bold text-lg text-ink capitalize">
                                                {new Date(day.date + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "numeric" })}
                                            </h3>
                                            <div className="text-xs font-bold uppercase tracking-wider text-ink/40">
                                                {day.open ? (isFull ? <span className="text-red-500">Lotado</span> : <span className="text-green-600">Aberto</span>) : <span className="text-red-400">Fechado</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleDay(day.date, day.open)}
                                            className="text-xs underline text-ink/40 hover:text-olive"
                                        >
                                            {day.open ? "Fechar Dia" : "Abrir Dia"}
                                        </button>
                                    </div>

                                    {day.open && (
                                        <>
                                            {/* Capacity Bar */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>Ocupação</span>
                                                    <span className="font-bold">{day.dailyBooked} / {day.dailyCapacity}</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${isFull ? 'bg-red-500' : 'bg-olive'} transition-all duration-500`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Slots */}
                                            {day.slots.length > 0 && (
                                                <div className="space-y-1 mt-2">
                                                    {day.slots.map(slot => (
                                                        <div key={slot.id} className="text-xs flex justify-between items-center text-ink/60">
                                                            <span>{slot.label}</span>
                                                            <span className={`${slot.booked >= slot.capacity ? 'text-red-500 font-bold' : ''}`}>
                                                                {slot.booked}/{slot.capacity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
