import { CartItem } from "@/store/cartStore";
import { CustomerState } from "@/store/customerStore";
import { CATALOG_MAP } from "@/data/catalog";
import { DELIVERY_SLOTS } from "@/data/deliverySlots";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5599999999999";

interface BuildMessageParams {
    cart: CartItem[];
    customer: CustomerState;
    selectedDate: string | null;
    selectedSlotId: string | null;
    notes: string;
}

/**
 * Validates if the order is ready to be sent.
 * Returns an error string if invalid, or null if valid.
 */
export function validateOrder({
    cart,
    customer,
    selectedDate,
    selectedSlotId
}: BuildMessageParams): string | null {
    if (cart.length === 0) return "Sua sacola está vazia.";
    if (!customer.name.trim()) return "Por favor, informe seu Nome.";

    if (customer.deliveryMethod === "delivery") {
        if (!customer.address.trim()) return "Para entrega, precisamos do seu Endereço.";
        if (!selectedDate || !selectedSlotId) return "Por favor, agende uma data e horário para a entrega.";
    }

    return null; // Valid
}

export function buildOrderMessage({
    cart,
    customer,
    selectedDate,
    selectedSlotId,
    notes,
}: BuildMessageParams): string {
    let message = `🌿 *PEDIDO KOMBISTYLE VIDA* 🌿\n\n`;

    // 1. Items
    message += `*ITENS:*\n`;
    let totalCents = 0;

    cart.forEach((item) => {
        const product = CATALOG_MAP[item.productId];
        if (product) {
            const itemTotal = (product.priceCents || 0) * item.qty;
            totalCents += itemTotal;
            message += `• ${item.qty}x ${product.name}\n`;
        }
    });

    // 2. Total
    if (totalCents > 0) {
        message += `\n💰 *Total: R$ ${(totalCents / 100).toFixed(2).replace(".", ",")}*\n`;
    }

    // 3. Customer Data
    message += `\n----------------\n`;
    message += `👤 *CLIENTE:*\n`;
    message += `Nome: ${customer.name}\n`;
    if (customer.phone) message += `WhatsApp: ${customer.phone}\n`;

    // 4. Delivery / Schedule
    const isDelivery = customer.deliveryMethod === "delivery";
    message += `\n📦 *${isDelivery ? "ENTREGA" : "RETIRADA"}*\n`;

    if (isDelivery) {
        if (customer.address) message += `End: ${customer.address}\n`;
        if (customer.neighborhood) message += `Bairro: ${customer.neighborhood}\n`;

        if (selectedDate && selectedSlotId) {
            const dateObj = new Date(selectedDate);
            const dateFmt = dateObj.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
            const slot = DELIVERY_SLOTS.find(s => s.id === selectedSlotId);
            message += `Data: ${dateFmt} (${slot?.label || selectedSlotId})\n`;
        } else {
            message += `Data: A combinar\n`;
        }
    }

    // 5. Notes
    // Truncate notes if too long to avoid URL breakage
    const cleanNotes = (notes || "").trim();
    if (cleanNotes) {
        message += `\n📝 *Obs:* ${cleanNotes.substring(0, 200)}${cleanNotes.length > 200 ? "..." : ""}\n`;
    }

    return message;
}

export function buildWhatsAppLink(message: string): string {
    // Encodes characters properly for WhatsApp URL
    const encodedMsg = encodeURIComponent(message);
    return `https://wa.me/${PHONE_NUMBER}?text=${encodedMsg}`;
}
