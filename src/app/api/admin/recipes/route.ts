

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const snapshot = await adminDb.collection('recipes').orderBy('createdAt', 'desc').get();
        const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(recipes);
    } catch (error) {
        console.error("GET /api/admin/recipes error:", error);
        return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (id) {
            // Update
            await adminDb.collection('recipes').doc(id).set(data, { merge: true });
        } else {
            // Create
            const docRef = await adminDb.collection('recipes').add(data);
            return NextResponse.json({ success: true, id: docRef.id });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("POST /api/admin/recipes error:", error);
        return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await adminDb.collection('recipes').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/admin/recipes error:", error);
        return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
    }
}

