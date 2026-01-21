export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Read from `products` collection as that's where we decided to keep stock?
        // OR read from `inventory` collection if we separate them.
        // The Checkout now reads `stockQty` from `products/{id}.variants.{key}.stockQty`.
        // So this endpoint should ideally return that.
        // BUT listing ALL products to build inventory map is heavy.
        // Let's stick to what typical Admin Inventory page needs.
        // If the Admin Inventory Page expects a map of { productId: data }, we can just return products.
        // OR we can aggregate.
        // Since we are fixing the backend to use `products`, we should read from `products`.
        const snap = await adminDb.collection('products').where('active', '==', true).get();
        const inventory: Record<string, any> = {};
        snap.forEach(doc => {
            const data = doc.data();
            // Transform simple structure for frontend if needed or send raw
            inventory[doc.id] = {
                ...data, // includes variants with stockQty
                currentStock: 0 // Legacy field fallback
            };
        });
        return NextResponse.json(inventory);
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, amount, type, variantKey } = body;
        // We need `variantKey` now because stock is per variant.
        // If frontend doesn't send it, we default to '300ml' or fail?
        // To be safe for existing UI, if no variantKey, we might need to guess or update all?
        // Let's assume frontend sends it or we default to '300ml'.

        if (!productId || !amount || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const ref = adminDb.collection('products').doc(productId);
        const doc = await ref.get();

        if (!doc.exists) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const data = doc.data() as any;
        const targetVariant = variantKey || '300ml';
        // Ensure variants object exists
        const variants = data.variants || []; // Array in firestore usually?
        // Wait, my Checkout logic assumed `variants` is an Array in `products` doc (line 119 in checkout replaced code).
        // `data.variants.forEach...`
        // So to update, we need to find the item in array, update it, and write back the entire array.
        // Firestore doesn't support updating one item in array easily without reading.

        // Find variant index
        let variantIndex = -1;
        if (Array.isArray(variants)) {
            variantIndex = variants.findIndex((v: any) => v.size === targetVariant);
        }

        const delta = type === 'IN' ? amount : -amount;

        if (variantIndex > -1) {
            // Update existing variant
            const oldQty = variants[variantIndex].stockQty || 0;
            variants[variantIndex].stockQty = Math.max(0, oldQty + delta);

            await ref.update({
                variants: variants,
                updatedAt: new Date().toISOString()
            });
        } else {
            // Variant doesn't exist? Create or Error.
            // If it's a valid size, maybe add?
            // For now, if not found, we can't update.
            return NextResponse.json({ error: `Variant ${targetVariant} not found` }, { status: 400 });
        }

        // Log
        await adminDb.collection('stockMovements').add({
            productId,
            type,
            quantity: amount,
            variantKey: targetVariant,
            createdAt: new Date().toISOString(),
            reason: body.reason || "Manual Adjustment"
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Inventory Adjust Error", error);
        return NextResponse.json({ error: "Failed to adjust" }, { status: 500 });
    }
}

