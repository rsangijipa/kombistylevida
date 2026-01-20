
"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { Loader2, ChevronLeft, ChevronRight, Info } from "lucide-react";

export default function AgendaPage() {
    return (
        <AuthProvider>
            <AgendaManager />
        </AuthProvider>
    );
}

function AgendaManager() {
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
    const [slots, setSlots] = useState<any[]>([]);

    // Detail Modal State
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [detailOrders, setDetailOrders] = useState<any[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [editCapacity, setEditCapacity] = useState<number>(0);
    const [dayData, setDayData] = useState<any>(null); // current day data for modal

    // Derived State
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const fetchSlots = React.useCallback(async () => {
        setLoading(true);
        // Recalculate weekDays inside to avoid dependency on derived state
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
        const startStr = days[0].toISOString().split('T')[0];
        const endStr = days[6].toISOString().split('T')[0];
        try {
            const res = await fetch(`/api/admin/delivery/slots?start=${startStr}&end=${endStr}`);
            if (res.ok) {
                const data = await res.json();
                setSlots(data); // Array of DeliveryDay docs
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [weekStart]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const handleNextWeek = () => {
        const next = new Date(weekStart);
        next.setDate(next.getDate() + 7);
        setWeekStart(next);
    };

    const handlePrevWeek = () => {
        const prev = new Date(weekStart);
        prev.setDate(prev.getDate() - 7);
        setWeekStart(prev);
    };

    const handleToday = () => {
        setWeekStart(getMonday(new Date()));
    };

    const openDetail = async (date: string) => {
        setSelectedDate(date);
        setDetailLoading(true);

        // Find existing data for this day
        const existing = slots.find(s => s.date === date);
        setDayData(existing);

        // Defaults
        const currentCap = existing?.dailyCapacityOverride || 10;
        setEditCapacity(currentCap);

        try {
            const res = await fetch(`/api/admin/delivery/orders?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setDetailOrders(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDetailLoading(false);
        }
    };

    const saveCapacity = async () => {
        if (!selectedDate) return;
        try {
            const res = await fetch('/api/admin/delivery/slots', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'UPDATE_DAILY_CAPACITY',
                    date: selectedDate,
                    value: editCapacity
                })
            });

            if (res.ok) {
                await fetchSlots(); // refresh grid
                setSelectedDate(null); // close
            }
        } catch (e) {
            alert("Erro ao atualizar capacidade.");
        }
    };

    const toggleDay = async (date: string, currentOpen: boolean) => {
        if (!confirm(`Deseja realmente ${currentOpen ? 'FECHAR' : 'ABRIR'} o dia ${date}?`)) return;
        try {
            const res = await fetch('/api/admin/delivery/slots', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'TOGGLE_DAY',
                    date,
                    value: currentOpen // if true, it means we are setting closed=true
                })
            });
            if (res.ok) {
                fetchSlots();
            }
        } catch (e) {
            alert("Erro ao atualizar data.");
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Agenda de Entrega</h1>
                    <p className="text-ink2">Gerencie a capacidade e bloqueios semanais.</p>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-xl border border-ink/10 p-1 shadow-sm">
                    <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-lg text-ink/60"><ChevronLeft size={20} /></button>
                    <button onClick={handleToday} className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-ink hover:bg-gray-50 rounded-lg">
                        Hoje
                    </button>
                    <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-lg text-ink/60"><ChevronRight size={20} /></button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-olive"><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-[1000px] grid grid-cols-7 gap-4">
                        {weekDays.map(date => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayDataItem = slots.find(s => s.date === dateStr);
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            // Default Logic
                            const isOpen = dayDataItem ? !dayDataItem.closed : true; // Default TRUE
                            const capacity = dayDataItem?.dailyCapacityOverride || 10;
                            const bookedCount = dayDataItem?.dailyBooked || 0; // Simplified
                            const percent = Math.min(100, (bookedCount / capacity) * 100);
                            const isFull = bookedCount >= capacity;

                            return (
                                <div key={dateStr} className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors ${isToday ? 'border-olive bg-olive/5 ring-1 ring-olive/20' : 'border-ink/10 bg-white'}`}>
                                    <div className="text-center pb-2 border-b border-ink/5">
                                        <div className="text-xs font-bold uppercase tracking-widest text-ink/40">
                                            {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                        </div>
                                        <div className={`text-xl font-serif font-bold ${isToday ? 'text-olive' : 'text-ink'}`}>
                                            {date.getDate()}
                                        </div>
                                    </div>

                                    {/* Status Indicator */}
                                    <div className={`rounded-lg p-3 text-center transition-colors ${isOpen ? (isFull ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700') : 'bg-gray-100 text-gray-400'}`}>
                                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                                            {!isOpen ? 'Fechado' : isFull ? 'Lotado' : 'Disponível'}
                                        </div>
                                        <div className="text-2xl font-mono font-bold">
                                            {bookedCount}/{capacity}
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-auto pt-2 grid grid-cols-1 gap-2">
                                        <button
                                            onClick={() => openDetail(dateStr)}
                                            className="w-full rounded-lg border border-ink/10 py-2 text-xs font-bold text-ink/60 hover:bg-gray-50 hover:text-ink"
                                        >
                                            Detalhes
                                        </button>
                                        <button
                                            onClick={() => toggleDay(dateStr, isOpen)}
                                            className={`w-full rounded-lg py-2 text-xs font-bold ${isOpen ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                        >
                                            {isOpen ? 'Fechar Dia' : 'Abrir Dia'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-serif text-2xl font-bold text-ink">
                                    {new Date(selectedDate + "T12:00").toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h2>
                                <p className="text-sm text-ink2">Gerenciar capacidade e pedidos.</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
                        </div>

                        {/* Capacity Control */}
                        <div className="mb-8 p-4 bg-paper2/50 rounded-xl flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1">Capacidade Total</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={editCapacity}
                                        onChange={e => setEditCapacity(parseInt(e.target.value))}
                                        className="w-20 p-2 text-lg font-bold rounded-lg border border-ink/10 bg-white focus:outline-none focus:border-olive"
                                    />
                                    <button
                                        onClick={saveCapacity}
                                        className="text-xs font-bold text-white bg-olive px-4 py-2 rounded-lg hover:bg-olive/90"
                                    >
                                        Salvar Capacidade
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block">Ocupação Atual</span>
                                <span className="text-2xl font-mono font-bold text-ink">
                                    {dayData?.dailyBooked || 0}
                                    <span className="text-ink/30 text-lg"> / {editCapacity}</span>
                                </span>
                            </div>
                        </div>

                        {/* Orders List */}
                        <h3 className="font-bold text-lg text-ink mb-4">Pedidos Agendados</h3>

                        {detailLoading ? (
                            <div className="py-10 text-center"><Loader2 className="animate-spin inline text-olive" /></div>
                        ) : detailOrders.length === 0 ? (
                            <div className="py-8 text-center text-ink2 italic border border-dashed border-ink/10 rounded-xl">
                                Nenhum pedido agendado para este dia.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {detailOrders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 border border-ink/5 rounded-lg bg-white shadow-sm hover:bg-paper2/30">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold text-ink/50 bg-ink/5 px-2 py-1 rounded">#{order.shortId}</span>
                                            <div>
                                                <div className="font-bold text-sm text-ink">{order.customerName}</div>
                                                <div className="text-xs text-ink/60">{order.slotLabel || 'Sem horário'}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm text-olive">R$ {(order.totalCents / 100).toFixed(2).replace('.', ',')}</div>
                                            <div className="text-[10px] uppercase font-bold text-ink/40">{order.status}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function getMonday(d: Date) {
    d = new Date(d);
    const day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}
