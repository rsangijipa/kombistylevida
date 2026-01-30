export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Testimonial } from '@/types/firestore';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('testimonials')
            .where('status', '==', 'APPROVED')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const testimonials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(testimonials);
    } catch (error) {
        console.error("Public Testimonials Error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { displayName, role, text, rating, source } = body;

        if (!displayName || !text) {
            return NextResponse.json({ error: "Name and text are required" }, { status: 400 });
        }

        const newTestimonial: Omit<Testimonial, 'id'> = {
            displayName,
            role: role || "Cliente",
            text,
            rating: rating || 5,
            source: source || 'OUTRO',
            consent: {
                granted: true,
                at: new Date().toISOString()
            },
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await adminDb.collection('testimonials').add(newTestimonial);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Submit Testimonial Error:", error);
        return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }
}
