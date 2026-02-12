import { CartItem } from "@/store/cartStore";
import { CustomerState } from "@/store/customerStore";
import { PACK_PRICE_CENTS } from "@/config/pricing";

interface CreateOrderParams {
    cart: CartItem[];
    customer: CustomerState;
    selectedDate: string | null;
    selectedSlotId: string | null;
    notes: string;
    bottlesToReturn: number;
    idempotencyKey: string;
}

/**
 * Confirms order via Server API.
 * Replaces client-side Firestore writes.
 */
export async function createOrder(params: CreateOrderParams): Promise<{ orderId: string; whatsappMessage: string }> {
    const { cart, customer, notes, bottlesToReturn, idempotencyKey, selectedDate, selectedSlotId } = params;

    // Calculate total (Client side estimate)
    // We pass this to server, server trusts it for MVP or recalculates if robust
    // Here we duplicate calculation logic or just pass what we have.
    // Let's pass what we have.

    // Quick calc total
    let totalCents = 0;
    cart.forEach(item => {
        if (item.type === 'PACK') {
            totalCents += PACK_PRICE_CENTS[item.size] * item.quantity;
        } else {
            // We'd need catalog access here, but simpler: Let server handle it or pass 0
            // CartDrawer calculated it for UI. 
            // Ideally we shouldn't rely on client total for critical business logic.
            // But for saving "Snapshot", it's ok.
        }
    });

    const res = await fetch('/api/order/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cart,
            customer,
            selectedDate,
            selectedSlotId,
            notes,
            bottlesToReturn,
            idempotencyKey
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown Error" }));
        console.error("Checkout API Error:", errorData);
        throw new Error(errorData.error || "Failed to checkout");
    }

    const data = await res.json();
    return {
        orderId: data.orderId,
        whatsappMessage: data.whatsappMessage
    };
}
