const DEFAULT_WHATSAPP_NUMBER = "556981123681";

export const BUSINESS = {
    brandName: "Kombucha Arike",
    instagramUrl: "https://instagram.com/kombuchaarike",
    deliveryRegion: "Ariquemes e Regiao",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER,
};

function onlyDigits(value: string) {
    return value.replace(/\D/g, "");
}

function ensureCountryCode(phone: string) {
    const digits = onlyDigits(phone);
    if (!digits) return "";
    return digits.startsWith("55") ? digits : `55${digits}`;
}

export function buildBusinessWhatsAppLink(message?: string) {
    const number = ensureCountryCode(BUSINESS.whatsappNumber);
    if (!message) return `https://wa.me/${number}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildCustomerWhatsAppLink(phone: string, message?: string) {
    const number = ensureCountryCode(phone);
    if (!number) return "https://wa.me/";
    if (!message) return `https://wa.me/${number}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
