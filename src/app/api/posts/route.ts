
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const doc = await adminDb.collection('posts').doc(slug).get();
            if (!doc.exists) {
                return NextResponse.json(null);
            }
            // Only return if PUBLISHED or if checking generic
            const data = doc.data();
            if (data?.status !== 'PUBLISHED' && data?.status !== 'published') {
                return NextResponse.json(null);
            }
            return NextResponse.json(data);
        }

        const snapshot = await adminDb.collection('posts')
            .where('status', 'in', ['PUBLISHED', 'published'])
            .get();

        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            // Map legacy/admin imageSrc to coverImage standard
            if (data.imageSrc && !data.coverImage) {
                data.coverImage = { src: data.imageSrc, alt: data.title };
            }
            // Ensure ID/Slug is present
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                ...data
            };
        });

        // Sort in memory to avoid index requirement
        posts.sort((a: any, b: any) => {
            const dateA = new Date(a.publishedAt || 0).getTime();
            const dateB = new Date(b.publishedAt || 0).getTime();
            return dateB - dateA;
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Public Posts API Error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
