"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Lock, Unlock, RefreshCw, MapPin, Truck, ChevronRight, User, Printer, Map as MapIcon, CalendarDays, Filter } from "lucide-react";
import { useSlotOrders } from "@/hooks/useSlotOrders";
import { cn } from "@/lib/cn";
import { OrderItem } from "@/types/firestore";
import { buildCustomerWhatsAppLink } from "@/config/business";
import { AuthProvider } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";

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
    return (
        <AuthProvider>
            <AdminLayout>
                <DeliveryContent />
            </AdminLayout>
        </AuthProvider>
    );
}

function DeliveryContent() {
    const [slots, setSlots] = useState<AdminSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<AdminSlot | null>(null);
    const [processing, setProcessing] = useState(false);
    const [periodFilter, setPeriodFilter] = useState<"ALL" | "MORNING" | "AFTERNOON" | "EVENING">("ALL");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CRITICAL" | "FULL" | "CLOSED">("ALL");
    const [dateFilter, setDateFilter] = useState<string>("ALL");

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

    useEffect(() => {
        if (!selectedSlot) return;
        const updated = slots.find((slot) => slot.id === selectedSlot.id);
        if (updated) setSelectedSlot(updated);
    }, [slots, selectedSlot]);

    const dateOptions = useMemo(() => {
        return Array.from(new Set(slots.map((slot) => slot.date))).sort();
    }, [slots]);

    const filteredSlots = useMemo(() => {
        return slots.filter((slot) => {
            if (dateFilter !== "ALL" && slot.date !== dateFilter) return false;
            if (periodFilter !== "ALL" && slot.window !== periodFilter) return false;

            if (statusFilter === "CLOSED") return !slot.isOpen;
            if (statusFilter === "OPEN") return slot.isOpen;
            if (statusFilter === "FULL") return slot.isOpen && slot.reserved >= slot.capacity;
            if (statusFilter === "CRITICAL") return slot.isOpen && slot.reserved < slot.capacity && slot.reserved / slot.capacity >= 0.8;

            return true;
        });
    }, [slots, dateFilter, periodFilter, statusFilter]);

    const overview = useMemo(() => {
        const totalSlots = slots.length;
        const openSlots = slots.filter((slot) => slot.isOpen).length;
        const totalReserved = slots.reduce((acc, slot) => acc + slot.reserved, 0);
        const totalCapacity = slots.reduce((acc, slot) => acc + slot.capacity, 0);
        const occupancy = totalCapacity > 0 ? Math.round((totalReserved / totalCapacity) * 100) : 0;
        return { totalSlots, openSlots, totalReserved, occupancy };
    }, [slots]);

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
    const slotsByDate = filteredSlots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {} as Record<string, AdminSlot[]>);

    const slotWindowOrder: Record<string, number> = { MORNING: 0, AFTERNOON: 1, EVENING: 2 };

    return (
        <div className="min-h-screen font-sans text-ink">
            <header className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Logística & Entregas</h1>
                    <p className="text-ink2 mt-1">Gerencie capacidade, ocupação e manifesto de rota por janela.</p>
                </div>
                <button
                    onClick={fetchSlots}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-full hover:bg-paper2 text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                    <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                    Atualizar
                </button>
            </header>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiCard label="Slots" value={overview.totalSlots.toString()} />
                <KpiCard label="Abertos" value={overview.openSlots.toString()} />
                <KpiCard label="Reservas" value={overview.totalReserved.toString()} />
                <KpiCard label="Ocupacao" value={`${overview.occupancy}%`} />
            </div>

            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/50">
                    <Filter size={14} />
                    Filtros
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink"
                    >
                        <option value="ALL">Todas as datas</option>
                        {dateOptions.map((date) => (
                            <option key={date} value={date}>{new Date(`${date}T12:00`).toLocaleDateString("pt-BR")}</option>
                        ))}
                    </select>

                    <select
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value as "ALL" | "MORNING" | "AFTERNOON" | "EVENING")}
                        className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink"
                    >
                        <option value="ALL">Todos os periodos</option>
                        <option value="MORNING">Manha</option>
                        <option value="AFTERNOON">Tarde</option>
                        <option value="EVENING">Noite</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "ALL" | "OPEN" | "CRITICAL" | "FULL" | "CLOSED")}
                        className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink"
                    >
                        <option value="ALL">Todos os status</option>
                        <option value="OPEN">Abertos</option>
                        <option value="CRITICAL">Criticos (80%+)</option>
                        <option value="FULL">Lotados</option>
                        <option value="CLOSED">Fechados</option>
                    </select>
                </div>
            </div>

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
                            const sortedDaySlots = [...daySlots].sort((a, b) => slotWindowOrder[a.window] - slotWindowOrder[b.window]);

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
                                                {sortedDaySlots.reduce((acc, s) => acc + s.reserved, 0)} entregas agendadas
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {sortedDaySlots.map(slot => (
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

function KpiCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{label}</p>
            <p className="mt-1 font-serif text-2xl font-bold text-ink">{value}</p>
        </div>
    );
}

// Sub-component for Orders List (Reused logic)
// Sub-component for Orders List (Reused logic)
function SlotOrdersList({ date, slotId }: { date: string, slotId: string }) {
    const { orders, loading } = useSlotOrders(date, slotId);
    const [viewMode, setViewMode] = useState<'list' | 'manifest'>('list');

    // Grouping Logic
    const grouped = React.useMemo(() => {
        const groups: Record<string, typeof orders> = {};
        orders.forEach(o => {
            const hood = o.customer?.neighborhood || "Outros";
            if (!groups[hood]) groups[hood] = [];
            groups[hood].push(o);
        });
        return groups;
    }, [orders]);

    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => {
            const hoodA = (a.customer?.neighborhood || "Outros").toLowerCase();
            const hoodB = (b.customer?.neighborhood || "Outros").toLowerCase();
            if (hoodA !== hoodB) return hoodA.localeCompare(hoodB);
            return (a.customer?.name || "").localeCompare(b.customer?.name || "");
        });
    }, [orders]);

    const handlePrint = () => {
        // Simple print trigger. 
        // In a real app, we'd style a specific @media print area.
        window.print();
    };

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

    // MANIFEST VIEW
    if (viewMode === 'manifest') {
        return (
            <div className="flex-1 overflow-y-auto pr-1 space-y-6 font-sans scrollbar-thin scrollbar-thumb-ink/10">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2 border-b">
                    <button onClick={() => setViewMode('list')} className="text-xs text-olive font-bold underline">Voltar</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-ink text-white px-3 py-1.5 rounded-full text-xs font-bold hover:opacity-80">
                        <Printer size={12} /> Imprimir
                    </button>
                </div>

                <div id="printable-manifest" className="space-y-6">
                    <div className="text-center md:hidden print:block mb-4">
                        <h1 className="font-bold text-xl uppercase">Manifesto de Entrega</h1>
                        <p>{new Date(date).toLocaleDateString()} - {slotId}</p>
                    </div>

                    {Object.entries(grouped).sort().map(([hood, hoodOrders]) => (
                        <div key={hood} className="break-inside-avoid">
                            <h4 className="font-bold text-lg text-ink/80 border-b-2 border-ink/10 mb-3 pb-1 uppercase tracking-wider">{hood} ({hoodOrders.length})</h4>
                            <div className="space-y-2">
                                {hoodOrders.map(order => (
                                    <div key={order.id} className="border-b border-dashed border-ink/10 pb-2 mb-2">
                                        <div className="flex justify-between font-bold text-sm">
                                            <span>{order.customer.name}</span>
                                            <span>#{order.shortId}</span>
                                        </div>
                                        <div className="text-xs text-ink/70">
                                            {order.customer.address}, {order.customer.number || "S/N"} {order.customer.complement ? `- ${order.customer.complement}` : ''}
                                        </div>
                                        <div className="text-xs italic text-ink/50 mt-1">
                                            {order.items.map((item: OrderItem) => `${item.quantity}x ${item.productName}`).join(', ')}
                                        </div>
                                        {/* Phone for Driver */}
                                        <div className="text-[10px] font-mono mt-1 text-ink/40">
                                            Tel: {order.customer.phone}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // STANDARD LIST VIEW
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-end mb-2 px-1">
                <button
                    onClick={() => setViewMode('manifest')}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink/50 hover:text-olive transition-colors"
                >
                    <MapIcon size={12} /> Ver Rotas / Manifesto
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-sans scrollbar-thin scrollbar-thumb-ink/10">
                {sortedOrders.map(order => (
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
                                {order.items?.map((item: OrderItem, i: number) => (
                                    <div key={i} className="flex justify-between text-[11px] text-ink/80">
                                        <span>{item.quantity}x {item.productName}</span>
                                        <span className="opacity-50">{item.variantKey}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-2 pl-8 flex justify-end">
                            <a
                                href={buildCustomerWhatsAppLink(order.customer?.phone || "")}
                                target="_blank"
                                className="text-[10px] font-bold uppercase tracking-wider text-olive hover:underline flex items-center gap-1"
                            >
                                WhatsApp <ChevronRight size={10} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
