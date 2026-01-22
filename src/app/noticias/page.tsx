

"use client";

import React, { useEffect, useState } from "react";
// import { getAllPosts } from "@/services/contentService";
import { Post } from "@/types/firestore";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { SiteShell } from "@/components/SiteShell";
import { NewsEmptyState } from "@/components/content/NewsEmptyState";

export default function NoticiasIndexPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch('/api/posts');
                if (res.ok) {
                    const data = await res.json();
                    // Deduplicate by slug
                    const uniquePosts = Array.from(new Map(data.map((p: any) => [p.slug, p])).values()) as Post[];
                    setPosts(uniquePosts);
                }
            } catch (e) {
                console.error("Failed to load posts", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    //     // Featured Logic (Top 3)
    //     const featured = posts.filter(p => p.featuredRank).sort((a, b) => (a.featuredRank! - b.featuredRank!));
    //     const list = posts.filter(p => !p.featuredRank);

    // Helpers
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const formatDate = (iso: string) => {
        if (!mounted) return ""; // Avoid hydration mismatch
        return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

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
            <div className="min-h-screen bg-paper text-ink">
                {/* Header */}
                <header className="py-16 px-6 text-center relative overflow-hidden -mx-4 md:-mx-12 rounded-t-[32px] md:rounded-t-[48px]">
                    {/* Custom Background Image - Placeholder path until generation works */}
                    <div className="absolute inset-0 z-0 bg-stone-200">
                        <img
                            src="/images/news/header-bg.jpg"
                            alt="Background"
                            className="w-full h-full object-cover opacity-60"
                        />
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-paper to-transparent pointer-events-none z-10" />

                    <div className="relative z-20 max-w-4xl mx-auto">
                        <span className="text-olive/80 font-bold uppercase tracking-[0.2em] text-sm mb-4 block drop-shadow-sm">Kombucha Arikê</span>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive mb-6 leading-tight drop-shadow-sm">
                            Notícias & <br /> <span className="italic text-ink/80">Histórias</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-ink/80 text-lg md:text-xl leading-relaxed font-serif font-medium drop-shadow-sm">
                            Mergulhe no universo da fermentação, saúde intestinal e estilo de vida consciente.
                        </p>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 relative z-10">

                    {/* Grid of Small Cards */}
                    {posts.length === 0 ? (
                        <NewsEmptyState />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                            {posts.map((post, index) => (
                                <div
                                    key={post.slug}
                                    className="group flex flex-col bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        {post.coverImage ? (
                                            <Image
                                                src={typeof post.coverImage === 'string' ? post.coverImage : post.coverImage.src}
                                                alt={typeof post.coverImage === 'string' ? post.title : post.coverImage.alt || post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-serif text-4xl">K</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-olive mb-3 opacity-80">
                                            {formatDate(post.publishedAt || "")}
                                        </div>

                                        <h3 className="font-serif text-xl font-bold text-ink mb-3 leading-tight group-hover:text-olive transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>

                                        <p className="text-ink/60 text-sm leading-relaxed mb-6 font-serif line-clamp-5 flex-1">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={`/noticias/${post.slug}`}
                                            className="inline-flex items-center justify-center w-full py-3 border border-olive/20 rounded-xl text-xs font-bold uppercase tracking-widest text-olive hover:bg-olive hover:text-white transition-all"
                                        >
                                            Leia Mais
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SiteShell>
    );
}
