import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUNDLES } from "@/data/catalog";

export type CartItem = {
    productId: string;
    qty: number;
};

interface CartState {
    items: CartItem[];
    isOpen: boolean;

    // Schedule State (Ephemeral, but good to keep in store for checkout flow)
    selectedDate: string | null; // ISO Date String YYYY-MM-DD
    selectedSlotId: string | null;
    notes: string;

    // Actions
    addItem: (productId: string, qty?: number) => void;
    removeItem: (productId: string) => void;
    updateQty: (productId: string, qty: number) => void;
    addBundle: (bundleId: string) => void;
    clearCart: () => void;
    toggleCart: (open?: boolean) => void;

    setSchedule: (date: string | null, slotId: string | null) => void;
    setNotes: (notes: string) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            selectedDate: null,
            selectedSlotId: null,
            notes: "",

            addItem: (productId, qty = 1) => {
                set((state) => {
                    const existing = state.items.find((i) => i.productId === productId);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.productId === productId ? { ...i, qty: i.qty + qty } : i
                            ),
                            isOpen: true,
                        };
                    }
                    return { items: [...state.items, { productId, qty }], isOpen: true };
                });
            },

            addBundle: (bundleId) => {
                const bundle = BUNDLES.find(b => b.id === bundleId);
                if (!bundle) return;

                set((state) => {
                    let newItems = [...state.items];
                    bundle.items.forEach(bItem => {
                        const existingIdx = newItems.findIndex(i => i.productId === bItem.productId);
                        if (existingIdx >= 0) {
                            newItems[existingIdx] = {
                                ...newItems[existingIdx],
                                qty: newItems[existingIdx].qty + bItem.qty
                            };
                        } else {
                            newItems.push({ productId: bItem.productId, qty: bItem.qty });
                        }
                    });
                    return { items: newItems, isOpen: true };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.productId !== productId),
                }));
            },

            updateQty: (productId, qty) => {
                set((state) => {
                    if (qty <= 0) {
                        return { items: state.items.filter((i) => i.productId !== productId) };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.productId === productId ? { ...i, qty } : i
                        ),
                    };
                });
            },

            clearCart: () => set({ items: [], selectedDate: null, selectedSlotId: null, notes: "" }),
            toggleCart: (open) => set((state) => ({ isOpen: open ?? !state.isOpen })),

            setSchedule: (date, slotId) => set({ selectedDate: date, selectedSlotId: slotId }),
            setNotes: (notes) => set({ notes }),
        }),
        {
            name: "kombi-cart-storage",
            // We consciously persist the cart items so users don't lose them.
            // Schedule might be less relevant to persist if they come back days later, but acceptable for now.
        }
    )
);
