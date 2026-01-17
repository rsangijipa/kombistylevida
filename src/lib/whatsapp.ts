import { CartItem } from "@/store/cartStore";
import { CustomerState } from "@/store/customerStore";
import { CATALOG_MAP } from "@/data/catalog";
import { DELIVERY_SLOTS } from "@/data/deliverySlots";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "556981123681";

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

    // We can relax the validation slightly if pickup, but let's keep name required.
    // What if the user wants to finalize but forgot address? We remind them.
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
    let message = `🍃 *PEDIDO NOVO - KOMBISTYLE VIDA* 🍃\n`;
    message += `───────────────────────\n`;

    // 1. Items Section
    message += `📋 *RESUMO DO PEDIDO*\n\n`;

    let totalCents = 0;

    cart.forEach((item) => {
        const product = CATALOG_MAP[item.productId];
        if (product) {
            const itemTotal = (product.priceCents || 0) * item.qty;
            totalCents += itemTotal;
            const sizeStr = product.size ? `(${product.size})` : "";

            // Format: 2x Gengibre & Limão (300ml)
            message += `▪️ *${item.qty}x* ${product.name} ${sizeStr}\n`;
        }
    });

    // 2. Pricing
    if (totalCents > 0) {
        message += `\n💰 *Total Estimado: R$ ${(totalCents / 100).toFixed(2).replace(".", ",")}*\n`;
        message += `_(Pagamento via Pix ou na entrega)_\n`;
    }

    message += `───────────────────────\n`;

    // 3. Delivery / Customer Info
    const isDelivery = customer.deliveryMethod === "delivery";
    const methodEmoji = isDelivery ? "🛵" : "🏃";
    const methodTitle = isDelivery ? "ENTREGA" : "RETIRADA";

    message += `${methodEmoji} *DADOS PARA ${methodTitle}*\n`;

    // Customer Name
    message += `👤 *Nome:* ${customer.name}\n`;

    // Delivery Details
    if (isDelivery) {
        if (customer.address) message += `📍 *Endereço:* ${customer.address}\n`;
        if (customer.neighborhood) message += `🏙️ *Bairro:* ${customer.neighborhood}\n`;

        // Slot Logic
        if (selectedDate && selectedSlotId) {
            const dateObj = new Date(selectedDate);
            const dateFmt = dateObj.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
            const slot = DELIVERY_SLOTS.find(s => s.id === selectedSlotId);
            const slotLabel = slot ? slot.label : selectedSlotId;

            message += `📅 *Agendamento:* ${dateFmt} - ${slotLabel}\n`;
        } else {
            message += `📅 *Agendamento:* A combinar\n`;
        }
    } else {
        // Pickup Logic
        message += `📅 *Retirada:* Vamos combinar o horário!\n`;
    }

    // 4. Notes
    const cleanNotes = (notes || "").trim();
    if (cleanNotes) {
        message += `\n📝 *Observações:*\n${cleanNotes.substring(0, 300)}\n`;
    }

    message += `───────────────────────\n`;
    message += `Aguardando confirmação! 🙌`;

    return message;
}

export function buildWhatsAppLink(message: string): string {
    const encodedMsg = encodeURIComponent(message);
    return `https://wa.me/${PHONE_NUMBER}?text=${encodedMsg}`;
}
