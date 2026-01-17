export type Product = {
    id: string;
    name: string;
    shortDesc?: string;
    imageSrc?: string;
    priceCents?: number;
    size?: string;
    variants?: { size: string; price: number }[];
};

export type BundleItem = {
    productId: string;
    qty: number;
};

export type Bundle = {
    id: string;
    name: string;
    badge?: string;
    description: string;
    items: BundleItem[];
    priceCents?: number;
};

export const PRODUCTS: Product[] = [
    {
        id: "ginger-lemon",
        name: "Gengibre & Limão",
        shortDesc: "Clássico revigorante",
        imageSrc: "/images/flavors/_processed/gengibre-limao.square.png",
        priceCents: 1200, // Base price 300ml
        size: "300ml",
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
    {
        id: "red-berries",
        name: "Frutas Vermelhas",
        shortDesc: "Doce e antioxidante",
        imageSrc: "/images/flavors/_processed/frutas-vermelhas.square.png",
        priceCents: 1200,
        size: "300ml",
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
    {
        id: "purple-grape",
        name: "Uva Roxa",
        shortDesc: "Intenso e encorpado",
        imageSrc: "/images/flavors/_processed/uva-roxa.square.png",
        priceCents: 1200,
        size: "300ml",
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
    {
        id: "passionfruit",
        name: "Maracujá",
        shortDesc: "Tropical e calmante",
        imageSrc: "/images/flavors/_processed/maracuja.square.png",
        priceCents: 1200,
        size: "300ml",
        variants: [
            { size: "300ml", price: 12 },
            { size: "500ml", price: 15 }
        ]
    },
];

export const BUNDLES: Bundle[] = [
    {
        id: "kit-degustacao",
        name: "Kit Degustação",
        badge: "Mais Vendido",
        description: "Experimente um de cada e descubra seu favorito.",
        items: [
            { productId: "ginger-lemon", qty: 1 },
            { productId: "red-berries", qty: 1 },
            { productId: "purple-grape", qty: 1 },
            { productId: "passionfruit", qty: 1 },
        ],
        priceCents: 5800, // R$ 58,00 (Desconto)
    },
    {
        id: "kit-imunidade",
        name: "Kit Imunidade",
        badge: "Saúde",
        description: "Foco no gengibre e frutas vermelhas para fortalecer.",
        items: [
            { productId: "ginger-lemon", qty: 3 },
            { productId: "red-berries", qty: 3 },
        ],
        priceCents: 8500,
    },
    {
        id: "pack-festa",
        name: "Pack Festa",
        badge: "Economia",
        description: "Garanta a alegria da galera com 12 garrafas variadas.",
        items: [
            { productId: "ginger-lemon", qty: 3 },
            { productId: "red-berries", qty: 3 },
            { productId: "purple-grape", qty: 3 },
            { productId: "passionfruit", qty: 3 },
        ],
        priceCents: 16000,
    },
];

export const CATALOG_MAP = PRODUCTS.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
}, {} as Record<string, Product>);
