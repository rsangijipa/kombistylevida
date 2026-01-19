import "server-only";
import { adminDb } from "./admin";
import { Order } from "@/types/firestore";

// Collection References (Server-Side)
const ORDERS_COLLECTION = "orders";
const DELIVERY_SLOTS_COLLECTION = "deliverySlots";

/**
 * Server-side abstraction for interacting with Firestore via Admin SDK.
 * This ensures we keep logic centralized and mockable if needed.
 */
export const AdminService = {
    // --- ORDERS ---

    async getOrder(orderId: string): Promise<Order | null> {
        const snap = await adminDb.collection(ORDERS_COLLECTION).doc(orderId).get();
        if (!snap.exists) return null;
        return { id: snap.id, ...snap.data() } as Order;
    },

    async createOrder(id: string, data: Partial<Order>) {
        await adminDb.collection(ORDERS_COLLECTION).doc(id).set({
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    },

    async updateOrder(id: string, data: Partial<Order>) {
        await adminDb.collection(ORDERS_COLLECTION).doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });
    },

    // --- DELIVERY SLOTS ---

    getSlotsCollection() {
        return adminDb.collection(DELIVERY_SLOTS_COLLECTION);
    },

    async getSlot(slotId: string) {
        const snap = await this.getSlotsCollection().doc(slotId).get();
        return snap.exists ? snap.data() : null;
    }
};
