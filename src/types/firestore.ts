export type BottleSize = '300ml' | '500ml';

export type OrderItem = {
    productId: string;
    productName: string; // Snapshot
    qty: number;
    priceCents: number; // Snapshot
    size?: BottleSize; // Snapshot
    variantKey?: string; // Snapshot
    subItems?: { productId: string; qty: number; name?: string }[]; // For packs
};

export interface Customer {
    id?: string;
    phone: string; // E.164 or digits
    name: string;
    email?: string;

    // Address Management
    addresses: {
        label?: string; // "Casa", "Trabalho"
        street: string;
        number: string;
        district: string;
        city: string;
        notes?: string;
        updatedAt: string;
    }[];

    // Stats / Loyalty
    ecoPoints: number;
    orderCount: number;
    lifetimeValueCents: number;
    isSubscriber: boolean;

    // Activity
    lastOrderAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Order {
    id: string;
    shortId?: string; // Optional if legacy
    status: 'NEW' | 'PENDING' | 'CONFIRMED' | 'PAID' | 'IN_PRODUCTION' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELED';

    customer: {
        id?: string;
        name: string;
        phone: string;
        deliveryMethod: 'delivery' | 'pickup';
        neighborhood?: string;
        address?: string;
        zipCode?: string;
    };

    items: OrderItem[];

    schedule: {
        date: string | null; // YYYY-MM-DD
        slotId?: string;
        slotLabel?: string;
    };

    payment?: {
        method: string;
        totalCents: number;
        status: string;
        paidAt?: string; // Add this too as used in Mark Paid
    };

    // Unified Pricing Model
    pricing?: {
        subtotalCents: number;
        shippingCents: number;
        discountCents: number;
        totalCents: number;
    };

    totalCents: number; // Top-level copy for querying
    subtotalCents?: number;
    deliveryFeeCents?: number;
    discountCents?: number;

    notes?: string;
    bottlesToReturn?: number;

    // Security / Guest Access
    publicAccess?: {
        tokenHash: string;
        revoked: boolean;
        tokenLast4?: string;
    };

    // New Delivery Structure (Unified)
    delivery?: {
        type: string; // 'ASAP', 'SCHEDULED'
        date: string | null;
        window: string | null;
        feeCents: number;
    };

    deliveryReservation?: {
        slotId: string | null;
        reservedAt: string | null;
        status: 'RESERVED' | 'RELEASED' | 'CONFIRMED' | 'HELD' | 'EXPIRED';
        expiresAt?: string;
    };

    createdAt: string;
    updatedAt: string;
}

export interface DeliverySlot {
    id: string; // YYYY-MM-DD_window
    date: string;
    window: string;
    reserved: number;
    confirmed?: number;
    capacity: number;
    locked?: boolean;
    isOpen: boolean;
    updatedAt?: string;
}

// ...

export interface Product {
    id: string;
    name: string;
    shortDesc?: string;
    imageSrc?: string;
    priceCents: number;
    size?: BottleSize;
    variants?: { size: BottleSize; price: number }[];
    active: boolean; // New: to hide products without deleting
    updatedAt: string;
}

// Collection: combos/{id}
export interface Combo {
    id: string;
    name: string;
    description?: string;
    badge?: string;
    items: { productId: string; qty: number }[];
    priceCents: number;
    active: boolean;
    updatedAt: string;
    size?: BottleSize; // '300ml' | '500ml'
    discountPercent?: number; // 0-100
    quantity?: number; // Target quantity for this combo
}

export interface InventoryItem {
    currentStock: number;
    reservedStock: number;
    updatedAt?: string;
}

export interface InventoryMovement {
    id: string;
    productId: string;
    type: 'IN' | 'OUT' | 'RESERVE' | 'RELEASE' | 'ADJUST' | 'SALE';
    quantity: number;
    reason?: string;
    orderId?: string;
    adminUid?: string;
    createdAt: string;
}
// --- CONFIGURATION ---

export interface SlotConfig {
    id: string; // e.g. "morning"
    label: string; // "09:00 - 12:00"
    start: string; // "09:00"
    end: string; // "12:00"
    capacity: number;
    enabled: boolean;
}

export interface WeekdayTemplate {
    open: boolean;
    dailyCapacity: number;
    slots: SlotConfig[];
}

export interface DeliveryConfig {
    version: number;
    timezone: string; // "America/Porto_Velho"
    maxAdvanceDays: number;
    cutoffPolicy: {
        type: "DAY_BEFORE_AT" | "HOURS_BEFORE_SLOT_START";
        dayBeforeAt?: string; // "16:00"
        hoursBeforeSlot?: number;
    };
    modes: {
        DELIVERY: {
            enabled: boolean;
            weekdayTemplates: Record<string, WeekdayTemplate>; // mon, tue, ...
        };
        PICKUP: {
            enabled: boolean;
            weekdayTemplates: Record<string, WeekdayTemplate>;
        };
    };
    closedDates: string[]; // YYYY-MM-DD
    notesForCustomer: string;
    updatedAt: string;
}

// --- ENHANCED DELIVERY DAY ---
// Replaces or Extends DeliveryDayCapacity (we can keep using 'deliveryDays' collection but with more fields)

export interface DeliveryDayCounters {
    date: string;
    mode: 'DELIVERY' | 'PICKUP';
    dailyBooked: number;
    slots: {
        [slotId: string]: {
            booked: number;
            // Overrides (snapshot from config + manual override)
            capacitySnapshot: number;
            enabledSnapshot: boolean;
        }
    };
    overrideClosed?: boolean;
    overrideDailyCapacity?: number;
    updatedAt: string;
}

// --- CONTENT CMS (Hardened) ---

export interface Post {
    id: string; // Document ID (slug)
    slug: string; // redundant but useful
    title: string;
    excerpt: string;
    content: string; // Markdown
    coverImage: {
        src: string;
        alt: string;
        credit?: string;
    } | null;
    tags: string[];
    featuredRank: number | null; // 1 | 2 | 3 or null
    status: 'DRAFT' | 'PUBLISHED';
    author: {
        uid: string;
        name?: string;
    } | null;
    seo: {
        title?: string;
        description?: string;
        canonicalUrl?: string;
    } | null;
    readingTimeMinutes: number;

