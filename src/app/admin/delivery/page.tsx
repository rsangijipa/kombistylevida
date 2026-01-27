"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Lock, Unlock, RefreshCw, MapPin, Truck, Calendar as CalIcon, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/cn";

// Types
interface AdminSlot {
    id: string;
    date: string;
    window: string;
    capacity: number;
    reserved: number;
    isOpen: boolean;
}

export default function AdminDeliveryPage() {
    const [slots, setSlots] = useState<AdminSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<AdminSlot | null>(null);
    const [processing, setProcessing] = useState(false);

    // Range: Next 14 days (Server default)
    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/delivery/slots'); // Public endpoint returns slots with stats
            const data = await res.json();
            setSlots(data.slots || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const updateSlot = async (slotId: string, updates: Partial<AdminSlot>) => {
        setProcessing(true);
        try {
            const res = await fetch('/api/admin/delivery/slot', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slotId, ...updates })
            });
            if (res.ok) {
                // Optimistic update
                setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ...updates } : s));
                // Refetch to be safe
                fetchSlots();
            } else {
                alert("Failed to update slot");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating slot");
        } finally {
            setProcessing(false);
        }
    };

    // Helper: Heatmap Color
    const getHeatmapColor = (slot: AdminSlot) => {
        if (!slot.isOpen) return "bg-ink/5 text-ink/20"; // Blocked/Closed
        const ratio = slot.reserved / slot.capacity;
        if (ratio >= 1.0) return "bg-red-500 text-white shadow-red-200"; // Full
        if (ratio >= 0.8) return "bg-amber-400 text-ink shadow-amber-100"; // Critical
        if (ratio >= 0.5) return "bg-yellow-200 text-yellow-900"; // Busy
        if (slot.reserved > 0) return "bg-green-100 text-olive"; // Active
        return "bg-white text-ink/30 border-dashed border-ink/10"; // Empty
    };

    // Helper: Group by Date
    const slotsByDate = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {} as Record<string, AdminSlot[]>);

    return (
        <div className="min-h-screen font-sans text-ink">
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Logística & Entregas</h1>
                    <p className="text-ink2 mt-1">Gerencie a capacidade dos motoristas e slots.</p>
                </div>
                <button
                    onClick={fetchSlots}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-full hover:bg-paper2 text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                    <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                    Atualizar
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Calendar Heatmap */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="h-64 flex flex-col gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-ink/5 animate-pulse rounded-xl" />)}
                        </div>
                    ) : (
                        Object.entries(slotsByDate).sort().map(([date, daySlots]) => {
                            const dateObj = new Date(date + "T12:00");
                            const isToday = new Date().toDateString() === dateObj.toDateString();

                            return (
                                <div key={date} className={cn(
                                    "rounded-2xl p-6 border transition-all hover:shadow-md",
                                    isToday ? "bg-white border-olive/30 ring-1 ring-olive/10 shadow-sm" : "bg-white border-ink/5"
                                )}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold border",
                                            isToday ? "bg-olive text-white border-olive" : "bg-paper text-ink/70 border-ink/10"
                                        )}>
                                            <span className="text-[10px] uppercase leading-none">{dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}</span>
                                            <span className="text-xl leading-none">{dateObj.getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-ink capitalize">
                                                {dateObj.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                                            </h3>
                                            <p className="text-xs text-ink/50 font-medium">
                                                {daySlots.reduce((acc, s) => acc + s.reserved, 0)} entregas agendadas
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {daySlots.map(slot => (
                                            <div
                                                key={slot.id}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={cn(
                                                    "cursor-pointer rounded-xl p-4 border transition-all active:scale-95 relative overflow-hidden group",
                                                    getHeatmapColor(slot),
                                                    selectedSlot?.id === slot.id ? "ring-2 ring-ink ring-offset-2" : "border-transparent"
                                                )}
                                            >
                                                <div className="flex justify-between items-start relative z-10">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                                        {slot.window === 'MORNING' ? 'Manhã' : slot.window === 'AFTERNOON' ? 'Tarde' : 'Noite'}
                                                    </span>
                                                    {(!slot.isOpen) && <Lock size={12} className="opacity-50" />}
                                                </div>
                                                <div className="mt-2 flex items-baseline gap-1 relative z-10">
                                                    <span className="text-2xl font-black">{slot.reserved}</span>
                                                    <span className="text-xs font-bold opacity-60">/ {slot.capacity}</span>
                                                </div>
                                                {/* Hover Effect */}
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* 2. Side Panel */}
                <div className="lg:h-[calc(100vh-100px)] lg:sticky lg:top-8">
                    <div className="bg-white rounded-[24px] shadow-xl border border-ink/5 p-6 h-full flex flex-col relative overflow-hidden">

                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-olive via-amber to-olive opacity-80" />

                        <h2 className="text-xl font-bold mb-6 text-ink flex items-center gap-2">
                            <Truck size={20} className="text-olive" />
                            Detalhes da Entrega
                        </h2>

                        {selectedSlot ? (
                            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                                {/* Slot Info Card */}
                                <div className="bg-paper2 rounded-2xl p-5 mb-6 border border-ink/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Data Selecionada</p>
                                            <p className="text-lg font-bold text-ink capitalize">
                                                {new Date(selectedSlot.date + "T12:00").toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Período</p>
                                            <p className="text-lg font-bold text-ink uppercase">
                                                {selectedSlot.window === 'MORNING' ? 'Manhã' : selectedSlot.window === 'AFTERNOON' ? 'Tarde' : 'Noite'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Capacity Controls */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold text-ink/60 uppercase tracking-widest">
                                            <span>Capacidade</span>
                                            <span>{selectedSlot.reserved} Reservados</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-ink/10 shadow-sm">
                                            <button
                                                onClick={() => updateSlot(selectedSlot.id, { capacity: Math.max(0, selectedSlot.capacity - 1) })}
                                                disabled={processing}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 active:scale-90 transition-transform font-bold text-ink/60"
                                            >-</button>
                                            <div className="flex-1 text-center font-mono text-xl font-bold text-ink">
                                                {selectedSlot.capacity}
                                            </div>
                                            <button
                                                onClick={() => updateSlot(selectedSlot.id, { capacity: selectedSlot.capacity + 1 })}
                                                disabled={processing}
                                                className="w-8 h-8 flex items-center justify-center rounded-md bg-ink text-white shadow-sm active:scale-90 transition-transform font-bold"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Toggle Lock */}
                                    <button
                                        onClick={() => updateSlot(selectedSlot.id, { isOpen: !selectedSlot.isOpen })}
                                        disabled={processing}
                                        className={cn(
                                            "mt-4 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                            !selectedSlot.isOpen
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-red-50 text-red-600 hover:bg-red-100"
                                        )}
                                    >
                                        {!selectedSlot.isOpen ? <><Unlock size={14} /> Reabrir Agendamento</> : <><Lock size={14} /> Bloquear Data</>}
                                    </button>
                                </div>

                                {/* Orders List */}
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="font-bold text-sm text-ink/80">Pedidos ({selectedSlot.reserved})</h3>
                                        <span className="text-[10px] bg-ink/5 px-2 py-1 rounded-full text-ink/40 font-mono">LIVE DATA</span>
                                    </div>
                                    <SlotOrdersList date={selectedSlot.date} slotId={selectedSlot.id} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-8">
                                <MapPin size={48} className="mb-4 text-ink/20" />
                                <p className="text-sm font-medium">Selecione um bloco no calendário para ver detalhes, gerenciar capacidade e rota.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Orders List (Reused logic)
function SlotOrdersList({ date, slotId }: { date: string, slotId: string }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/orders?date=${date}&slotId=${slotId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
                else setOrders([]);
            })
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [date, slotId]);

    if (loading) return (
        <div className="flex flex-col gap-2 p-1">
            <div className="h-16 bg-ink/5 skeleton rounded-lg animate-pulse" />
            <div className="h-16 bg-ink/5 skeleton rounded-lg animate-pulse" />
        </div>
    );

    if (orders.length === 0) return (
        <div className="flex-1 border-2 border-dashed border-ink/5 rounded-xl flex items-center justify-center text-xs text-ink/40 p-4">
            Nenhum pedido para este horário.
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-sans scrollbar-thin scrollbar-thumb-ink/10">
            {orders.map(order => (
                <div key={order.id} className="bg-white border border-ink/5 rounded-xl p-3 shadow-sm hover:border-olive/30 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-olive/10 text-olive flex items-center justify-center text-[10px] font-bold">
                                <User size={12} />
                            </div>
                            <span className="font-bold text-sm text-ink truncate max-w-[120px]">{order.customer?.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-ink/40 bg-paper2 px-1.5 py-0.5 rounded">#{order.shortId}</span>
                    </div>

                    <div className="pl-8">
                        <p className="text-xs text-ink/70 mb-2 leading-tight flex items-start gap-1">
                            <MapPin size={10} className="mt-0.5 shrink-0 opacity-50" />
                            {order.customer?.neighborhood || "Endereço não informado"}
                        </p>

                        <div className="bg-paper2/50 rounded-lg p-2 space-y-1">
                            {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-[11px] text-ink/80">
                                    <span>{item.quantity}x {item.productName}</span>
                                    <span className="opacity-50">{item.variantKey}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2 pl-8 flex justify-end">
                        <a
                            href={`https://wa.me/${order.customer?.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            className="text-[10px] font-bold uppercase tracking-wider text-olive hover:underline flex items-center gap-1"
                        >
                            WhatsApp <ChevronRight size={10} />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
