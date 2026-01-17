import { getAdminDb } from "@/server/firebaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminDb = await getAdminDb();
    if (!adminDb) {
      console.warn("[rss] AdminDB not initialized. Returning empty feed.");
      throw new Error("AdminDB missing");
    }

    const postsRef = adminDb.collection('posts');
    const snapshot = await postsRef
      .where('status', '==', 'PUBLISHED')
      .orderBy('publishedAt', 'desc')
      .limit(20)
      .get();

    const posts = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        publishedAt: d.publishedAt || d.createdAt
      };
    });

    const baseUrl = "https://kombistylevida.com.br";

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
        <rss version="2.0">
        <channel>
        <title>Kombistyle Vida - Notícias</title>
        <link>${baseUrl}</link>
        <description>Vida saudável, kombucha e bem-estar.</description>
        ${posts.map(post => `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>${baseUrl}/noticias/${post.slug}</link>
            <guid>${baseUrl}/noticias/${post.slug}</guid>
            <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
            <description><![CDATA[${post.excerpt || ""}]]></description>
        </item>
        `).join('')}
        </channel>
        </rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
      },
    });
  } catch (e: any) {
    console.error("[rss] error", e);
    const backupRss = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>Kombistyle Vida</title></channel></rss>`;
    return new NextResponse(backupRss, { status: 200, headers: { "Content-Type": "application/xml" } });
  }
}