    publishedAt: string | null; // ISO
    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface Testimonial {
    id: string; // Auto ID
    displayName: string;
    role?: string; // e.g. "Cliente"
    text: string;
    rating?: number; // 1-5
    source: 'WHATSAPP' | 'INSTAGRAM' | 'PRESENCIAL' | 'OUTRO';
    consent: {
        granted: boolean;
        at?: string; // ISO
    };
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: {
        uid: string;
        name?: string;
    };
    approvedAt?: string; // ISO
    rejectedReason?: string;

    createdAt: string;
    updatedAt: string;
}

export interface AuditLog { // Updated to match Phase 6 spec
    id: string;
    actorUid: string;
    actorRole: string;
    action: string; // POST_CREATE, POST_PUBLISH, TESTIMONIAL_APPROVE...
    entity: string; // "posts" | "testimonials"
    entityId: string;
    before?: any;
    after?: any;
    reason?: string;
    createdAt: string;
}

export type RecipeCategory =
    | "Mocktail (Sem Álcool)"
    | "Coquetel (Com Álcool)"
    | "Gastronomia (Salgados)"
    | "Sobremesas";

export interface Recipe {
    id: string; // slug
    title: string;
    slug: string; // docId imutável
    category: RecipeCategory;
    difficulty: "Fácil" | "Médio" | "Avançado";
    timeMinutes: number;
    servings: string; // "1 drink", "2 porções"
    excerpt: string;
    image: string; // /images/recipes/<slug>.png (mapped from coverImage request)
    tags: string[];

    kombuchaBase: string; // ex: Chá Verde, Hibisco
    kombuchaFlavorSuggested: string[]; // ex: ["Gengibre", "Limão"]

    ingredients: string[];
    steps: string[];
    tips: string[]; // dicas técnicas
    pairings: string[]; // harmonizações

    hasAlcohol: boolean;
    disclaimer: string;
    ctaWhatsAppText: string;

    relatedProductRefs?: string[]; // productIds
    status: "DRAFT" | "PUBLISHED";
    featuredRank?: 1 | 2 | 3; // para destaque na home

    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}
