
"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { DayAvailability } from "@/services/scheduleService";
import { Loader2, Calendar as CalIcon, Settings, AlertTriangle, X, ChevronRight, Ban, CheckCircle, Smartphone } from "lucide-react";

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

    // Panel State
    const [selectedSlot, setSelectedSlot] = useState<{ dayDate: string; slot: any } | null>(null);
    const [panelLoading, setPanelLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/schedule?days=14&mode=${mode}`);
            if (res.ok) {
                const data = await res.json();
                setAvailability(data);
            }
        } catch (e) {
            console.error("Failed to load schedule", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [mode]);

    // Refresh single slot or day logic could be optimized, here we reload all
    const handleSlotUpdate = async (updates: any) => {
        if (!selectedSlot) return;
        setPanelLoading(true);
        try {
            const res = await fetch('/api/admin/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'UPDATE_SLOT',
                    date: selectedSlot.dayDate,
                    mode,
                    slotId: selectedSlot.slot.id,
                    ...updates
                })
            });
            if (res.ok) {
                await load();
                // Update local selected slot ref slightly tricky without finding it again
                // For now, close panel or just reload
                setSelectedSlot(null);
            }
        } catch (e) {
            alert("Erro ao atualizar.");
        } finally {
            setPanelLoading(false);
        }
    };

    const handleToggleDay = async (date: string, currentOpen: boolean) => {
        if (!confirm(`Deseja ${currentOpen ? "FECHAR" : "ABRIR"} o dia todo?`)) return;
        try {
            const res = await fetch('/api/admin/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'TOGGLE_DAY',
                    date,
                    mode,
                    open: currentOpen // currently open -> send true to set 'overrideClosed: true'
                })
            });
            if (res.ok) load();
        } catch (e) { }
    }

    return (
        <AdminLayout>
            <div className="relative min-h-screen pb-20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink">Gestão de Entregas</h1>
                        <p className="text-ink2">Capacidade e riscos operacionais.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-1 flex">
                        <button
                            onClick={() => setMode('DELIVERY')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${mode === 'DELIVERY' ? 'bg-ink text-white shadow-sm' : 'text-ink/60 hover:bg-gray-50'}`}
                        >
                            Entrega
                        </button>
                        <button
                            onClick={() => setMode('PICKUP')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${mode === 'PICKUP' ? 'bg-ink text-white shadow-sm' : 'text-ink/60 hover:bg-gray-50'}`}
                        >
                            Retirada
                        </button>
                    </div>
                </div>

                {loading ? <div className="p-20 text-center"><Loader2 className="animate-spin inline text-olive" size={32} /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {availability.map(day => {
                            const isPast = new Date(day.date) < new Date(new Date().setHours(0, 0, 0, 0));
                            const dayDate = new Date(day.date + "T12:00");

                            return (
                                <div key={day.date} className={`border rounded-xl bg-white overflow-hidden flex flex-col ${!day.open ? 'opacity-60 bg-gray-50' : ''}`}>
                                    {/* Header */}
                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <div>
                                            <h3 className="font-bold text-ink capitalize text-lg leading-tight">
                                                {dayDate.toLocaleDateString("pt-BR", { weekday: "short" })} <span className="text-ink/60 font-medium">{dayDate.getDate()}/{dayDate.getMonth() + 1}</span>
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {day.open ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aberto</span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Fechado</span>
                                            )}
                                            <button onClick={() => handleToggleDay(day.date, day.open)} className="text-ink/30 hover:text-ink">
                                                <Settings size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Slots List */}
                                    <div className="flex-1 p-2 space-y-2">
                                        {day.open && day.slots.map(slot => {
                                            const occupancy = slot.capacity > 0 ? (slot.booked / slot.capacity) * 100 : 100;
                                            const color = occupancy > 80 ? 'bg-red-500' : occupancy > 40 ? 'bg-amber-400' : 'bg-green-500';
                                            const isSelected = selectedSlot?.slot.id === slot.id && selectedSlot?.dayDate === day.date;

                                            // Handle blocked slot visually
                                            if (!slot.enabled && slot.available === 0 && slot.booked === 0) { // Naive check for "Blocked Manually" vs "Full"
                                                // If enabled is false (from API logic enabled = config.enabled && avail > 0)
                                                // We need to differentiate "Config Disabled" vs "Full".
                                                // For now, let's just show it.
                                            }

                                            return (
                                                <div
                                                    key={slot.id}
                                                    onClick={() => setSelectedSlot({ dayDate: day.date, slot })}
                                                    className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-olive ring-1 ring-olive bg-olive/5' : 'border-gray-100 bg-white hover:border-olive/30'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-bold text-ink">{slot.label}</span>
                                                        <span className="text-xs font-mono font-medium text-ink/60">
                                                            {slot.booked} <span className="text-ink/30">/ {slot.capacity}</span>
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${color} transition-all duration-500`}
                                                            style={{ width: `${occupancy}%` }}
                                                        />
                                                    </div>

                                                    {!slot.enabled && (
                                                        <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                                                            <span className="text-[10px] uppercase font-bold text-ink/40 flex items-center gap-1">
                                                                <Ban size={12} /> Bloqueado / Lotado
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {!day.open && <div className="p-4 text-center text-xs text-ink/40 italic">Dia fechado para entregas.</div>}
                                    </div>

                                    {/* Footer Summary */}
                                    {day.open && (
                                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-ink/60 flex justify-between">
                                            <span>Total do dia</span>
                                            <span className="font-mono font-bold">{day.dailyBooked} res.</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* SLIDE OVER PANEL */}
                {selectedSlot && (
                    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedSlot(null)} />
                        <div className="pointer-events-auto w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="font-serif text-2xl font-bold text-ink hover:text-olive transition-colors">Detalhes do Slot</h2>
                                    <p className="text-ink/60 font-medium">
                                        {new Date(selectedSlot.dayDate + "T12:00").toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedSlot(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                            </div>

                            <div className="bg-paper2 p-6 rounded-2xl mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-bold uppercase tracking-wider text-ink/50">Horário</span>
                                    <span className="text-xl font-bold text-ink">{selectedSlot.slot.label}</span>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-ink">Capacidade</label>
                                            <span className="text-xs font-bold text-olive bg-olive/10 px-2 py-0.5 rounded">
                                                {selectedSlot.slot.booked} reservados
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                disabled={panelLoading}
                                                onClick={() => handleSlotUpdate({ capacity: Math.max(0, selectedSlot.slot.capacity - 1) })}
                                                className="w-10 h-10 rounded-lg border border-ink/20 flex items-center justify-center hover:bg-white active:scale-95"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center font-mono text-3xl font-bold text-ink">
                                                {selectedSlot.slot.capacity}
                                            </div>
                                            <button
                                                disabled={panelLoading}
                                                onClick={() => handleSlotUpdate({ capacity: selectedSlot.slot.capacity + 1 })}
                                                className="w-10 h-10 rounded-lg bg-ink text-white flex items-center justify-center hover:bg-ink/90 active:scale-95"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-ink/5">
                                        <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-ink/10">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${selectedSlot.slot.enabled ? 'bg-olive' : 'bg-gray-300'}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${selectedSlot.slot.enabled ? 'translate-x-4' : ''}`} />
                                                </div>
                                                <span className="font-bold text-sm text-ink">Slot Ativo</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedSlot.slot.enabled}
                                                onChange={(e) => handleSlotUpdate({ enabled: e.target.checked })}
                                            />
                                        </label>
                                        {!selectedSlot.slot.enabled && <p className="text-xs text-red-500 mt-2 px-3">Este horário está bloqueado para novos agendamentos.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <h3 className="font-bold text-ink mb-4 flex items-center justify-between">
                                    Pedidos Agendados
                                    <span className="text-xs font-normal text-ink/50 bg-gray-100 px-2 py-1 rounded-full">
                                        Source: Orders Collection
                                    </span>
                                </h3>

                                <SlotOrdersList date={selectedSlot.dayDate} slotId={selectedSlot.slot.id} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function SlotOrdersList({ date, slotId }: { date: string, slotId: string }) {
    // Inline fetch component for simplicity
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/orders?date=${date}&slotId=${slotId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
            })
            .finally(() => setLoading(false));
    }, [date, slotId]);

    if (loading) return <div className="text-center py-4"><Loader2 className="animate-spin inline" /></div>;
    if (orders.length === 0) return <div className="text-center py-4 text-ink/40 text-sm">Nenhum pedido encontrado para este horário.</div>;

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {orders.map(order => (
                <div key={order.id} className="border border-ink/10 rounded-lg p-3 bg-gray-50 text-sm hover:border-olive/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-ink">{order.customer?.name || "Cliente"}</span>
                        <span className="text-xs font-mono text-ink/50">#{order.shortId}</span>
                    </div>
                    <div className="text-xs text-ink/70 mb-2">
                        {order.customer?.phone} • {order.customer?.neighborhood || "Sem bairro"}
                    </div>
                    <div className="space-y-1">
                        {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs">
                                <span>{item.quantity}x {item.productName}</span>
                                <span className="text-ink/50">{item.variantKey}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-ink/5 flex justify-between items-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {order.status}
                        </span>
                        <a
                            href={`https://wa.me/${order.customer?.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            className="text-[10px] font-bold text-olive hover:underline"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ... existing code ...
