"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Lock, Unlock, RefreshCw } from "lucide-react";

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
                // Optimistic update or refetch
                await fetchSlots();
                setSelectedSlot(null);
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
        if (!slot.isOpen) return "bg-gray-800 text-gray-400"; // Blocked/Closed
        const ratio = slot.reserved / slot.capacity;
        if (ratio >= 1.0) return "bg-red-600 text-white"; // Full
        if (ratio >= 0.8) return "bg-red-200 text-red-800"; // Critical
        if (ratio >= 0.5) return "bg-yellow-200 text-yellow-800"; // Busy
        if (slot.reserved > 0) return "bg-green-100 text-green-800"; // Active
        return "bg-gray-50 text-gray-400"; // Empty
    };

    // Helper: Group by Date
    const slotsByDate = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {} as Record<string, AdminSlot[]>);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Entregas</h1>
                <button
                    onClick={fetchSlots}
                    className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                    <RefreshCw size={16} />
                    Atualizar
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Calendar Heatmap */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        Object.entries(slotsByDate).sort().map(([date, daySlots]) => (
                            <div key={date} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    {new Date(date + "T12:00").toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {daySlots.map(slot => (
                                        <div
                                            key={slot.id}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`
                                                cursor-pointer rounded-md p-3 border transition-all hover:scale-105 active:scale-95
                                                flex flex-col items-center gap-1
                                                ${getHeatmapColor(slot)}
                                                ${selectedSlot?.id === slot.id ? 'ring-2 ring-black ring-offset-2' : 'border-transparent'}
                                            `}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                {slot.window === 'MORNING' ? 'Manhã' : slot.window === 'AFTERNOON' ? 'Tarde' : 'Noite'}
                                            </span>
                                            <span className="text-2xl font-bold leading-none">
                                                {slot.reserved}<span className="text-sm font-normal opacity-60">/{slot.capacity}</span>
                                            </span>
                                            {(!slot.isOpen) && <Lock size={12} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 2. Side Panel */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-fit sticky top-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Detalhes do Slot</h2>

                    {selectedSlot ? (
                        <div className="space-y-6 animate-in slide-in-from-right-2">
                            <div>
                                <label className="text-xs uppercase font-bold text-gray-400">ID</label>
                                <div className="font-mono text-xs text-gray-600 break-all">{selectedSlot.id}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-400">Reservados</label>
                                    <div className="text-3xl font-bold text-gray-900">{selectedSlot.reserved}</div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-400">Capacidade</label>
                                    <div className="text-3xl font-bold text-gray-900">{selectedSlot.capacity}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Bloqueio</label>
                                    <button
                                        onClick={() => updateSlot(selectedSlot.id, { isOpen: !selectedSlot.isOpen })}
                                        disabled={processing}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-colors ${!selectedSlot.isOpen
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                    >
                                        {!selectedSlot.isOpen ? <><Unlock size={16} /> Desbloquear</> : <><Lock size={16} /> Bloquear</>}
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Ajustar Capacidade</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateSlot(selectedSlot.id, { capacity: Math.max(0, selectedSlot.capacity - 1) })}
                                            className="w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 font-bold"
                                        >-</button>
                                        <div className="flex-1 text-center font-mono font-bold">{selectedSlot.capacity}</div>
                                        <button
                                            onClick={() => updateSlot(selectedSlot.id, { capacity: selectedSlot.capacity + 1 })}
                                            className="w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 font-bold"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-12 italic">
                            Selecione um slot no calendário para gerenciar.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
