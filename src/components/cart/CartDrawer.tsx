"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Calendar, User, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCustomerStore } from "@/store/customerStore";
import { cn } from "@/lib/cn";
import { QuantityStepper } from "./QuantityStepper";
import { DeliveryScheduler } from "@/components/cart/DeliveryScheduler";
import { CustomerForm } from "@/components/customer/CustomerForm";
import { createOrder } from "@/services/orderService";
import { upsertCustomer } from "@/services/customerService";
import { buildOrderMessage, buildWhatsAppLink, validateOrder } from "@/lib/whatsapp";
import { useCatalog } from "@/context/CatalogContext"; // New Import

export function CartDrawer() {
    const { items, isOpen, removeItem, updateQty, toggleCart, selectedDate, selectedSlotId, notes, setNotes, clearCart, bottlesToReturn, setBottlesToReturn } = useCartStore();
    const customer = useCustomerStore(); // contains .reset()
    const { getProduct, getCombo, products, combos } = useCatalog(); // Dynamic Catalog

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
            bottlesToReturn,
            isGift: useCartStore.getState().isGift,
            giftFrom: useCartStore.getState().giftFrom,
            giftTo: useCartStore.getState().giftTo,
            giftMessage: useCartStore.getState().giftMessage,
            catalog: { products, combos }
        });
        const link = buildWhatsAppLink(message);

        // 2. Firestore Logic (Try best effort)
        try {
            // Calculate total for CRM
            const totalCents = items.reduce((acc, item) => {
                if (item.type === 'PACK') {
                    const price = item.size === 6 ? 8990 : 16990;
                    return acc + (price * item.qty);
                }
                if (item.type === 'BUNDLE') {
                    const combo = getCombo(item.bundleId);
                    return acc + ((combo?.priceCents || 0) * item.qty);
                }
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
        if (item.type === 'PACK') {
            const priceCents = item.size === 6 ? 8990 : 16990;
            return acc + (priceCents * item.qty);
        }

        if (item.type === 'BUNDLE') {
            const combo = getCombo(item.bundleId);
            return acc + ((combo?.priceCents || 0) * item.qty);
        }

        // Handle Composite IDs for Price
        let productId = item.productId;
        let sizeCode = "";

        if (item.productId.includes("::")) {
            const parts = item.productId.split("::");
            productId = parts[0];
            sizeCode = parts[1];
        }

        const prod = getProduct(productId);

        if (sizeCode && prod?.variants) {
            const variant = prod.variants.find(v => v.size.includes(sizeCode));
            if (variant) {
                return acc + (variant.price * 100 * item.qty);
            }
        }

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

                {/* Header with Visual Stepper */}
                <div className="flex flex-col border-b border-ink/10 bg-paper2/50">
                    <div className="flex items-center justify-between p-4 pb-2">
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
                    {/* Stepper */}
                    {items.length > 0 && (
                        <div className="px-4 pb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                            <div className={cn("flex items-center gap-1", !customer.name ? "text-olive" : "text-olive/60")}>
                                <span className={cn("w-4 h-4 rounded-full flex items-center justify-center border", !customer.name ? "border-olive bg-olive text-paper" : "border-olive/60")}>1</span>
                                <span>Sacola</span>
                            </div>
                            <div className="h-px w-4 bg-ink/10" />
                            <div className={cn("flex items-center gap-1", customer.name && !isCheckingOut ? "text-olive" : "text-ink/30")}>
                                <span className={cn("w-4 h-4 rounded-full flex items-center justify-center border ", customer.name && !isCheckingOut ? "border-olive bg-olive text-paper" : "border-ink/20")}>2</span>
                                <span>Dados</span>
                            </div>
                            <div className="h-px w-4 bg-ink/10" />
                            <div className={cn("flex items-center gap-1", isCheckingOut ? "text-olive" : "text-ink/30")}>
                                <span className="w-4 h-4 rounded-full flex items-center justify-center border border-ink/20">3</span>
                                <span>Enviar</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8">

                    {/* 1. Items List */}
                    <div className="space-y-6">
                        {items.length === 0 ? (
                            <div className="py-12 text-center text-ink2 italic flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center text-ink/20">
                                    <ShoppingBag size={32} />
                                </div>
                                <p>Sua sacola está vazia.</p>
                                <button onClick={() => toggleCart(false)} className="text-sm font-bold underline text-olive">
                                    Ver produtos
                                </button>
                            </div>
                        ) : (
                            items.map((item) => {
                                // 1. HANDLE CUSTOM PACKS
                                if (item.type === 'PACK') {
                                    const priceCents = item.size === 6 ? 8990 : 16990;

                                    return (
                                        <div key={item.id} className="flex gap-4 items-start bg-paper p-4 rounded-xl border border-ink/5 shadow-sm">
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-paper2/50 flex flex-col items-center justify-center gap-1">
                                                <span className="font-serif font-bold text-2xl text-olive leading-none">{item.size}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40">Pack</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-serif font-bold text-ink text-base">
                                                    {item.displayName}
                                                </h4>
                                                <div className="mt-1 text-sm text-ink2 font-medium">
                                                    R$ {(priceCents / 100).toFixed(2).replace(".", ",")}
                                                </div>

                                                {/* Flavor List Refined */}
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {item.items.map((subItem, idx) => {
                                                        const p = getProduct(subItem.productId);
                                                        return (
                                                            <span key={idx} className="inline-flex items-center rounded-sm bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/70">
                                                                {subItem.qty}x {p?.name.split(' ')[0] || 'Sabor'}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-ink/30 hover:text-red-500 p-2 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                }

                                // 2. HANDLE BUNDLES (New)
                                if (item.type === 'BUNDLE') {
                                    const combo = getCombo(item.bundleId);
                                    if (!combo) return null; // Should we show loading or error?

                                    const priceCents = combo.priceCents;

                                    return (
                                        <div key={item.bundleId} className="flex gap-4 items-start bg-paper p-4 rounded-xl border border-purple-100 shadow-sm">
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-purple-100 bg-purple-50 flex flex-col items-center justify-center gap-1 text-purple-700">
                                                <ShoppingBag size={24} />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-purple-500">Combo</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-serif font-bold text-ink text-base">
                                                    {combo.name}
                                                </h4>
                                                <div className="mt-1 text-sm text-ink2 font-medium">
                                                    R$ {(priceCents / 100).toFixed(2).replace(".", ",")}
                                                </div>

                                                {/* Combo Items */}
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {combo.items.map((subItem, idx) => {
                                                        const p = getProduct(subItem.productId);
                                                        return (
                                                            <span key={idx} className="inline-flex items-center rounded-sm bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-700">
                                                                {subItem.qty}x {p?.name.split(' ')[0] || 'Item'}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <QuantityStepper
                                                    qty={item.qty}
                                                    onUpdate={(val) => updateQty(item.bundleId, val)}
                                                    size="sm"
                                                />
                                                <button
                                                    onClick={() => removeItem(item.bundleId)}
                                                    className="text-ink/30 hover:text-red-500 p-2 transition-colors mt-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                // 3. HANDLE STANDARD PRODUCTS
                                if (item.type === 'PRODUCT') {
                                    let productId = item.productId;
                                    let sizeDisplay = "";
                                    let finalPrice = 0;

                                    // Check for composite ID (e.g., "ginger-lemon::300")
                                    if (item.productId.includes("::")) {
                                        const parts = item.productId.split("::");
                                        productId = parts[0];
                                        const sizeCode = parts[1]; // "300"
                                        sizeDisplay = `${sizeCode}ml`;
                                    }

                                    const product = getProduct(productId); // Dynamic Catalog
                                    if (!product) return null;

                                    // Determine Price: Variant or Base
                                    if (sizeDisplay) {
                                        // Try to find specific variant price
                                        const variant = product.variants?.find(v => v.size.includes(sizeDisplay));
                                        finalPrice = variant ? (variant.price * 100) : (product.priceCents || 0);
                                    } else {
                                        finalPrice = product.priceCents || 0;
                                    }

                                    return (
                                        <div key={item.productId} className="flex gap-4 items-center bg-paper p-3 rounded-xl border border-transparent hover:border-ink/5 transition-colors">
                                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-ink/5 bg-paper2">
                                                {item.productId.includes('pack') ? (
                                                    <div className="h-full w-full flex items-center justify-center bg-olive/10 text-xs">Pack</div>
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

                                                {/* Size Badge */}
                                                {sizeDisplay && (
                                                    <span className="inline-block mt-1 mr-2 px-1.5 py-0.5 rounded bg-ink/5 text-[10px] font-bold uppercase tracking-wider text-ink/60">
                                                        {sizeDisplay}
                                                    </span>
                                                )}

                                                <div className="mt-1 text-xs text-ink2 font-medium">
                                                    R$ {(finalPrice / 100).toFixed(2).replace(".", ",")}
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
                                }
                                return null;
                            })
                        )}
                    </div>

                    {items.length > 0 && <div className="h-px w-full bg-ink/10 my-4" />}

                    {/* 2. Customer Data (Step 2) */}
                    {items.length > 0 && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                            <div className="flex items-center gap-2 text-olive font-bold border-b border-ink/5 pb-2">
                                <User size={18} />
                                <span className="text-xs uppercase tracking-wider">Seus Dados</span>
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
                            <div className="bg-paper border border-olive/20 rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden">
                                {/* Decorative Background Element */}
                                <div className="absolute -right-4 -top-4 text-olive/5 rotate-12">
                                    <div className="text-[100px] leading-none">♻️</div>
                                </div>

                                <div className="flex items-center justify-between z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-olive/10 flex items-center justify-center text-olive">
                                            ♻️
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-ink">Devolver Garrafas</p>
                                            <p className="text-[10px] text-ink2 max-w-[150px] leading-tight">
                                                Avise quantas garrafas vazias irá devolver na entrega e ganhe Eco-Points!
                                            </p>
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
                                        <div className="flex items-center border border-ink/20 rounded-md bg-white">
                                            <button
                                                onClick={() => setBottlesToReturn(Math.max(0, bottlesToReturn - 1))}
                                                className="px-2 py-1 text-ink/50 hover:bg-black/5"
                                            >-</button>
                                            <span className="w-6 text-center text-sm">{bottlesToReturn}</span>
                                            <button
                                                onClick={() => setBottlesToReturn(bottlesToReturn + 1)}
                                                className="px-2 py-1 text-ink/50 hover:bg-black/5"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
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
                            "w-full flex items-center justify-center gap-3 rounded-full py-5 min-h-[64px] text-lg font-bold uppercase tracking-widest shadow-lg transition-transform touch-target",
                            (items.length > 0 && !isCheckingOut)
                                ? "bg-green-700 text-white hover:bg-green-800 active:scale-95"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                        aria-label="Enviar pedido pelo WhatsApp"
                    >
                        {isCheckingOut ? (
                            <span>Processando...</span>
                        ) : (
                            <>
                                <span>Enviar Pedido</span>
                                <ArrowRight size={24} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
}
