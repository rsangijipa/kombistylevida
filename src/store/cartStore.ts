import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUNDLES } from "@/data/catalog";

export type CartProductItem = {
    type: 'PRODUCT';
    productId: string;
    quantity: number;
};

export type CartPackItem = {
    type: 'PACK';
    // Unique ID for the pack instance in cart (since multiple custom packs can exist)
    id: string;
    size: 6 | 12;
    items: { productId: string; quantity: number }[];
    displayName: string; // e.g. "Pack 6 (Personalizado)"
    quantity: number; // usually 1, but user might want 2 of the same custom pack
};

export type CartBundleItem = {
    type: 'BUNDLE';
    bundleId: string;
    quantity: number;
};

export type CartItem = CartProductItem | CartPackItem | CartBundleItem;

interface CartState {
    items: CartItem[];
    isOpen: boolean;

    // Server-Side Sync
    orderId: string | null;
    isSyncing: boolean;

    // Schedule State (Ephemeral)
    selectedDate: string | null;
    selectedSlotId: string | null;
    notes: string;
    bottlesToReturn: number;

    // Gift State
    isGift: boolean;
    giftFrom: string;
    giftTo: string;
    giftMessage: string;

    // Actions
    addItem: (productId: string, quantity?: number) => void;
    addPack: (pack: Omit<CartPackItem, 'type' | 'id' | 'quantity'>) => void;
    addBundle: (bundleId: string) => void;
    removeItem: (itemId: string) => void; // productId for PRODUCT, id for PACK, bundleId for BUNDLE
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: (open?: boolean) => void;

    // Server Sync
    initCart: () => Promise<void>;

    setSchedule: (date: string | null, slotId: string | null) => void;
    setNotes: (notes: string) => void;
    setBottlesToReturn: (quantity: number) => void;

    setGiftOptions: (options: { isGift: boolean; from?: string; to?: string; message?: string }) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            orderId: null,
            isSyncing: false,
            selectedDate: null,
            selectedSlotId: null,
            notes: "",
            bottlesToReturn: 0,
            isGift: false,
            giftFrom: "",
            giftTo: "",
            giftMessage: "",

            addItem: (productId, quantity = 1) => {
                set((state) => {
                    const existingIdx = state.items.findIndex(
                        (i) => i.type === 'PRODUCT' && i.productId === productId
                    );

                    if (existingIdx >= 0) {
                        const newItems = [...state.items];
                        const current = newItems[existingIdx] as CartProductItem;
                        newItems[existingIdx] = {
                            ...current,
                            quantity: current.quantity + quantity
                        };
                        return { items: newItems, isOpen: true };
                    }

                    return {
                        items: [...state.items, { type: 'PRODUCT', productId, quantity }],
                        isOpen: true
                    };
                });
            },

            addPack: (packData) => {
                const uniqueId = `pack-${packData.size}-${Date.now()}`;
                const newPack: CartPackItem = {
                    type: 'PACK',
                    id: uniqueId,
                    quantity: 1,
                    ...packData
                };

                set((state) => ({
                    items: [...state.items, newPack],
                    isOpen: true
                }));
            },

            addBundle: (bundleId) => {
                // Modified: Now adds as BUNDLE type instead of unpacking
                // Check if bundle exists in catalog (used for validation, though we might not strict check here if we trust ID)
                // const bundle = BUNDLES.find(b => b.id === bundleId); 
                // We rely on UI to provide valid ID.

                set((state) => {
                    const existingIdx = state.items.findIndex(
                        (i) => i.type === 'BUNDLE' && i.bundleId === bundleId
                    );

                    if (existingIdx >= 0) {
                        const newItems = [...state.items];
                        const current = newItems[existingIdx] as CartBundleItem;
                        newItems[existingIdx] = {
                            ...current,
                            quantity: current.quantity + 1
                        };
                        return { items: newItems, isOpen: true };
                    }

                    return {
                        items: [...state.items, { type: 'BUNDLE', bundleId, quantity: 1 }],
                        isOpen: true
                    };
                });
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((i) => {
                        if (i.type === 'PRODUCT') return i.productId !== itemId;
                        if (i.type === 'PACK') return i.id !== itemId;
                        if (i.type === 'BUNDLE') return i.bundleId !== itemId;
                        return true;
                    }),
                }));
            },

            updateQuantity: (itemId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter((i) => {
                                if (i.type === 'PRODUCT') return i.productId !== itemId;
                                if (i.type === 'PACK') return i.id !== itemId;
                                if (i.type === 'BUNDLE') return i.bundleId !== itemId;
                                return true;
                            }),
                        };
                    }

                    return {
                        items: state.items.map((i) => {
                            if (i.type === 'PRODUCT' && i.productId === itemId) {
                                return { ...i, quantity };
                            }
                            if (i.type === 'PACK' && i.id === itemId) {
                                return { ...i, quantity };
                            }
                            if (i.type === 'BUNDLE' && i.bundleId === itemId) {
                                return { ...i, quantity };
                            }
                            return i;
                        }),
                    };
                });
            },

            clearCart: () => set({
                items: [],
                selectedDate: null,
                selectedSlotId: null,
                notes: "",
                bottlesToReturn: 0,
                isGift: false,
                giftFrom: "",
                giftTo: "",
                giftMessage: ""
            }),

            toggleCart: (open) => set((state) => ({ isOpen: open ?? !state.isOpen })),

            initCart: async () => {
                const state = get();
                if (state.isSyncing) return;

                set({ isSyncing: true });
                try {
                    const res = await fetch('/api/cart/init', { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        set({ orderId: data.orderId });
                        // Optionally sync remote items back to local if we want full sync
                        // For MVP: We just ensure we have an Order ID and Cookie

                        // If order has schedule, sync it to local state
                        if (data.order?.deliveryReservation?.slotId) {
                            set({
                                selectedSlotId: data.order.deliveryReservation.slotId,
                                selectedDate: data.order.delivery.date
                            });
                        }
                    }
                } catch (e) {
                    console.error("Cart init failed", e);
                } finally {
                    set({ isSyncing: false });
                }
            },

            setSchedule: (date, slotId) => set({ selectedDate: date, selectedSlotId: slotId }),
            setNotes: (notes) => set({ notes }),
            setBottlesToReturn: (quantity) => set({ bottlesToReturn: quantity }),

            setGiftOptions: (options) => set((state) => ({
                isGift: options.isGift,
                giftFrom: options.from ?? state.giftFrom,
                giftTo: options.to ?? state.giftTo,
                giftMessage: options.message ?? state.giftMessage
            })),
        }),
        {
            name: "kombi-cart-storage",
        }
    )
);
