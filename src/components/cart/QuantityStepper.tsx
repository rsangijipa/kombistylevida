import React from "react";
import { cn } from "@/lib/cn";
import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
    qty: number;
    onUpdate: (newQty: number) => void;
    size?: "sm" | "md";
}

export function QuantityStepper({ qty, onUpdate, size = "md" }: QuantityStepperProps) {
    const isSm = size === "sm";

    return (
        <div className={cn(
            "flex items-center rounded-full border border-ink/20 bg-paper",
            isSm ? "h-9 px-1" : "h-11 px-2" // Mobile: Taller
        )}>
            <button
                onClick={() => onUpdate(qty - 1)}
                className={cn(
                    "flex items-center justify-center text-ink/60 hover:text-ink transition-colors active:scale-90 touch-manipulation",
                    isSm ? "w-8 h-full" : "w-10 h-full" // Mobile: Wider touch area
                )}
            >
                <Minus size={isSm ? 14 : 16} />
            </button>

            <span className={cn(
                "min-w-[1.5rem] text-center font-bold text-ink select-none",
                isSm ? "text-[14px]" : "text-[16px]"
            )}>
                {qty}
            </span>

            <button
                onClick={() => onUpdate(qty + 1)}
                className={cn(
                    "flex items-center justify-center text-ink/60 hover:text-ink transition-colors active:scale-90 touch-manipulation",
                    isSm ? "w-8 h-full" : "w-10 h-full"
                )}
            >
                <Plus size={isSm ? 14 : 16} />
            </button>
        </div>
    );
}
