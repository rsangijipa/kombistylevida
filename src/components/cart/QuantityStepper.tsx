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
            isSm ? "h-7 px-1" : "h-9 px-2"
        )}>
            <button
                onClick={() => onUpdate(qty - 1)}
                className={cn(
                    "flex items-center justify-center text-ink/60 hover:text-ink transition-colors",
                    isSm ? "w-6 h-6" : "w-8 h-8"
                )}
            >
                <Minus size={isSm ? 12 : 14} />
            </button>

            <span className={cn(
                "min-w-[1.5rem] text-center font-bold text-ink",
                isSm ? "text-[13px]" : "text-[15px]"
            )}>
                {qty}
            </span>

            <button
                onClick={() => onUpdate(qty + 1)}
                className={cn(
                    "flex items-center justify-center text-ink/60 hover:text-ink transition-colors",
                    isSm ? "w-6 h-6" : "w-8 h-8"
                )}
            >
                <Plus size={isSm ? 12 : 14} />
            </button>
        </div>
    );
}
