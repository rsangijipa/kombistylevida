"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useCustomerStore } from "@/store/customerStore";
import { cn } from "@/lib/cn";
import { DayAvailability, getScheduleAvailability } from "@/services/scheduleService";
import { Loader2 } from "lucide-react";

export function DeliveryScheduler() {
    const { selectedDate, selectedSlotId, setSchedule } = useCartStore();
    const { deliveryMethod } = useCustomerStore();

    // Switch between Delivery and Pickup modes
    const mode = deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY';

    const [availability, setAvailability] = useState<DayAvailability[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // Fetch next 7 days
                const data = await getScheduleAvailability(new Date(), 7, mode);
                setAvailability(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [mode]);

    // Format helpers
    const getDayLabel = (dateStr: string) => {
        const d = new Date(dateStr + "T12:00:00");
        const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
        const day = d.getDate();
        return { weekday, day };
    };

    if (loading) return <div className="py-4 text-center text-ink/50"><Loader2 className="animate-spin inline" /> Buscando agenda...</div>;

    if (availability.length === 0) return <div className="text-sm text-red-500">Agenda indisponível.</div>;

    const selectedDay = availability.find(d => d.date === selectedDate);

    return (
        <div className="space-y-4">
            {/* 1. Date Selector (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availability.map((day) => {
                    const { weekday, day: dayNum } = getDayLabel(day.date);
                    const isSelected = selectedDate === day.date;
                    const isDisabled = !day.open || (day.dailyBooked >= day.dailyCapacity);

                    return (
                        <button
                            key={day.date}
                            onClick={() => !isDisabled && setSchedule(day.date, null)}
                            disabled={isDisabled}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[3.5rem] rounded-lg border py-2 transition-all",
                                isSelected
                                    ? "bg-olive border-olive text-white shadow-md transform scale-105"
                                    : isDisabled
                                        ? "bg-gray-100 border-transparent text-ink/20 cursor-not-allowed grayscale"
                                        : "bg-white border-ink/10 text-ink/60 hover:border-olive/50 hover:bg-olive/5"
                            )}
                        >
                            <span className="text-[10px] uppercase font-bold tracking-wider">{weekday}</span>
                            <span className="font-serif text-lg font-bold leading-none">{dayNum}</span>
                        </button>
                    );
                })}
            </div>

            {/* 2. Slot Selector (If Delivery) */}
            {selectedDate && selectedDay && mode === 'DELIVERY' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    {selectedDay.slots.length === 0 ? (
                        <div className="text-xs text-ink/50 italic">Sem horários para este dia.</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {selectedDay.slots.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSchedule(selectedDate, slot.id)}
                                    disabled={!slot.enabled}
                                    className={cn(
                                        "px-3 py-2 rounded-md border text-sm font-medium transition-colors text-left relative",
                                        selectedSlotId === slot.id
                                            ? "bg-olive/10 border-olive text-olive font-bold"
                                            : !slot.enabled
                                                ? "bg-gray-50 border-gray-100 text-ink/30 cursor-not-allowed"
                                                : "bg-white border-ink/10 text-ink/70 hover:border-olive/30"
                                    )}
                                >
                                    {slot.label}
                                    {/* Availability Indicator */}
                                    {slot.enabled && slot.available <= 5 && (
                                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" title="Últimas vagas" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
