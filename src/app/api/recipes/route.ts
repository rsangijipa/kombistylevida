
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const snapshot = await adminDb.collection('recipes').where('slug', '==', slug).limit(1).get();
            if (snapshot.empty) return NextResponse.json(null);

            const data = snapshot.docs[0].data();
            if (data.status !== 'PUBLISHED') return NextResponse.json(null);

            return NextResponse.json({ id: snapshot.docs[0].id, ...data });
        }

        const snapshot = await adminDb.collection('recipes')
            .where('status', '==', 'PUBLISHED')
            .get();

        const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(recipes);
    } catch (error) {
        console.error("Public Recipes API Error:", error);
        return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
    }
}
