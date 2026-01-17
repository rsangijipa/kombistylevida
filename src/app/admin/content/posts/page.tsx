"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Post } from "@/types/firestore";
import { getAllPosts, deletePost } from "@/services/contentService";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export default function PostsListPage() {
    return (
        <AuthProvider>
            <PostsManager />
        </AuthProvider>
    );
}

function PostsManager() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

    useEffect(() => {
        loadPosts();
    }, [filter]);

    async function loadPosts() {
        setLoading(true);
        // Map filter to service status arg
        const serviceStatus = filter === 'ALL' ? undefined : filter;
        const data = await getAllPosts(serviceStatus);
        setPosts(data);
        setLoading(false);
    }

    async function handleDelete(slug: string) {
        if (!confirm("Tem certeza que deseja excluir? Esta ação é irreversível.")) return;
        if (!user?.uid) return;
        await deletePost(slug, user.uid);
        loadPosts();
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink">Blog Posts</h1>
                        <p className="text-ink2">Gerenciamento editorial.</p>
                    </div>
                    <Link href="/admin/content/posts/new" className="bg-olive text-white px-4 py-2 rounded-lg font-bold hover:bg-olive/90 flex items-center gap-2">
                        <Plus size={18} /> Novo Post
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 border-b pb-1">
                    {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold border-b-2 transition-colors",
                                filter === f ? "border-olive text-olive" : "border-transparent text-ink/50 hover:text-ink"
                            )}
                        >
                            {f === 'ALL' ? 'Todos' : f === 'PUBLISHED' ? 'Publicados' : 'Rascunhos'}
                        </button>
                    ))}
                </div>

                {loading ? <div className="text-center p-20"><Loader2 className="animate-spin inline" size={32} /></div> : (
                    <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase text-ink/50">Título / Slug</th>
                                    <th className="p-4 text-xs font-bold uppercase text-ink/50">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase text-ink/50">Autor</th>
                                    <th className="p-4 text-xs font-bold uppercase text-ink/50 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {posts.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-ink/40 italic">Nenhum post encontrado.</td></tr>
                                ) : (
                                    posts.map(post => (
                                        <tr key={post.slug} className="hover:bg-gray-50 group transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-ink text-base">{post.title}</div>
                                                <div className="text-xs text-ink/50 font-mono mt-1">{post.slug}</div>
                                                {post.featuredRank && (
                                                    <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-bold uppercase tracking-wide">
                                                        Destaque #{post.featuredRank}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {post.status === 'PUBLISHED' ? (
                                                    <div className="flex flex-col">
                                                        <span className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                                            <Eye size={12} /> Publicado
                                                        </span>
                                                        <span className="text-[10px] text-ink/40 mt-1">
                                                            {new Date(post.publishedAt || "").toLocaleDateString("pt-BR")}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                                        <FileText size={12} /> Rascunho
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-ink/70">
                                                {post.author?.name || "-"}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/admin/content/posts/${post.slug}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(post.slug)} className="p-2 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
