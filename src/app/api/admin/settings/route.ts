export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { adminGuard } from '@/lib/auth/adminGuard';

const SETTINGS_DOC_PATH = "settings/global";

export async function GET() {
    try {
        await adminGuard();
        const docSnap = await adminDb.doc(SETTINGS_DOC_PATH).get();
        if (docSnap.exists) {
            return NextResponse.json(docSnap.data());
        }
        return NextResponse.json({});
    } catch (error) {
        console.error("Settings Error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await adminGuard();
        const body = await request.json();
        await adminDb.doc(SETTINGS_DOC_PATH).set(body, { merge: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings Error:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
