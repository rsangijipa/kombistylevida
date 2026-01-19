import { adminDb } from "@/lib/firebase/admin";
import { Post } from "@/types/firestore";
import { Loader2, Calendar, Clock, Share2, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Metadata } from "next";

// Helper to fetch post
async function fetchPost(slug: string): Promise<Post | null> {
    const doc = await adminDb.collection('posts').doc(slug).get();
    if (!doc.exists) return null;
    const data = doc.data();
    // Map legacy/admin imageSrc to coverImage standard
    if (data?.imageSrc && !data.coverImage) {
        data.coverImage = { src: data.imageSrc, alt: data.title };
    }
    return data as Post;
}

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchPost(slug);
    if (!post) return { title: 'Not Encontrado' };

    return {
        title: post.seo?.title || post.title,
        description: post.seo?.description || post.excerpt,
        openGraph: {
            images: post.coverImage ? [post.coverImage.src] : [],
        },
        alternates: {
            canonical: post.seo?.canonicalUrl || `/noticias/${slug}`
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch Data (Server Component)
    const post = await fetchPost(slug);

    if (!post || post.status !== 'PUBLISHED') {
        // In production, we should probably allow preview if special param/cookie, but for public route logic:
        notFound();
    }

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <article className="min-h-screen bg-[#FDFBF7]">
            {/* Dark Header with Image */}
            <header className="relative w-full h-[60vh] min-h-[500px]">
                {post.coverImage ? (
                    <>
                        <Image
                            src={typeof post.coverImage === 'string' ? post.coverImage : post.coverImage.src}
                            alt={typeof post.coverImage === 'string' ? post.title : post.coverImage.alt || post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Dark Overlay as requested */}
                        <div className="absolute inset-0 bg-black/60" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-olive" />
                )}

                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                    <div className="max-w-4xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <Link href="/noticias" className="inline-block mb-8 px-4 py-2 border border-white/30 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all">
                            &larr; Voltar
                        </Link>

                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 font-medium text-sm">
                            {post.author?.name && (
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                        {post.author.name[0]}
                                    </span>
                                    <span>{post.author.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{post.readingTimeMinutes} min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto -mt-20 relative z-20 px-4 pb-20">
                <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-16 border border-stone-100">

                    {/* Excerpt - Smaller/Distinct */}
                    <div className="mb-12 text-center">
                        <p className="text-xl md:text-2xl font-serif italic text-ink/70 leading-relaxed max-w-2xl mx-auto">
                            {post.excerpt}
                        </p>
                        <div className="w-20 h-1 bg-olive/20 mx-auto rounded-full mt-8" />
                    </div>

                    {/* Scrollable Content Area (Implicitly scrollable by page, but styled to feel contained) */}
                    <div className="prose prose-lg prose-stone max-w-none 
                        prose-headings:font-serif prose-headings:font-bold prose-headings:text-ink
                        prose-p:text-ink/80 prose-p:leading-relaxed
                        prose-a:text-olive prose-a:font-bold hover:prose-a:text-olive/80
                        prose-img:rounded-xl prose-img:shadow-lg
                        prose-blockquote:border-l-4 prose-blockquote:border-olive prose-blockquote:bg-stone-50 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                    ">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Footer / Share */}
                    <div className="mt-16 pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-sm font-bold text-ink/50 uppercase tracking-widest">
                            Compartilhe
                        </div>
                        <div className="flex gap-4">
                            <button className="p-3 rounded-full bg-stone-100 hover:bg-olive hover:text-white transition-colors text-ink/60">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
