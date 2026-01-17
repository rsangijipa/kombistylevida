"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Calendar, User, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCustomerStore } from "@/store/customerStore";
import { CATALOG_MAP } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { QuantityStepper } from "./QuantityStepper";
import { DeliveryScheduler } from "@/components/schedule/DeliveryScheduler";
import { CustomerForm } from "@/components/customer/CustomerForm";
import { buildOrderMessage, buildWhatsAppLink, validateOrder } from "@/lib/whatsapp";

export function CartDrawer() {
    const { items, isOpen, removeItem, updateQty, toggleCart, selectedDate, selectedSlotId, notes, setNotes, clearCart } = useCartStore();
    const customer = useCustomerStore(); // contains .reset()
    const [validationError, setValidationError] = useState<string | null>(null);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    // Re-validate when dependencies change, but only if error already exists (to clear it)
    useEffect(() => {
        if (validationError) {
            const error = validateOrder({ cart: items, customer, selectedDate, selectedSlotId, notes });
            if (!error) setValidationError(null);
        }
    }, [items, customer, selectedDate, selectedSlotId, notes, validationError]);

    const handleCheckout = () => {
        const error = validateOrder({
            cart: items,
            customer,
            selectedDate,
            selectedSlotId,
            notes
        });

        if (error) {
            setValidationError(error);
            return;
        }

        const message = buildOrderMessage({
            cart: items,
            customer,
            selectedDate,
            selectedSlotId,
            notes
        });

        const link = buildWhatsAppLink(message);
        window.open(link, "_blank");
    };

    const handleClearData = () => {
        if (confirm("Tem certeza que deseja limpar seus dados salvos e esvaziar a sacola?")) {
            customer.reset();
            clearCart();
            toggleCart(false);
        }
    };

    if (!isOpen) return null;

    const subtotal = items.reduce((acc, item) => {
        const prod = CATALOG_MAP[item.productId];
        return acc + (prod?.priceCents || 0) * item.qty;
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-in fade-in"
                onClick={() => toggleCart(false)}
            />

            {/* Drawer */}
            <div className="relative h-full w-full max-w-md bg-paper shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-ink/10 bg-paper2/50">
                    <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-olive">
                        <ShoppingBag size={20} />
                        Sua Sacola
                    </h2>
                    <button
                        onClick={() => toggleCart(false)}
                        className="rounded-full p-2 text-ink/50 hover:bg-black/5 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8">

                    {/* 1. Items List */}
                    <div className="space-y-4">
                        {items.length === 0 ? (
                            <div className="py-10 text-center text-ink2 italic">
                                Sua sacola está vazia.
                            </div>
                        ) : (
                            items.map((item) => {
                                const product = CATALOG_MAP[item.productId];
                                if (!product) return null;
                                return (
                                    <div key={item.productId} className="flex gap-4 items-center">
                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-paper2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={product.imageSrc} alt={product.name} className="h-full w-full object-contain p-1" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-serif font-bold text-ink text-sm leading-tight">{product.name}</h4>
                                            <div className="mt-1 text-xs text-ink2 font-medium">
                                                R$ {((product.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <QuantityStepper
                                                qty={item.qty}
                                                onUpdate={(val) => updateQty(item.productId, val)}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {items.length > 0 && <div className="h-[1px] w-full bg-ink/10" />}

                    {/* 2. Customer Data (Step 1) */}
                    {items.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-olive font-bold">
                                <User size={18} />
                                <span className="text-sm uppercase tracking-wider">Seus Dados</span>
                            </div>
                            <CustomerForm />
                        </div>
                    )}

                    {/* 3. Schedule (Only if delivery) */}
                    {items.length > 0 && customer.deliveryMethod === "delivery" && (
                        <div className="space-y-2 animate-in fade-in">
                            <div className="flex items-center gap-2 text-olive font-bold">
                                <Calendar size={18} />
                                <span className="text-sm uppercase tracking-wider">Agendamento</span>
                            </div>
                            <DeliveryScheduler />
                        </div>
                    )}

                    {/* 4. Notes */}
                    {items.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-ink/50">Observações</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Algo mais? Troco, portaria, etc."
                                className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-olive"
                                rows={2}
                            />
                        </div>
                    )}

                    {/* Clear Data Action */}
                    <div className="pt-4 flex justify-center">
                        <button
                            onClick={handleClearData}
                            className="flex items-center gap-2 text-xs text-red-700/60 hover:text-red-700 hover:underline"
                        >
                            <Trash2 size={12} />
                            Limpar meus dados e esvaziar sacola
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-ink/10 bg-paper2/80 p-4 backdrop-blur-md">
                    {validationError && (
                        <div className="mb-3 text-sm text-red-600 font-bold bg-red-50 p-2 rounded-md border border-red-100 animate-pulse">
                            {validationError}
                        </div>
                    )}

                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-ink/60 uppercase tracking-widest">Total Estimado</span>
                        <span className="font-serif text-2xl font-bold text-olive">
                            R$ {(subtotal / 100).toFixed(2).replace(".", ",")}
                        </span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg transition-transform",
                            items.length > 0
                                ? "bg-green-700 text-white hover:bg-green-800 active:scale-95"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        <span>Finalizar no WhatsApp</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
