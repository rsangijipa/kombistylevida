
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

const SETTINGS_DOC_PATH = "settings/global";

export async function GET() {
    try {
        const docSnap = await adminDb.doc(SETTINGS_DOC_PATH).get();
        if (docSnap.exists) {
            return NextResponse.json(docSnap.data());
        }
        return NextResponse.json({});
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await adminDb.doc(SETTINGS_DOC_PATH).set(body, { merge: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
