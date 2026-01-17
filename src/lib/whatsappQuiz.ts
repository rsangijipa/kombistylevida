import { ResultCategory } from "@/data/quizFull";

export function buildWhatsAppShareLink(result: ResultCategory) {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5547999999999"; // Fallback phone

    // Safety check for safety overrides
    const isSafety = result.id === 'safety';

    const text = `Olá! Fiz o Quiz da Kombistyle Vida. 🌱\n\n` +
        `Meu perfil deu: *${result.title}*\n` +
        `Sugestão: ${result.dosage}\n` +
        (isSafety ? `(Vou consultar meu médico antes)` : `Sabores sugeridos: ${result.flavors.join(", ")}`) +
        `\n\nGostaria de saber mais ou pedir um kit!`;

    const encoded = encodeURIComponent(text);
    return `https://wa.me/${phoneNumber}?text=${encoded}`;
}
