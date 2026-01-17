import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Customer } from "@/types/firestore";
import { CustomerState } from "@/store/customerStore";

/**
 * Updates or Creates a customer record in Firestore.
 * Used during checkout if consent is given.
 */
export async function upsertCustomer(state: CustomerState, totalOrderCents: number) {
    if (!state.consentToSave || !state.phone) return;

    // Normalize phone to digits only for ID
    const phoneId = state.phone.replace(/\D/g, "");
    if (!phoneId) return;

    const docRef = doc(db, "customers", phoneId);

    try {
        const snap = await getDoc(docRef);

        if (snap.exists()) {
            // Update
            await updateDoc(docRef, {
                name: state.name,
                neighborhood: state.neighborhood || snap.data().neighborhood,
                address: state.address || snap.data().address, // Update address only if provided
                lastOrderAt: new Date().toISOString(),
                orderCount: increment(1),
                lifetimeValueCents: increment(totalOrderCents),
                updatedAt: new Date().toISOString()
            });
        } else {
            // Create
            const newCustomer: Customer = {
                phone: phoneId,
                name: state.name,
                neighborhood: state.neighborhood,
                address: state.address,
                consentToSave: true,
                firstOrderAt: new Date().toISOString(),
                lastOrderAt: new Date().toISOString(),
                orderCount: 1,
                lifetimeValueCents: totalOrderCents,
                updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, newCustomer);
        }
    } catch (e) {
        console.error("Error upserting customer", e);
    }
}
