"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { DeliverySlot } from "@/types/firestore";
import { Loader2, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function DeliveryScheduler() {
    const { orderId, selectedDate, selectedSlotId, setSchedule, initCart } = useCartStore();
    const [slots, setSlots] = useState<DeliverySlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reserving, setReserving] = useState(false);

    // Filtered View State
    const [activeDate, setActiveDate] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        if (!orderId) {
            initCart();
        }
    }, [orderId, initCart]);

    // Fetch Slots on Mount
    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/delivery/slots');
            if (res.ok) {
                const data = await res.json();
                setSlots(data.slots || []);
                // If we have a selected date, ensure it's active. If not, pick first available.
                if (data.slots.length > 0) {
                    // Group by date to find unique dates
                    // ... logic below in render
                }
            }
        } catch (e) {
            setError("Erro ao carregar horários.");
        } finally {
            setLoading(false);
        }
    };

    // Derived State: Unique Dates
    const uniqueDates = Array.from(new Set(slots.map(s => s.date))).sort();

    // Set initial active date if needed
    useEffect(() => {
        if (!activeDate && uniqueDates.length > 0) {
            setActiveDate(selectedDate || uniqueDates[0]);
        }
    }, [uniqueDates, activeDate, selectedDate]);

    // Get slots for active date
    const currentSlots = slots.filter(s => s.date === activeDate);

    const handleReserve = async (slot: DeliverySlot) => {
        if (!slot.isOpen || slot.reserved >= slot.capacity) return;
        setReserving(true);
        setError("");

        try {
            const res = await fetch('/api/delivery/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: slot.date,
                    window: slot.window
                })
            });

            if (!res.ok) {
                if (res.status === 401) throw new Error("Unauthorized");
                const data = await res.json();
                throw new Error(data.error || "Falha ao reservar");
            }

            // Success: Update Store
            setSchedule(slot.date, slot.id);
            // Re-fetch to update capacities
            fetchSlots();

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            console.error("Reserve failed", error);
            if (message === "Unauthorized" || message.includes("Unauthorized")) {
                // Session lost (cookie expired/missing), but we have orderId.
                // Re-init to get a fresh cookie/order.
                await initCart();
                setError("Sessão atualizada. Por favor, tente reservar novamente.");
            } else {
                setError(message);
            }
        } finally {
            setReserving(false);
        }
    };

    const handleModeSwitch = async (mode: 'ASAP' | 'SCHEDULED') => {
        if (mode === 'ASAP') {
            await fetch('/api/delivery/set-type', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'ASAP' })
            });
            setSchedule(null, null);
        }
    };

    if (loading && slots.length === 0) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-olive" /></div>;
    }

    const isScheduled = !!selectedSlotId;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="text-olive" size={20} />
                    <h3 className="font-bold text-ink">Agendamento de Entrega</h3>
                </div>
                {/* Toggle could go here, or just let user pick a slot to switch */}
                {isScheduled && (
                    <button
                        onClick={() => handleModeSwitch('ASAP')}
                        className="text-xs font-bold uppercase text-ink/40 hover:text-red-500 transition-colors"
                    >
                        Remover Agendamento
                    </button>
                )}
            </div>

            {/* Date Selector (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {uniqueDates.map(date => {
                    const d = new Date(date + 'T12:00:00');
                    const isActive = activeDate === date;
                    const weekDay = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                    const dayNum = d.getDate();

                    return (
                        <button
                            key={date}
                            onClick={() => setActiveDate(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[60px] h-[72px] rounded-xl border border-ink/10 transition-all shrink-0",
                                isActive
                                    ? "bg-olive text-white border-olive shadow-md scale-105"
                                    : "bg-paper text-ink/60 hover:bg-paper2"
                            )}
                        >
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{weekDay}</span>
                            <span className="text-xl font-bold">{dayNum}</span>
                        </button>
                    );
                })}
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 gap-3">
                {currentSlots.map(slot => {
                    const isFull = !(!slot.isOpen) && slot.reserved >= slot.capacity;
                    const isSelected = selectedSlotId === slot.id;
                    const isAvailable = !(!slot.isOpen) && !isFull;

                    const label = slot.window === 'MORNING' ? 'Manhã (08h - 12h)'
                        : slot.window === 'AFTERNOON' ? 'Tarde (13h - 18h)'
                            : 'Noite (18h - 21h)';

                    return (
                        <button
                            key={slot.id}
                            disabled={!isAvailable && !isSelected}
                            onClick={() => handleReserve(slot)}
                            className={cn(
                                "w-full p-4 rounded-xl border flex items-center justify-between transition-all",
                                isSelected
                                    ? "bg-olive/10 border-olive text-olive"
                                    : isAvailable
                                        ? "bg-white border-ink/10 hover:border-olive/50 text-ink"
                                        : "bg-paper2 border-ink/5 text-ink/30 cursor-not-allowed opacity-70"
                            )}
                        >
                            <div className="text-left">
                                <div className="font-bold text-sm">{label}</div>
                                <div className="text-xs opacity-70 mt-0.5">
                                    {isFull && !isSelected ? "Esgotado" : !slot.isOpen ? "Indisponível" : "Disponível"}
                                </div>
                            </div>

                            {isSelected ? (
                                <CheckCircle2 size={24} className="fill-olive text-white" />
                            ) : (
                                reserving && activeDate === slot.date ? (
                                    <Loader2 size={20} className="animate-spin opacity-50" />
                                ) : (
                                    <div className={cn("h-5 w-5 rounded-full border-2", isAvailable ? "border-ink/20" : "border-ink/10")} />
                                )
                            )}
                        </button>
                    );
                })}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {isScheduled && activeDate && (
                <div className="text-center p-3 bg-olive/5 rounded-lg border border-olive/10">
                    <p className="text-xs text-olive font-bold">
                        Entrega agendada para {new Date(selectedDate! + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                </div>
            )}
        </div>
    );
}
