"use client";

import React, { useEffect, useState } from "react";
import { getAllPosts } from "@/services/contentService";
import { Post } from "@/types/firestore";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";

// Layout components (Navbar/Footer) should be global in app/layout, 
// but referencing here for structure.
// Assuming global layout handles Header/Footer.

export default function NoticiasIndexPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getAllPosts('PUBLISHED');
            setPosts(data);
            setLoading(false);
        }
        load();
    }, []);

    // Featured Logic (Top 3)
    const featured = posts.filter(p => p.featuredRank).sort((a, b) => (a.featuredRank! - b.featuredRank!));
    const list = posts.filter(p => !p.featuredRank);

    // Helpers
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (loading) return <div className="py-40 text-center"><Loader2 className="animate-spin inline text-olive" size={40} /></div>;

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            {/* Hero Section */}
            <div className="bg-olive/5 border-b border-olive/10 py-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-olive mb-4">Journal</p>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold text-ink mb-6">Notícias & Histórias</h1>
                    <p className="font-serif italic text-xl text-ink/60 max-w-2xl mx-auto">
                        Explore o universo do Kombucha, vida saudável e bastidores da nossa produção artesanal.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 space-y-20">

                {/* Featured Section */}
                {featured.length > 0 && (
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Main Featured */}
                        <Link href={`/noticias/${featured[0].slug}`} className="group relative aspect-[4/3] lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden block">
                            {featured[0].coverImage && (
                                <Image
                                    src={featured[0].coverImage.src}
                                    alt={featured[0].coverImage.alt}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
                                <div className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-300">Destaque</div>
                                <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4">{featured[0].title}</h2>
                                <p className="text-white/80 line-clamp-2 md:line-clamp-3 mb-4 max-w-lg text-sm md:text-base">{featured[0].excerpt}</p>
                                <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                                    <span>{formatDate(featured[0].publishedAt || "")}</span>
                                    <span>• {featured[0].readingTimeMinutes} min leitura</span>
                                </div>
                            </div>
                        </Link>

                        {/* Secondary Featured */}
                        <div className="flex flex-col gap-8">
                            {featured.slice(1).map(post => (
                                <Link href={`/noticias/${post.slug}`} key={post.id} className="group flex flex-col sm:flex-row gap-6 items-center flex-1">
                                    <div className="relative w-full sm:w-1/2 aspect-video rounded-xl overflow-hidden">
                                        {post.coverImage && (
                                            <Image src={post.coverImage.src} alt={post.coverImage.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-olive mb-2">{post.tags?.[0]}</div>
                                        <h3 className="font-serif text-xl font-bold text-ink mb-2 leading-tight group-hover:text-olive transition-colors">{post.title}</h3>
                                        <p className="text-ink/60 text-sm line-clamp-2 mb-2">{post.excerpt}</p>
                                        <div className="text-xs text-ink/40 font-medium">{formatDate(post.publishedAt || "")}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className="border-t border-olive/10" />

                {/* Grid Section */}
                <section>
                    <h2 className="font-serif text-3xl font-bold text-ink mb-10 text-center">Recentes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {list.length === 0 && featured.length === 0 ? (
                            <div className="col-span-full text-center text-ink/40 py-12">Nenhuma notícia publicada ainda.</div>
                        ) : list.map(post => (
                            <Link href={`/noticias/${post.slug}`} key={post.id} className="group flex flex-col h-full">
                                <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-6 bg-paper2">
                                    {post.coverImage ? (
                                        <Image src={post.coverImage.src} alt={post.coverImage.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-ink/10 font-serif text-4xl">K</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest text-olive mb-3">
                                        <span>{formatDate(post.publishedAt || "")}</span>
                                        {post.tags?.[0] && <span>• {post.tags[0]}</span>}
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-ink mb-3 group-hover:text-olive transition-colors leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-ink/60 line-clamp-3 text-sm leading-relaxed mb-4">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <div className="mt-auto text-xs font-bold text-ink underline decoration-ink/20 underline-offset-4 group-hover:decoration-olive">
                                    Ler artigo completo →
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
