import { ResultCategory } from "@/data/quizFull";
import { buildBusinessWhatsAppLink } from "@/config/business";

export function buildWhatsAppShareLink(result: ResultCategory) {
    // Safety check for safety overrides
    const isSafety = result.id === 'safety';

    const text = `Olá! Fiz o Quiz da Kombucha Arikê. 🌱\n\n` +
        `Meu perfil deu: *${result.title}*\n` +
        `Sugestão: ${result.dosage}\n` +
        (isSafety ? `(Vou consultar meu médico antes)` : `Sabores sugeridos: ${result.flavors.join(", ")}`) +
        `\n\nGostaria de saber mais ou pedir um kit!`;

    return buildBusinessWhatsAppLink(text);
}
