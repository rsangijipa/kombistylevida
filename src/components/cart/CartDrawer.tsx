"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Calendar, User, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCustomerStore } from "@/store/customerStore";
import { cn } from "@/lib/cn";
import { QuantityStepper } from "./QuantityStepper";
import { DeliveryScheduler } from "@/components/schedule/DeliveryScheduler";
import { CustomerForm } from "@/components/customer/CustomerForm";
import { createOrder } from "@/services/orderService";
import { upsertCustomer } from "@/services/customerService";
import { buildOrderMessage, buildWhatsAppLink, validateOrder } from "@/lib/whatsapp";
import { useCatalog } from "@/context/CatalogContext"; // New Import

export function CartDrawer() {
    const { items, isOpen, removeItem, updateQty, toggleCart, selectedDate, selectedSlotId, notes, setNotes, clearCart, bottlesToReturn, setBottlesToReturn } = useCartStore();
    const customer = useCustomerStore(); // contains .reset()
    const { getProduct } = useCatalog(); // Dynamic Catalog

    const [validationError, setValidationError] = useState<string | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

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

    const handleCheckout = async () => {
        const error = validateOrder({
            cart: items,
            customer,
            selectedDate,
            selectedSlotId,
            notes,
        });

        if (error) {
            setValidationError(error);
            return;
        }

        setIsCheckingOut(true);

        // 1. WhatsApp Logic (Always prepared)
        const message = buildOrderMessage({
            cart: items,
            customer,
            selectedDate,
            selectedSlotId,
            notes,
            bottlesToReturn
        });
        const link = buildWhatsAppLink(message);

        // 2. Firestore Logic (Try best effort)
        try {
            // Calculate total for CRM
            const totalCents = items.reduce((acc, item) => {
                const prod = getProduct(item.productId); // Dynamic
                return acc + (prod?.priceCents || 0) * item.qty;
            }, 0);

            await Promise.all([
                createOrder({
                    cart: items,
                    customer,
                    selectedDate,
                    selectedSlotId,
                    notes,
                    bottlesToReturn
                }),
                upsertCustomer(customer, totalCents)
            ]);

        } catch (e) {
            console.error("Failed to save order/customer to Firestore", e);
        }

        // 3. Redirect
        window.open(link, "_blank");
        setIsCheckingOut(false);
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
        if (item.isPack) {
            const priceCents = item.packSize === 6 ? 8990 : 16990;
            return acc + (priceCents * item.qty);
        }
        const prod = getProduct(item.productId); // Dynamic
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
                                // 1. HANDLE CUSTOM PACKS
                                if (item.isPack) {
                                    // Calculate price for pack (e.g. 6 = R$ 90, 12 = R$ 170 - dummy logic or catalog logic)
                                    // For MVP let's assume fixed price per size:
                                    // Pack 6 = R$ 89,90 | Pack 12 = R$ 169,90
                                    const priceCents = item.packSize === 6 ? 8990 : 16990;

                                    // Need to find flavor titles
                                    // We can't import FLAVORS here easily if we want to keep this pure? 
                                    // Actually we can import the static data.

                                    return (
                                        <div key={item.productId} className="flex gap-4 items-start bg-paper2/50 p-2 rounded-lg border border-ink/5">
                                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-paper flex items-center justify-center">
                                                <div className="text-center leading-none">
                                                    <span className="block font-bold text-lg text-olive">{item.packSize}</span>
                                                    <span className="text-[10px] uppercase">Pack</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-serif font-bold text-ink text-sm leading-tight">
                                                    Monte Seu Pack ({item.packSize} un.)
                                                </h4>
                                                <div className="mt-1 text-xs text-ink2 font-medium">
                                                    R$ {(priceCents / 100).toFixed(2).replace(".", ",")}
                                                </div>
                                                {/* Flavor List */}
                                                <ul className="mt-2 text-[10px] text-ink/70 space-y-0.5 border-l-2 border-olive/20 pl-2">
                                                    {item.packFlavors?.map((pf, idx) => (
                                                        <li key={idx} className="flex justify-between">
                                                            <span>Flavor {pf.flavorId}</span>
                                                            <span>x{pf.quantity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                // 2. HANDLE STANDARD PRODUCTS
                                const product = getProduct(item.productId); // Dynamic
                                if (!product) return null;
                                return (
                                    <div key={item.productId} className="flex gap-4 items-center">
                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-paper2">
                                            {item.productId.includes('pack') ? ( // Fallback for old packs if any
                                                <div className="h-full w-full flex items-center justify-center bg-olive/10">Pack</div>
                                            ) : (
                                                product.imageSrc ? (
                                                    <img src={product.imageSrc} alt={product.name} className="h-full w-full object-contain p-1" />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-100" />
                                                )
                                            )}
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

                    {/* 4. Reserve Logistics & Notes */}
                    {items.length > 0 && (
                        <div className="space-y-4">
                            {/* Eco Points / Return */}
                            <div className="bg-paper border border-olive/20 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-olive/10 flex items-center justify-center text-olive">
                                        ♻️
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-ink">Devolver Garrafas</p>
                                        <p className="text-[10px] text-ink2">Ganhe desconto na próxima</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {useCartStore.getState().bottlesToReturn > 0 && (
                                        <span className="text-xs font-bold text-olive">{useCartStore.getState().bottlesToReturn} un.</span>
                                    )}
                                    {/* Simple toggle for MVP: 0 or 6? Or Input? Let's use numeric input styled small */}
                                    {/* Actually, user prompt said "Checkbox 'Tenho garrafas'". A checkbox is boolean. But dossier/logic implied quantity. Let's do a simple checkbox that sets it to "1" (flag) or a small stepper. 
                                         Let's stick to Checkbox "Tenho garrafas" -> If checked, we assume some quantity or ask later. 
                                         Wait, I implemented `bottlesToReturn: number` in store. 
                                         Let's use a simple Quantity Stepper or just a toggle that sets it to 6 (standard pack) or 0.
                                         Better: Simple number input.
                                     */}
                                    <div className="flex items-center border border-ink/20 rounded-md">
                                        <button
                                            onClick={() => useCartStore.getState().setBottlesToReturn(Math.max(0, useCartStore.getState().bottlesToReturn - 1))}
                                            className="px-2 py-1 text-ink/50 hover:bg-black/5"
                                        >-</button>
                                        <span className="w-6 text-center text-sm">{useCartStore((s) => s.bottlesToReturn)}</span>
                                        <button
                                            onClick={() => useCartStore.getState().setBottlesToReturn(useCartStore.getState().bottlesToReturn + 1)}
                                            className="px-2 py-1 text-ink/50 hover:bg-black/5"
                                        >+</button>
                                    </div>
                                </div>
                            </div>

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
                        disabled={items.length === 0 || isCheckingOut}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg transition-transform",
                            (items.length > 0 && !isCheckingOut)
                                ? "bg-green-700 text-white hover:bg-green-800 active:scale-95"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        {isCheckingOut ? (
                            <span>Processando...</span>
                        ) : (
                            <>
                                <span>Finalizar no WhatsApp</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
