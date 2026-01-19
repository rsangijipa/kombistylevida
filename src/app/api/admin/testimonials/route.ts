
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query: FirebaseFirestore.Query = adminDb.collection('testimonials');

        if (status && status !== 'ALL') {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(testimonials);
    } catch (error) {
        console.error("Testimonials API Error:", error);
        return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, id, testimonial, status, reason, adminUid } = body;

        if (action === 'SAVE') {
            if (!testimonial || !testimonial.id) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
            await adminDb.collection('testimonials').doc(testimonial.id).set({
                ...testimonial,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            return NextResponse.json({ success: true });
        }

        if (action === 'UPDATE_STATUS') {
            if (!id || !status) return NextResponse.json({ error: "Missing ID or Status" }, { status: 400 });

            const update: any = {
                status,
                updatedAt: new Date().toISOString()
            };

            if (status === 'APPROVED') {
                update.approvedBy = { uid: adminUid || 'admin' };
                update.approvedAt = new Date().toISOString();
            } else if (status === 'REJECTED') {
                update.rejectedReason = reason;
            }

            await adminDb.collection('testimonials').doc(id).set(update, { merge: true });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Testimonials Save Error:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await adminDb.collection('testimonials').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
