
export type CartItemInput = {
    productId: string;
    variantKey: string; // "300ml" | "500ml"
    quantity: number;
};

export type CatalogProduct = {
    id: string;
    name: string;
    variants: Record<string, { priceCents: number; active: boolean; volumeMl: number }>;
    active: boolean;
};

export type CalculatedLine = {
    productId: string;
    productName: string;
    variantKey: string;
    unitPriceCents: number;
    quantity: number;
    subtotalCents: number;
    error?: string;
};

export type OrderPricing = {
    subtotalCents: number;
    shippingCents: number;
    discountCents: number;
    totalCents: number;
};

export type CalculationResult = {
    items: CalculatedLine[];
    pricing: OrderPricing;
    isValid: boolean;
    errors: string[];
};

/**
 * Calculates order totals based on server-side catalog data.
 * Does NOT trust client prices.
 */
export function calculateOrder(
    inputItems: CartItemInput[],
    catalog: Record<string, CatalogProduct>,
    options: { shippingCents?: number } = {}
): CalculationResult {
    const items: CalculatedLine[] = [];
    const errors: string[] = [];
    let subtotalCents = 0;

    for (const input of inputItems) {
        const product = catalog[input.productId];

        if (!product) {
            errors.push(`Product not found: ${input.productId}`);
            continue;
        }

        if (!product.active) {
            errors.push(`Product inactive: ${product.name}`);
            continue;
        }

        const variant = product.variants[input.variantKey];
        if (!variant) {
            errors.push(`Variant ${input.variantKey} not found for ${product.name}`);
            continue;
        }

        if (input.quantity <= 0) {
            errors.push(`Invalid quantity for ${product.name}: ${input.quantity}`);
            continue;
        }

        const lineTotal = variant.priceCents * input.quantity;
        subtotalCents += lineTotal;

        items.push({
            productId: product.id,
            productName: product.name,
            variantKey: input.variantKey,
            unitPriceCents: variant.priceCents,
            quantity: input.quantity,
            subtotalCents: lineTotal
        });
    }

    const shippingCents = options.shippingCents || 0;
    const discountCents = 0; // Future hook for discount coupons

    return {
        items,
        pricing: {
            subtotalCents,
            shippingCents,
            discountCents,
            totalCents: Math.max(0, subtotalCents + shippingCents - discountCents)
        },
        isValid: errors.length === 0,
        errors
    };
}
