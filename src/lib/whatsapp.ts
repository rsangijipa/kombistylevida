import { CartItem } from "@/store/cartStore";
import { CustomerState } from "@/store/customerStore";
import { CATALOG_MAP } from "@/data/catalog";
import { DELIVERY_SLOTS } from "@/data/deliverySlots";
import { Product, Combo } from "@/types/firestore";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

if (!PHONE_NUMBER) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error("Critical Configuration Error: NEXT_PUBLIC_WHATSAPP_NUMBER is not set.");
    }
    console.warn("NEXT_PUBLIC_WHATSAPP_NUMBER is missing. Using dev fallback.");
}

const FINAL_NUMBER = PHONE_NUMBER || "556981123681";

interface BuildMessageParams {
    cart: CartItem[];
    customer: CustomerState;
    selectedDate: string | null;
    selectedSlotId: string | null;
    notes: string;
    bottlesToReturn?: number;
    isGift?: boolean;
    giftFrom?: string;
    giftTo?: string;
    giftMessage?: string;
    catalog?: {
        products: Product[];
        combos: Combo[];
    };
}

// ...

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
    bottlesToReturn,
    isGift,
    giftFrom,
    giftTo,
    giftMessage,
    catalog
}: BuildMessageParams): string {
    let message = `🍃 *PEDIDO NOVO - KOMBUCHA ARIKÊ* 🍃\n`;
    message += `───────────────────────\n`;

    // Helpers to find items
    const findProduct = (id: string) => {
        if (catalog) return catalog.products.find(p => p.id === id);
        return CATALOG_MAP[id];
    };
    const findCombo = (id: string) => {
        if (catalog) return catalog.combos.find(c => c.id === id);
        return undefined; // Static catalog doesn't have new combos structure fully mirrored here easily yet
    };

    // GIFT BLOCK
    if (isGift) {
        message += `🎁 *É PARA PRESENTE!* 🎁\n`;
        if (giftFrom) message += `De: ${giftFrom}\n`;
        if (giftTo) message += `Para: ${giftTo}\n`;
        if (giftMessage) message += `💌 "${giftMessage}"\n`;
        message += `───────────────────────\n`;
    }

    // 1. Items Section
    message += `📋 *RESUMO DO PEDIDO*\n\n`;

    let totalCents = 0;

    cart.forEach((item) => {
        if (item.type === 'PACK') {
            const packPrice = item.size === 6 ? 8990 : 16990;
            totalCents += packPrice * item.quantity;
            message += `📦 *${item.displayName}* (${item.quantity}x)\n`;

            // Group flavors for cleaner display
            const flavorSummary: Record<string, number> = {};
            item.items.forEach(sub => {
                flavorSummary[sub.productId] = (flavorSummary[sub.productId] || 0) + sub.quantity;
            });

            Object.entries(flavorSummary).forEach(([pid, quantity]) => {
                const p = findProduct(pid);
                if (p) message += `   ├ ${quantity}x ${p.name}\n`;
            });
            message += `\n`;

        } else if (item.type === 'BUNDLE') {
            const combo = findCombo(item.bundleId);
            if (combo) {
                totalCents += (combo.priceCents || 0) * item.quantity;
                message += `🛍️ *${combo.name}* (${item.quantity}x)\n`;
                // List items in combo
                combo.items.forEach(sub => {
                    const p = findProduct(sub.productId);
                    message += `   ├ ${sub.quantity}x ${p?.name || 'Item'}\n`;
                });
                message += `\n`;
            } else {
                message += `🛍️ *Combo (ID: ${item.bundleId})* (${item.quantity}x)\n`;
            }

        } else if (item.type === 'PRODUCT') {
            let productId = item.productId;
            // Check for composite ID (e.g., "ginger-lemon::300")
            let sizeDisplay = "";
            if (item.productId.includes("::")) {
                const parts = item.productId.split("::");
                productId = parts[0];
                sizeDisplay = parts[1];
            }

            const product = findProduct(productId);
            if (product) {
                let itemPrice = product.priceCents || 0;
                // Variant Price Logic
                if (sizeDisplay && product.variants) {
                    const variant = product.variants.find(v => v.size.includes(sizeDisplay));
                    if (variant) itemPrice = variant.price * 100;
                }

                totalCents += itemPrice * item.quantity;
                const sizeStr = sizeDisplay ? `(${sizeDisplay}ml)` : (product.size ? `(${product.size})` : "");
                message += `▪️ *${item.quantity}x* ${product.name} ${sizeStr}\n`;
            }
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
        if (customer.address) {
            let fullAddress = customer.address;
            if (customer.number) fullAddress += `, ${customer.number}`;
            if (customer.complement) fullAddress += ` - ${customer.complement}`;
            message += `📍 *Endereço:* ${fullAddress}\n`;
        }
        if (customer.neighborhood) message += `🏙️ *Bairro:* ${customer.neighborhood}\n`;

        // Slot Logic
        if (selectedDate && selectedSlotId) {
            const dateObj = new Date(selectedDate);
            const dateFmt = dateObj.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });

            let period = "";
            if (selectedSlotId.includes("MORNING")) period = "Manhã";
            else if (selectedSlotId.includes("AFTERNOON")) period = "Tarde";
            else if (selectedSlotId.includes("EVENING")) period = "Noite";
            else {
                const slot = DELIVERY_SLOTS.find(s => s.id === selectedSlotId);
                period = slot ? slot.label : selectedSlotId;
            }

            message += `📅 *Entrega:* ${dateFmt} (${period})\n`;
        } else {
            message += `📅 *Entrega:* A combinar (ASAP)\n`;
        }
    } else {
        // Pickup Logic
        message += `📅 *Retirada:* Vamos combinar o horário!\n`;
    }

    // 4. Notes & Bottles
    const cleanNotes = (notes || "").trim();

    if (bottlesToReturn && bottlesToReturn > 0) {
        message += `\n♻️ *Logística Reversa:*\nTenho ${bottlesToReturn} garrafas para devolver/trocar.\n`;
    }

    if (cleanNotes) {
        message += `\n📝 *Observações:*\n${cleanNotes.substring(0, 300)}\n`;
    }

    message += `───────────────────────\n`;
    message += `Aguardando confirmação! 🙌`;

    return message;
}

export function buildWhatsAppLink(message: string): string {
    const encodedMsg = encodeURIComponent(message);
    return `https://wa.me/${FINAL_NUMBER}?text=${encodedMsg}`;
}
