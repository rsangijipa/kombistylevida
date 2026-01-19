
import { describe, it, expect } from 'vitest';
import { calculateOrder, CatalogProduct } from './calculator';

const MOCK_CATALOG: Record<string, CatalogProduct> = {
    'p1': {
        id: 'p1',
        name: 'Kombucha 1',
        active: true,
        variants: {
            '300ml': { priceCents: 1200, active: true, volumeMl: 300 },
            '500ml': { priceCents: 1500, active: true, volumeMl: 500 }
        }
    },
    'p2': {
        id: 'p2',
        name: 'Kombucha 2',
        active: true,
        variants: {
            '300ml': { priceCents: 1200, active: true, volumeMl: 300 }
        }
    }
};

describe('calculateOrder', () => {
    it('calculates simple order correctly', () => {
        const result = calculateOrder([
            { productId: 'p1', variantKey: '300ml', quantity: 2 }, // 2 * 1200 = 2400
            { productId: 'p1', variantKey: '500ml', quantity: 1 }  // 1 * 1500 = 1500
        ], MOCK_CATALOG);

        expect(result.isValid).toBe(true);
        expect(result.pricing.subtotalCents).toBe(3900);
        expect(result.pricing.totalCents).toBe(3900);
        expect(result.items).toHaveLength(2);
        expect(result.items[0].subtotalCents).toBe(2400);
    });

    it('rejects invalid product', () => {
        const result = calculateOrder([
            { productId: 'invalid', variantKey: '300ml', quantity: 1 }
        ], MOCK_CATALOG);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Product not found: invalid');
    });

    it('rejects invalid variant', () => {
        const result = calculateOrder([
            { productId: 'p1', variantKey: '1000ml', quantity: 1 }
        ], MOCK_CATALOG);

        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Variant 1000ml not found');
    });

    it('handles mixed valid and invalid items', () => {
        const result = calculateOrder([
            { productId: 'p1', variantKey: '300ml', quantity: 1 },
            { productId: 'p2', variantKey: '500ml', quantity: 1 } // p2 only has 300ml
        ], MOCK_CATALOG);

        expect(result.isValid).toBe(false);
        // Should calculate the valid one but mark result invalid
        expect(result.items).toHaveLength(1);
        expect(result.errors).toHaveLength(1);
    });

    it('adds shipping if provided', () => {
        const result = calculateOrder([
            { productId: 'p1', variantKey: '300ml', quantity: 1 }
        ], MOCK_CATALOG, { shippingCents: 500 }); // +5.00

        expect(result.pricing.subtotalCents).toBe(1200);
        expect(result.pricing.shippingCents).toBe(500);
        expect(result.pricing.totalCents).toBe(1700);
    });
});
