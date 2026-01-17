import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Product } from '@/data/catalog';
import { cn } from '@/lib/cn';

interface PackSlotProps {
    index: number;
    product: Product | null;
    onRemove: () => void;
    isLastAdded: boolean;
}

export const PackSlot = ({ index, product, onRemove, isLastAdded }: PackSlotProps) => {
    return (
        <div
            onClick={() => product && onRemove()}
            className={cn(
                "aspect-square rounded-xl flex items-center justify-center relative transition-all border-2 overflow-hidden",
                product
                    ? "bg-white border-olive cursor-pointer hover:border-red-400 group"
                    : "bg-ink/5 border-transparent border-dashed"
            )}
            role="button"
            aria-label={product ? `Remover ${product.name} do slot ${index + 1}` : `Slot ${index + 1} vazio`}
        >
            {product ? (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: isLastAdded ? [1, 1.15, 1] : 1,
                        opacity: 1
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-full h-full p-2 flex flex-col items-center justify-center text-center"
                >
                    {product.imageSrc ? (
                        <img src={product.imageSrc} alt="" className="w-12 h-12 object-contain mb-1" />
                    ) : null}
                    <div className="text-[10px] font-bold leading-tight text-olive line-clamp-2">
                        {product.name.split(' ')[0]}
                    </div>

                    {/* Overlay for removal hint */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={24} className="text-red-500" />
                    </div>
                </motion.div>
            ) : (
                <div className="text-ink/20 font-bold text-lg select-none">
                    {index + 1}
                </div>
            )}
        </div>
    );
};
