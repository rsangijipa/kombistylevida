export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { adminGuard } from '@/lib/auth/adminGuard';

export async function GET() {
    try {
        await adminGuard();
        const snapshot = await adminDb.collection('posts').orderBy('publishedAt', 'desc').get();
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(posts);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await adminGuard();
        const body = await request.json();

        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await adminDb.collection('posts').doc(id).set(data);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await adminGuard();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await adminDb.collection('posts').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
