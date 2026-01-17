
export interface QuizOption {
    id: string;
    text: string;
    score: number; // 0 (Robust) to 3 (Sensitive)
    isSafetyTrigger?: boolean; // If true, sets safetyOverride flag
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: QuizOption[];
}

export interface ResultCategory {
    id: string;
    title: string;
    description: string;
    dosage: string;
    flavors: string[]; // IDs
    color: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: "q1",
        text: "Com que frequência você sente desconforto intestinal (estufamento, gases, azia)?",
        options: [
            { id: "never", text: "Nunca", score: 0 },
            { id: "rarely", text: "Raramente", score: 1 },
            { id: "sometimes", text: "Às vezes", score: 2 },
            { id: "frequently", text: "Frequentemente", score: 3 },
        ]
    },
    {
        id: "q2",
        text: "Você já consome fermentados (iogurte, kefir, kombucha) com regularidade?",
        options: [
            { id: "never", text: "Nunca", score: 2 },
            { id: "sometimes", text: "Às vezes", score: 1 },
            { id: "regularly", text: "Sim, quase todo dia", score: 0 },
        ]
    },
    {
        id: "q3",
        text: "Seu intestino tende a ser…",
        options: [
            { id: "sensitive", text: "Sensível (qualquer coisa muda)", score: 3 },
            { id: "normal", text: "Normal", score: 1 },
            { id: "calm", text: "Tranquilo (quase nada afeta)", score: 0 },
        ]
    },
    {
        id: "q4",
        text: "Como está sua rotina alimentar na maior parte da semana?",
        options: [
            { id: "processed", text: "Mais comida pronta/industrializada", score: 2 },
            { id: "mixed", text: "Misto / Equilibrado", score: 1 },
            { id: "real", text: "Mais comida natural/caseira", score: 0 },
        ]
    },
    {
        id: "q5",
        text: "Você costuma ter reações com bebidas gaseificadas?",
        options: [
            { id: "yes", text: "Sim, me sinto estufado(a)", score: 2 },
            { id: "depends", text: "Depende da quantidade", score: 1 },
            { id: "no", text: "Não, tolero bem", score: 0 },
        ]
    },
    {
        id: "q6",
        text: "Hoje você está em alguma condição que exige cautela?",
        options: [
            { id: "pregnant", text: "Grávida ou lactante", score: 0, isSafetyTrigger: true },
            { id: "immuno", text: "Imunossupressão ou tratamento médico", score: 0, isSafetyTrigger: true },
            { id: "gastric", text: "Problemas gastrointestinais importantes (ex: Gastrite, SII)", score: 0, isSafetyTrigger: true },
            { id: "none", text: "Nenhuma das anteriores", score: 0 },
        ]
    },
    {
        id: "q7",
        text: "Seu principal objetivo hoje é...",
        options: [
            { id: "swap", text: "Trocar refrigerante por algo leve", score: 0 },
            { id: "curiosity", text: "Curiosidade / Sabor", score: 0 },
            { id: "wellness", text: "Bem-estar e rotina", score: 0 },
        ]
    },
    {
        id: "q8",
        text: "Qual nível de cafeína você tolera (chá verde/preto)?",
        options: [
            { id: "low", text: "Baixa (prefiro evitar)", score: 1 },
            { id: "ok", text: "Tolerância normal", score: 0 },
            { id: "high", text: "Alta (amo café/chá)", score: 0 },
        ]
    }
];

export const RESULTS: Record<string, ResultCategory> = {
    SAFETY_OVERRIDE: {
        id: "safety",
        title: "Cautela & Orientação",
        description: "Devido à sua condição atual, a recomendação mais segura é consultar seu médico antes de iniciar o consumo regular de fermentados.",
        dosage: "Consulte seu médico. Se liberado: 50–100ml max.",
        flavors: ["grape", "red-berries"], // Suaves
        color: "bg-red-50 border-red-200"
    },
    START_GENTLE: {
        id: "gentle",
        title: "Começo Leve",
        description: "Seu sistema parece mais sensível ou você está iniciando agora. O segredo é ir devagar para acostumar sua flora.",
        dosage: "50–100 ml/dia. (Aumente para 150ml após 1 semana se tolerar bem)",
        flavors: ["red-berries", "grape"], // Suaves e doces
        color: "bg-amber-50 border-amber-200"
    },
    MODERATE: {
        id: "moderate",
        title: "Rotina Moderada",
        description: "Você tem boa tolerância! Pode incluir a Kombucha como parte deliciosa do seu dia a dia.",
        dosage: "100–200 ml/dia.",
        flavors: ["passionfruit", "red-berries"],
        color: "bg-olive/10 border-olive/20"
    },
    STABLE: {
        id: "stable",
        title: "Rotina Estável",
        description: "Seu corpo já entende bem os fermentados. Aproveite todos os benefícios e explore sabores mais complexos.",
        dosage: "150–250 ml/dia.",
        flavors: ["ginger-lemon", "passionfruit"], // Mais intensos
        color: "bg-green-50 border-green-200"
    }
};
