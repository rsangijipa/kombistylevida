

"use client";

import React, { useEffect, useState } from "react";
import { getAllPosts } from "@/services/contentService";
import { Post } from "@/types/firestore";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { SiteShell } from "@/components/SiteShell";

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

    if (loading) {
        return (
            <SiteShell>
                <div className="py-40 text-center flex justify-center">
                    <Loader2 className="animate-spin text-olive" size={40} />
                </div>
            </SiteShell>
        );
    }

    return (
        <SiteShell>
            <div className="pb-20">
                {/* Hero Section - Editorial Style */}
                <div className="mb-16 text-center md:mb-24">
                    <p className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-olive mb-4">Journal</p>
                    <h1 className="font-serif text-[40px] leading-tight text-ink font-bold md:text-[56px] tracking-tight">
                        Notícias & Histórias
                    </h1>
                    <div className="mx-auto mt-6 h-[1px] w-20 bg-ink/30" />
                    <p className="mx-auto mt-6 max-w-2xl text-ink2 text-lg font-serif italic leading-relaxed">
                        Explore o universo do Kombucha, vida saudável e bastidores da nossa produção artesanal.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Featured Section */}
                    {featured.length > 0 && (
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                            {/* Main Featured */}
                            <Link href={`/noticias/${featured[0].slug}`} className="group relative aspect-[4/3] lg:aspect-auto lg:h-[500px] block overflow-hidden bg-paper2 shadow-paper transition-all hover:shadow-lg">
                                {/* Vintage Border Frame */}
                                <div className="absolute inset-0 border-[12px] border-paper z-10 pointer-events-none" />
                                <div className="absolute inset-[12px] border border-ink/10 z-10 pointer-events-none" />

                                {featured[0].coverImage && (
                                    <Image
                                        src={featured[0].coverImage.src}
                                        alt={featured[0].coverImage.alt}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end text-paper z-20">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-3 text-amber-300">Destaque</div>
                                    <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4 group-hover:underline decoration-1 underline-offset-4">{featured[0].title}</h2>
                                    <p className="text-white/80 line-clamp-2 md:line-clamp-3 mb-6 max-w-lg text-sm md:text-base font-serif leading-relaxed">{featured[0].excerpt}</p>
                                    <div className="flex items-center gap-2 text-xs font-bold opacity-80 uppercase tracking-widest">
                                        <span>{formatDate(featured[0].publishedAt || "")}</span>
                                        <span>• {featured[0].readingTimeMinutes} min</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Secondary Featured List */}
                            <div className="flex flex-col gap-8 justify-center">
                                {featured.slice(1).map(post => (
                                    <Link href={`/noticias/${post.slug}`} key={post.id} className="group flex flex-col sm:flex-row gap-6 items-center">
                                        <div className="relative w-full sm:w-[200px] aspect-[4/3] flex-shrink-0 bg-paper2 shadow-sm border border-ink/10 overflow-hidden">
                                            {post.coverImage && (
                                                <Image src={post.coverImage.src} alt={post.coverImage.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-olive mb-2">{post.tags?.[0]}</div>
                                            <h3 className="font-serif text-xl font-bold text-ink mb-3 leading-tight group-hover:text-olive transition-colors">{post.title}</h3>
                                            <p className="text-ink/60 text-sm line-clamp-2 mb-3 font-serif italic">{post.excerpt}</p>
                                            <div className="text-xs text-ink/40 font-medium">{formatDate(post.publishedAt || "")}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="border-t border-ink/10 mb-16 max-w-xs mx-auto" />

                    {/* Grid Section - Vintage Cards */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {list.length === 0 && featured.length === 0 ? (
                                <div className="col-span-full text-center text-ink/40 py-12 font-serif italic">Nenhuma notícia publicada ainda.</div>
                            ) : list.map(post => (
                                <Link href={`/noticias/${post.slug}`} key={post.id} className="group flex flex-col h-full bg-paper2 transition-all hover:-translate-y-1 hover:shadow-md">
                                    <div className="relative aspect-[3/2] overflow-hidden border-b border-ink/5">
                                        {post.coverImage ? (
                                            <Image src={post.coverImage.src} alt={post.coverImage.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-ink/10 font-serif text-4xl bg-ink/5">K</div>
                                        )}
                                        {/* Texture Overlay */}
                                        <div className="absolute inset-0 bg-paper opacity-10 mix-blend-multiply pointer-events-none" />
                                    </div>

                                    <div className="flex-1 p-6 flex flex-col">
                                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest text-olive mb-3">
                                            <span>{formatDate(post.publishedAt || "")}</span>
                                        </div>
                                        <h3 className="font-serif text-2xl font-bold text-ink mb-3 group-hover:text-olive transition-colors leading-tight">
                                            {post.title}
                                        </h3>
                                        <p className="text-ink/60 line-clamp-3 text-sm leading-relaxed mb-6 font-serif">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-ink/5 text-xs font-bold text-ink uppercase tracking-widest group-hover:text-olive transition-colors">
                                            Ler artigo
                                        </div>
                                    </div>

                                    {/* Vintage Outline */}
                                    <div className="absolute inset-0 border border-ink/10 pointer-events-none" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </SiteShell>
    );
}
