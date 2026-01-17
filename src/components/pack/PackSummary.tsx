import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

interface PackSummaryProps {
    filledCount: number;
    packSize: number;
    totalPriceCents: number;
    onAddToCart: () => void;
}

export const PackSummary = ({ filledCount, packSize, totalPriceCents, onAddToCart }: PackSummaryProps) => {
    const isFull = filledCount === packSize;
    const progress = (filledCount / packSize) * 100;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-ink/10 p-4 pb-8 z-50 shadow-paper">
            <div className="mx-auto max-w-md space-y-3">
                {/* Progress Bar (Visible near CTA) */}
                <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                    <motion.div
                        className={cn("h-full", isFull ? "bg-olive" : "bg-amber")}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-ink/50">
                            {isFull ? "Pack Completo" : `Escolha +${packSize - filledCount}`}
                        </span>
                        <span className="text-xl font-bold text-olive">
                            R$ {(totalPriceCents / 100).toFixed(2).replace(".", ",")}
                        </span>
                    </div>

                    <button
                        onClick={onAddToCart}
                        disabled={!isFull}
                        className={cn(
                            "flex-1 h-14 rounded-full font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all touch-target text-sm",
                            isFull
                                ? "bg-olive text-white shadow-lg shadow-olive/20 hover:bg-olive/90 scale-100"
                                : "bg-ink/10 text-ink/40 cursor-not-allowed scale-95"
                        )}
                    >
                        <ShoppingBag size={20} />
                        {isFull ? "Adicionar Pack" : "Complete a Caixa"}
                    </button>
                </div>
            </div>
        </div>
    );
};
