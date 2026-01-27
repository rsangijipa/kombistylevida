export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Product } from '@/types/firestore';
import { adminGuard } from '@/lib/auth/adminGuard';

export async function GET() {
    try {
        await adminGuard();
        const snap = await adminDb.collection('products').where('active', '==', true).get();
        const inventory: Record<string, Product & { currentStock: number }> = {};
        snap.forEach(doc => {
            const data = doc.data() as Product;
            inventory[doc.id] = {
                ...data,
                currentStock: 0
            };
        });
        return NextResponse.json(inventory);
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await adminGuard();
        const body = await request.json();
        const { productId, amount, type, variantKey } = body;

        // P0-3: Backend now expects variantKey to be passed explicitly (or validated)
        if (!productId || !amount || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const ref = adminDb.collection('products').doc(productId);
        const doc = await ref.get();

        if (!doc.exists) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const data = doc.data() as Product;
        const targetVariant = variantKey || '300ml';

        // Ensure variants object exists
        const variants = data.variants || [];

        // Find variant index
        let variantIndex = -1;
        if (Array.isArray(variants)) {
            variantIndex = variants.findIndex((v) => v.size === targetVariant);
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
            return NextResponse.json({ error: `Variant ${targetVariant} not found` }, { status: 400 });
        }

        // Log Stock Movement
        await adminDb.collection('stockMovements').add({
            productId,
            type,
            quantity: amount,
            variantKey: targetVariant,
            // P1-2: Explicit Volume Logging
            volumeMl: parseInt(targetVariant.replace('ml', '')) || 0,
            createdAt: new Date().toISOString(),
            reason: body.reason || "Manual Adjustment"
        });

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error("Inventory Adjust Error", error);
        return NextResponse.json({ error: "Failed to adjust" }, { status: 500 });
    }
}

