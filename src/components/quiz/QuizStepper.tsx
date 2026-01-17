import React from "react";

interface QuizStepperProps {
    current: number;
    total: number;
}

export function QuizStepper({ current, total }: QuizStepperProps) {
    // 0-based current
    const progress = Math.min(100, ((current + 1) / total) * 100);

    return (
        <div className="mb-8 relative z-10 w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="font-serif italic text-ink text-sm">Passo {current + 1} de {total}</span>
                <span className="font-bold text-[10px] uppercase tracking-widest text-ink/40">{Math.round(progress)}% Completo</span>
            </div>
            <div className="h-1 w-full bg-ink/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-olive transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
