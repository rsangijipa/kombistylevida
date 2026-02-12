import React from 'react';
import { Product } from '@/types/firestore';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FlavorDraggableProps {
    product: Product;
    disabled: boolean;
    onAdd: () => void;
    availableQty?: number; // Optional until we hook up real inventory
}

export const FlavorDraggable = ({ product, disabled, onAdd, availableQty = 999 }: FlavorDraggableProps) => {
    const isOutOfStock = availableQty <= 0;
    const isBlocked = disabled || isOutOfStock;

    return (
        <button
            onClick={onAdd}
            disabled={isBlocked}
            className={cn(
                "w-full flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-3 text-left transition-all touch-target active:scale-[0.98]",
                isBlocked ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-olive hover:shadow-md",
                isOutOfStock && "bg-paper2"
            )}
            aria-label={`Adicionar ${product.name} ao pack`}
        >
            <div className="h-12 w-12 rounded-lg bg-paper2 overflow-hidden flex-shrink-0 relative">
                {product.imageSrc ? (
                    <img src={product.imageSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-amber/20" />
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white uppercase transform -rotate-12">Esgotado</span>
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h4 className="font-bold text-ink">{product.name}</h4>
                <p className="text-xs text-ink2 line-clamp-1">
                    {isOutOfStock ? "Indisponível no momento" : product.shortDesc}
                </p>
            </div>

            <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                isBlocked ? "bg-ink/5 text-ink/20" : "bg-olive/10 text-olive group-hover:bg-olive group-hover:text-white"
            )}>
                <Plus size={20} />
            </div>
        </button>
    );
};
