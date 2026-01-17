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
                ecoPoints: 0,
                bottlesReturned: 0,
                updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, newCustomer);
        }
    } catch (e) {
        console.error("Error upserting customer", e);
    }
}

/**
 * Manually adjusts a customer's eco-credits (Admin only).
 */
export async function adjustCustomerCredits(phoneId: string, delta: number, reason: string, adminUid: string) {
    const docRef = doc(db, "customers", phoneId);

    // We could log this action in a separate 'auditLogs' collection for security
    // For MVP, we just update the user record.

    try {
        await updateDoc(docRef, {
            ecoPoints: increment(delta),
            updatedAt: new Date().toISOString()
        });

        // Log movement (optional improvement: separate collection)
        console.log(`[Admin ${adminUid}] Adjusted credits for ${phoneId} by ${delta}. Reason: ${reason}`);
    } catch (e) {
        console.error("Error adjusting credits", e);
        throw e;
    }
}

export async function toggleCustomerSubscription(phoneId: string, isSubscriber: boolean, adminUid: string) {
    const docRef = doc(db, "customers", phoneId);
    try {
        await updateDoc(docRef, {
            isSubscriber: isSubscriber,
            updatedAt: new Date().toISOString()
        });
        console.log(`[Admin ${adminUid}] Set subscription for ${phoneId} to ${isSubscriber}`);
    } catch (e) {
        console.error("Error toggling subscription", e);
        throw e;
    }
}
