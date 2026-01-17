import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomerState {
    name: string;
    phone: string;
    deliveryMethod: "delivery" | "pickup";
    address: string;
    neighborhood: string;
    consentToSave: boolean; // LGPD

    // Actions
    setField: (field: keyof Omit<CustomerState, "setField" | "setConsent" | "reset">, value: string) => void;
    setConsent: (consent: boolean) => void;
    reset: () => void;
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set) => ({
            name: "",
            phone: "",
            deliveryMethod: "delivery",
            address: "",
            neighborhood: "",
            consentToSave: false,

            setField: (field, value) => {
                set((state) => ({ [field]: value }));
            },
            setConsent: (consent) => {
                set({ consentToSave: consent });
                if (!consent) {
                    // If consent revoked, we might want to clear local storage on next reload,
                    // but for now, we just update state. The persist middleware handles saving.
                    // Ideally, if consent is false, we shouldn't persist.
                    // Zustand persist partialize could handle this, but for simple MVP:
                }
            },
            reset: () => set({ name: "", phone: "", address: "", neighborhood: "", consentToSave: false }),
        }),
        {
            name: "kombi-customer-storage",
            partialize: (state) => {
                // If consent is false, we DON'T save personal data to localStorage.
                if (!state.consentToSave) return { consentToSave: false } as any;
                return state;
            },
        }
    )
);
