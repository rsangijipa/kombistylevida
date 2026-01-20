export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { BUNDLES as SEED_BUNDLES } from '@/data/catalog';
import { Combo } from '@/types/firestore';

export async function GET(request: Request) {
    try {
        const snapshot = await adminDb.collection('combos').get();
        let combos = snapshot.docs.map(doc => doc.data());

        // Auto-seed if empty
        if (combos.length === 0) {
            const batch = adminDb.batch();
            combos = SEED_BUNDLES.map(b => {
                const docRef = adminDb.collection('combos').doc(b.id);
                const combo = {
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    badge: b.badge,
                    items: b.items,
                    priceCents: b.priceCents || 0,
                    active: true,
                    updatedAt: new Date().toISOString()
                };
                batch.set(docRef, combo);
                return combo;
            });
            await batch.commit();
        }

        return NextResponse.json(combos);
    } catch (error: unknown) {
        console.error("Error fetching combos:", error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: "Failed to fetch combos", details: message }, { status: 500 });
    }
}

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, priceCents, active, name, description, size, items, badge } = body;

        let docId = id;
        if (!docId) {
            if (!name) return NextResponse.json({ error: "Name required for new combo" }, { status: 400 });
            docId = slugify(name);
        }

        // Logic check: if items provided, validate? For now trust admin.

        const data: Partial<Combo> & { updatedAt: string } = {
            priceCents: Number(priceCents),
            active: Boolean(active),
            name,
            description,
            size: size || '300ml',
            updatedAt: new Date().toISOString()
        };

        if (items) data.items = items;
        if (badge !== undefined) data.badge = badge;

        await adminDb.collection('combos').doc(docId).set(data, { merge: true });

        // Fetch back full doc to return (helpful for UI)
        return NextResponse.json({ success: true, id: docId });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: "Failed to save combo", details: message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await adminDb.collection('combos').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: "Failed to delete combo", details: message }, { status: 500 });
    }
}
