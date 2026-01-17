export type OrderStatus = 'NEW' | 'CONFIRMED' | 'IN_PRODUCTION' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELED';

export type OrderItem = {
    productId: string;
    productName: string; // Snapshot
    qty: number;
    priceCents: number; // Snapshot
    size?: string; // Snapshot
};

export type OrderCustomerSnapshot = {
    name: string;
    phone: string;
    deliveryMethod: 'delivery' | 'pickup';
    address?: string;
    neighborhood?: string;
};

export type OrderScheduleSnapshot = {
    date: string | null; // YYYY-MM-DD
    slotId: string | null;
    slotLabel?: string;
};

export interface Order {
    id: string; // Firestore ID
    shortId: string; // 6-char simpler ID for humans
    status: OrderStatus;

    items: OrderItem[];
    totalCents: number;

    customer: OrderCustomerSnapshot;
    schedule: OrderScheduleSnapshot;
    notes: string;
    bottlesToReturn?: number; // New field

    createdAt: string; // ISO
    updatedAt: string; // ISO
}

// Collection: customers/{phone}
export interface Customer {
    phone: string; // ID
    name: string;
    neighborhood?: string;
    address?: string;

    firstOrderAt: string;
    lastOrderAt: string;
    orderCount: number;
    lifetimeValueCents: number;

    consentToSave: boolean; // LGPD
    updatedAt: string;
}

// Collection: deliveryDays/{date}
export interface DeliveryDayCapacity {
    date: string; // ID: YYYY-MM-DD
    slots: {
        [slotId: string]: {
            capacityOverride?: number; // If set, overrides global settings
            bookedCount: number;
        }
    };
    closed?: boolean;
}
// Collection: inventory/{productId}
export interface InventoryItem {
    productId: string; // ID
    currentStock: number;
    reservedStock: number; // For active orders not yet delivered
    updatedAt: string;
}

// Collection: stockMovements/{id}
export interface InventoryMovement {
    id: string;
    productId: string;
    type: 'IN' | 'OUT' | 'ADJUST' | 'RESERVE' | 'RELEASE';
    quantity: number;
    reason?: string;
    orderId?: string;
    createdAt: string;
}

// Collection: products/{id}
export interface Product {
    id: string;
    name: string;
    shortDesc?: string;
    imageSrc?: string;
    priceCents: number;
    size?: string;
    variants?: { size: string; price: number }[];
    active: boolean; // New: to hide products without deleting
    updatedAt: string;
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
