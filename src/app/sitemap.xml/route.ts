import { getAdminDb } from "@/server/firebaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminDb = await getAdminDb();
    if (!adminDb) {
      console.warn("[sitemap] AdminDB not initialized (missing creds). Returning empty sitemap.");
      throw new Error("AdminDB missing");
    }

    const postsRef = adminDb.collection('posts');
    // Query: status == 'PUBLISHED', orderBy 'publishedAt' desc
    const snapshot = await postsRef
      .where('status', '==', 'PUBLISHED')
      .orderBy('publishedAt', 'desc')
      .get();

    const posts = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        slug: d.slug,
        updatedAt: d.updatedAt,
        publishedAt: d.publishedAt
      };
    });

    const baseUrl = "https://kombistylevida.com.br";

    const safeDate = (dateStr?: string) => {
      if (!dateStr) return new Date().toISOString();
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    };

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${baseUrl}</loc>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>${baseUrl}/noticias</loc>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
        ${posts.map(post => `
        <url>
            <loc>${baseUrl}/noticias/${post.slug}</loc>
            <lastmod>${safeDate(post.updatedAt || post.publishedAt || undefined)}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
        </url>
        `).join('')}
        </urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
      },
    });
  } catch (e) {
    console.error("[sitemap] error", e);
    // Fallback minimal sitemap to avoid 500
    const backupSitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://kombistylevida.com.br</loc></url></urlset>`;
    return new NextResponse(backupSitemap, { status: 200, headers: { "Content-Type": "application/xml" } });
  }
}
