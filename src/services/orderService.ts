import { CartItem } from "@/store/cartStore";
import { CustomerState } from "@/store/customerStore";

interface CreateOrderParams {
    cart: CartItem[];
    customer: CustomerState;
    selectedDate: string | null;
    selectedSlotId: string | null;
    notes: string;
    bottlesToReturn: number;
}

/**
 * Confirms order via Server API.
 * Replaces client-side Firestore writes.
 */
export async function createOrder(params: CreateOrderParams): Promise<string> {
    const { cart, customer, notes, bottlesToReturn } = params;

    // Calculate total (Client side estimate)
    // We pass this to server, server trusts it for MVP or recalculates if robust
    // Here we duplicate calculation logic or just pass what we have.
    // Let's pass what we have.

    // Quick calc total
    let totalCents = 0;
    cart.forEach(item => {
        if (item.type === 'PACK') {
            totalCents += (item.size === 6 ? 8990 : 16990) * item.qty;
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
            notes,
            bottlesToReturn
        })
    });

    if (!res.ok) {
        throw new Error("Failed to checkout");
    }

    const data = await res.json();

    if (!data.success || !data.orderId) {
        throw new Error(data.error || "Persistence failed");
    }

    return data.orderId;
}
