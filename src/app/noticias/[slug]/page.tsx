import React from "react";
import { getPostBySlug, getAllPosts } from "@/services/contentService";
import { Loader2, Calendar, Clock, Share2, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Metadata } from "next";

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
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
    const post = await getPostBySlug(slug);

    if (!post || post.status !== 'PUBLISHED') {
        // In production, we should probably allow preview if special param/cookie, but for public route logic:
        notFound();
    }

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <article className="min-h-screen bg-[#FDFBF7]">
            {/* Header / Cover */}
            <header className="relative w-full h-[60vh] min-h-[400px] flex items-end">
                {post.coverImage && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={post.coverImage.src}
                            alt={post.coverImage.alt}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>
                )}

                <div className="container mx-auto px-4 pb-12 relative z-10 text-white">
                    <div className="max-w-3xl">
                        <Link href="/noticias" className="inline-block mb-6 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white hover:underline">&larr; Voltar para Notícias</Link>

                        <div className="flex gap-3 mb-4">
                            {post.tags?.map(t => (
                                <span key={t} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-white/30">
                                    {t}
                                </span>
                            ))}
                        </div>

                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balanced">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-6 text-sm font-medium text-white/80">
                            {post.author?.name && (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                                        {post.author.name[0]}
                                    </div>
                                    <span>{post.author.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{post.readingTimeMinutes} min de leitura</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto">
                    <p className="text-xl md:text-2xl font-serif italic text-ink/70 leading-relaxed mb-12 border-l-4 border-olive pl-6">
                        {post.excerpt}
                    </p>

                    <div className="prose prose-lg prose-stone max-w-none 
                        prose-headings:font-serif prose-headings:font-bold prose-headings:text-ink
                        prose-p:text-ink/80 prose-p:leading-relaxed
                        prose-a:text-olive prose-a:font-bold hover:prose-a:text-olive/80
                        prose-img:rounded-xl prose-img:shadow-lg
                        prose-blockquote:border-l-olive prose-blockquote:bg-paper2 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                    ">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Footer / Share */}
                    <div className="mt-16 pt-8 border-t border-olive/10 flex justify-between items-center">
                        <div className="text-sm font-bold text-ink/50">
                            Gostou? Compartilhe essa história.
                        </div>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <button className="p-2 rounded-full bg-paper2 hover:bg-olive hover:text-white transition-colors">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </article>
    );
}
