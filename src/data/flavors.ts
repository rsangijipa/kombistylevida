export interface FlavorDetails {
    id: string;
    title: string;
    imageSrc: string;
    longDesc: string;
    ingredients: string[];
    pairings: string[];
    price?: number;
    variants?: {
        size: "300ml" | "500ml";
        price: number;
    }[];
}

export const FLAVORS: FlavorDetails[] = [
    {
        id: "ginger-lemon",
        title: "Gengibre\n& Limão",
        imageSrc: "/images/flavors/v3-transparent/gengibre-limao.png",
        longDesc: "Um clássico revigorante. A picância natural do gengibre encontra a acidez vibrante do limão, criando uma bebida que desperta os sentidos e pode auxiliar na digestão.",
        ingredients: ["Chá verde", "Gengibre fresco", "Suco de limão", "Açúcar orgânico"],
        pairings: ["Saladas frescas", "Peixes grelhados", "Dias de sol"],
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
    {
        id: "red-berries",
        title: "Frutas\nVermelhas",
        imageSrc: "/images/flavors/v3-transparent/frutas-vermelhas.png",
        longDesc: "Explosão de sabores do bosque. Uma combinação antioxidante e levemente adocicada de morango, amora e mirtilo.",
        ingredients: ["Chá preto", "Morango", "Amora", "Mirtilo", "Hibisco"],
        pairings: ["Sobremesas leves", "Queijos suaves", "Fim de tarde"],
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
    {
        id: "purple-grape",
        title: "Uva\nRoxa",
        imageSrc: "/images/flavors/v3-transparent/uva-roxa.png",
        longDesc: "Intenso e encorpado. Feito com uvas de colheita selecionada, traz notas profundas que lembram um bom vinho, mas sem álcool.",
        ingredients: ["Chá preto", "Suco de uva integral", "Açúcar orgânico"],
        pairings: ["Massas", "Risotos", "Jantares especiais"],
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
    {
        id: "passionfruit",
        title: "Maracujá",
        imageSrc: "/images/flavors/v3-transparent/maracuja.png",
        longDesc: "Tropicalidade pura. O perfume inconfundível do maracujá traz calma e refrescância, com aquele azedinho que todo mundo ama.",
        ingredients: ["Chá verde", "Polpa de maracujá", "Capim-santo"],
        pairings: ["Aves", "Poke bowls", "Momentos relax"],
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
];
