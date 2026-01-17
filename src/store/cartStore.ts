import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUNDLES } from "@/data/catalog";

export type CartProductItem = {
    type: 'PRODUCT';
    productId: string;
    qty: number;
};

export type CartPackItem = {
    type: 'PACK';
    // Unique ID for the pack instance in cart (since multiple custom packs can exist)
    id: string;
    size: 6 | 12;
    items: { productId: string; qty: number }[];
    displayName: string;
    qty: number; // usually 1, but user might want 2 of the same custom pack
};

export type CartItem = CartProductItem | CartPackItem;

interface CartState {
    items: CartItem[];
    isOpen: boolean;

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
    addItem: (productId: string, qty?: number) => void;
    addPack: (pack: Omit<CartPackItem, 'type' | 'qty' | 'id'>) => void;
    removeItem: (itemId: string) => void; // productId for PRODUCT, id for PACK
    updateQty: (itemId: string, qty: number) => void;
    addBundle: (bundleId: string) => void;
    clearCart: () => void;
    toggleCart: (open?: boolean) => void;

    setSchedule: (date: string | null, slotId: string | null) => void;
    setNotes: (notes: string) => void;
    setBottlesToReturn: (qty: number) => void;

    setGiftOptions: (options: { isGift: boolean; from?: string; to?: string; message?: string }) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            selectedDate: null,
            selectedSlotId: null,
            notes: "",
            bottlesToReturn: 0,
            isGift: false,
            giftFrom: "",
            giftTo: "",
            giftMessage: "",

            addItem: (productId, qty = 1) => {
                set((state) => {
                    const existingIdx = state.items.findIndex(
                        (i) => i.type === 'PRODUCT' && i.productId === productId
                    );

                    if (existingIdx >= 0) {
                        const newItems = [...state.items];
                        newItems[existingIdx] = {
                            ...newItems[existingIdx],
                            qty: newItems[existingIdx].qty + qty
                        };
                        return { items: newItems, isOpen: true };
                    }

                    return {
                        items: [...state.items, { type: 'PRODUCT', productId, qty }],
                        isOpen: true
                    };
                });
            },

            addPack: (packData) => {
                const uniqueId = `pack-${packData.size}-${Date.now()}`;
                const newPack: CartPackItem = {
                    type: 'PACK',
                    id: uniqueId,
                    qty: 1,
                    ...packData
                };

                set((state) => ({
                    items: [...state.items, newPack],
                    isOpen: true
                }));
            },

            addBundle: (bundleId) => {
                const bundle = BUNDLES.find(b => b.id === bundleId);
                if (!bundle) return;

                set((state) => {
                    const newItems = [...state.items];
                    // Bundles add individual products
                    bundle.items.forEach(bItem => {
                        const existingIdx = newItems.findIndex(
                            i => i.type === 'PRODUCT' && i.productId === bItem.productId
                        );

                        if (existingIdx >= 0) {
                            newItems[existingIdx] = {
                                ...newItems[existingIdx],
                                qty: newItems[existingIdx].qty + bItem.qty
                            };
                        } else {
                            newItems.push({ type: 'PRODUCT', productId: bItem.productId, qty: bItem.qty });
                        }
                    });
                    return { items: newItems, isOpen: true };
                });
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((i) => {
                        if (i.type === 'PRODUCT') return i.productId !== itemId;
                        if (i.type === 'PACK') return i.id !== itemId;
                        return true;
                    }),
                }));
            },

            updateQty: (itemId, qty) => {
                set((state) => {
                    if (qty <= 0) {
                        return {
                            items: state.items.filter((i) => {
                                if (i.type === 'PRODUCT') return i.productId !== itemId;
                                if (i.type === 'PACK') return i.id !== itemId;
                                return true;
                            }),
                        };
                    }

                    return {
                        items: state.items.map((i) => {
                            if (i.type === 'PRODUCT' && i.productId === itemId) {
                                return { ...i, qty };
                            }
                            if (i.type === 'PACK' && i.id === itemId) {
                                return { ...i, qty };
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

            setSchedule: (date, slotId) => set({ selectedDate: date, selectedSlotId: slotId }),
            setNotes: (notes) => set({ notes }),
            setBottlesToReturn: (qty) => set({ bottlesToReturn: qty }),

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
