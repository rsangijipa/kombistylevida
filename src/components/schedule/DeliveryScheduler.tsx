import React, { useMemo } from "react";
import { DELIVERY_SLOTS, CLOSED_DAYS, isSlotAvailable } from "@/data/deliverySlots";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/cn";

export function DeliveryScheduler() {
    const { selectedDate, selectedSlotId, setSchedule } = useCartStore();

    // Generate next 7 days
    const nextDays = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    }, []);

    const dateStr = (date: Date) => date.toISOString().split('T')[0];
    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    };

    return (
        <div className="space-y-4 rounded-xl border border-ink/10 bg-paper2/50 p-4">
            <h3 className="font-serif text-lg font-bold text-olive">Agendamento</h3>

            <p className="text-xs text-ink2 italic">
                Cutoff: Pedidos para mesmo dia sujeitos a disponibilidade.
            </p>

            {/* Date Selection with horiz scroll */}
            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Data</label>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {nextDays.map((date) => {
                        const dayOfWeek = date.getDay(); // 0 = sun
                        const isClosed = CLOSED_DAYS.includes(dayOfWeek);
                        const isoDate = dateStr(date);
                        const isSelected = selectedDate === isoDate;

                        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                        const dayNum = date.getDate();

                        return (
                            <button
                                key={isoDate}
                                disabled={isClosed}
                                onClick={() => setSchedule(isoDate, null)} // Reset slot when changing date
                                className={cn(
                                    "flex min-w-[60px] flex-col items-center justify-center rounded-lg border p-2 transition-all",
                                    isSelected
                                        ? "bg-olive border-olive text-paper shadow-md scale-105"
                                        : "bg-paper border-ink/10 text-ink/70 hover:bg-paper2",
                                    isClosed && "opacity-40 grayscale cursor-not-allowed bg-ink/5"
                                )}
                            >
                                <span className="text-[10px] uppercase font-bold tracking-widest">
                                    {isToday(date) ? "Hoje" : dayName}
                                </span>
                                <span className="text-lg font-serif font-bold">
                                    {dayNum}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Slot Selection */}
            {selectedDate && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Horário</label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                        {DELIVERY_SLOTS.map((slot) => {
                            const isSelected = selectedSlotId === slot.id;
                            const available = isSlotAvailable(slot, selectedDate);

                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => available && setSchedule(selectedDate, slot.id)}
                                    disabled={!available}
                                    className={cn(
                                        "w-full rounded-md border px-3 py-2 text-left text-sm transition-all",
                                        isSelected
                                            ? "border-olive bg-olive/10 text-olive font-bold ring-1 ring-olive"
                                            : "border-ink/10 bg-paper text-ink2",
                                        !available
                                            ? "opacity-50 cursor-not-allowed bg-ink/5 decoration-slice"
                                            : "hover:bg-paper2"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{slot.label}</span>
                                        {available ? (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                Disponível
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-ink/10 text-ink/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                Esgotado
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
