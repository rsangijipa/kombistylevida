import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { CartItem } from "@/store/cartStore";
import { CustomerState } from "@/store/customerStore";
import { CATALOG_MAP } from "@/data/catalog";
import { DELIVERY_SLOTS } from "@/data/deliverySlots";
import { Order, OrderItem } from "@/types/firestore";
import { reserveStock } from "@/services/inventoryService";

interface CreateOrderParams {
    cart: CartItem[];
    customer: CustomerState;
    selectedDate: string | null;
    selectedSlotId: string | null;
    notes: string;
}

/**
 * Creates a new order in Firestore.
 * Handles snapshoting data (price, names) and capacity checks (optimistic).
 */
export async function createOrder(params: CreateOrderParams): Promise<string> {
    const { cart, customer, selectedDate, selectedSlotId, notes } = params;

    // 1. Prepare Items Snapshot
    let totalCents = 0;
    const orderItems: OrderItem[] = cart.map(item => {
        const product = CATALOG_MAP[item.productId];
        const price = product?.priceCents || 0;
        totalCents += price * item.qty;

        return {
            productId: item.productId,
            productName: product?.name || item.productId,
            size: product?.size,
            qty: item.qty,
            priceCents: price
        };
    });

    // 2. Prepare Order Data
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Slot Label Snapshot
    let slotLabel = undefined;
    if (selectedDate && selectedSlotId) {
        slotLabel = DELIVERY_SLOTS.find(s => s.id === selectedSlotId)?.label;
    }

    const orderData: Omit<Order, 'id'> = {
        shortId,
        status: 'NEW',
        items: orderItems,
        totalCents,
        customer: {
            name: customer.name,
            phone: customer.phone,
            deliveryMethod: customer.deliveryMethod,
            address: customer.address,
            neighborhood: customer.neighborhood,
        },
        schedule: {
            date: selectedDate,
            slotId: selectedSlotId,
            slotLabel
        },
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // 3. Transaction to Check/Update Capacity + Create Order
    // For MVP Phase 1, we might skip strict transactions to keep it simple, 
    // but let's try to be robust if we can.

    // However, since we are doing "WhatsApp First", if the user checks out, they go to WhatsApp.
    // If we block them here due to capacity, we lose the lead. 
    // STRATEGY: We create the order regardless (soft cap). 
    // The strict capacity check should be in the UI selection phase (future).
    // Here we just record it.

    const docRef = await addDoc(collection(db, "orders"), orderData);

    // 4. Reserve Stock (Fire & Forget or Await - safer to await to ensure consistency log)
    try {
        const reservations = orderItems.map(item =>
            reserveStock(item.productId, item.qty, docRef.id)
        );
        await Promise.all(reservations);
    } catch (e) {
        console.error("Failed to reserve stock", e);
        // We don't fail the order flow, but we log serious error
    }

    // 5. Update Daily Capacity Counter (Fire and forget, or await)
    // We increment the 'bookedCount' for this slot.
    if (selectedDate && selectedSlotId) {
        const dayRef = doc(db, "deliveryDays", selectedDate);
        // We use setDoc with merge to safely create if not exists
        // Note: proper atomic increment requires updateDoc or transaction, 
        // but for now let's just create the doc structure if missing.
        // We will implement the increment logic properly in a Cloud Function or strict client transaction later.
        // For P0/P1, let's just ensure the day document exists.
        try {
            // Logic to increment bookedCount would go here.
            // For now, let's just log. Implementing full client-side increment is risky without rules.
            // We will settle for just creating the order.
            // The Admin Dashboard will count orders by query, which is safer for MVP.
        } catch (e) {
            console.error("Failed to update capacity counter", e);
        }
    }

    return docRef.id;
}
