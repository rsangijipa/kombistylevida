"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
// import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"; // Removed
// import { db } from "@/lib/firebase"; // Removed
import { Loader2, Plus, Edit, Trash, FileText, Image as ImageIcon } from "lucide-react";

// Basic Post Type (simplified for MVP)
interface BlogPost {
    id: string; // slug
    title: string;
    excerpt: string;
    content: string; // HTML or Markdown
    imageSrc: string;
    publishedAt: string;
    author: string;
    status: 'draft' | 'published';
}

export default function BlogPostsPage() {
    return (
        <AuthProvider>
            <PostsManager />
        </AuthProvider>
    );
}

function PostsManager() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<BlogPost | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (e) {
            console.error("Error fetching posts:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const cleanId = editing.id.trim().replace(/\//g, '-');
            const payload = { ...editing, id: cleanId };

            const res = await fetch('/api/admin/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setEditing(null);
                fetchPosts();
            } else {
                alert("Erro ao salvar post.");
            }
        } catch (error) {
            alert("Erro ao salvar post.");
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este post?")) return;
        try {
            const res = await fetch(`/api/admin/posts?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPosts();
            } else {
                alert("Erro ao excluir.");
            }
        } catch (error) {
            alert("Erro ao excluir.");
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink">Blog & Conteúdo</h1>
                    <p className="text-sm md:text-base text-ink2">Gerencie as postagens do blog.</p>
                </div>
                <button
                    onClick={() => setEditing({
                        id: `post-${Date.now()}`,
                        title: "",
                        excerpt: "",
                        content: "",
                        imageSrc: "",
                        publishedAt: new Date().toISOString(),
                        author: "Admin",
                        status: 'draft'
                    })}
                    className="flex items-center gap-2 rounded-lg bg-olive px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-olive/90 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={16} /> Novo Post
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-olive">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {posts.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-ink/40 bg-white rounded-xl border border-ink/5">
                            Nenhum post encontrado. Crie o primeiro!
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="group bg-white rounded-xl border border-ink/10 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-40 bg-paper2 relative overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {post.imageSrc ? (
                                        <img src={post.imageSrc} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-ink/20">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-ink text-lg mb-1 truncate">{post.title || "(Sem título)"}</h3>
                                    <p className="text-xs text-ink/60 line-clamp-2 mb-4 h-8">{post.excerpt}</p>

                                    <div className="flex justify-between items-center pt-2 border-t border-ink/5">
                                        <span className="text-[10px] text-ink/40 font-mono">
                                            {new Date(post.publishedAt).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditing(post)}
                                                className="p-1.5 text-ink/50 hover:text-olive hover:bg-olive/10 rounded transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-1.5 text-ink/50 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Edit Sheet (Mobile Friendly) */}
            {editing && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-ink/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
                    <form
                        onSubmit={handleSave}
                        className="w-full h-[95vh] md:h-auto md:max-h-[85vh] max-w-2xl rounded-t-[24px] md:rounded-2xl bg-paper shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 flex flex-col"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-ink/5 shrink-0">
                            <div>
                                <h3 className="font-bold text-xl text-ink">
                                    {editing.id.startsWith('post-') ? 'Novo Post' : 'Editar Post'}
                                </h3>
                            </div>
                            <button type="button" onClick={() => setEditing(null)} className="p-2 -mr-2 text-ink/40 hover:text-ink"><Plus size={24} className="rotate-45" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-ink/50 mb-1">Título</label>
                                <input
                                    className="w-full rounded-lg border border-ink/10 bg-paper2 p-3 font-bold text-lg text-ink outline-none focus:border-olive"
                                    value={editing.title}
                                    onChange={e => setEditing({ ...editing, title: e.target.value })}
                                    required
                                    placeholder="Título do Post"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-ink/50 mb-1">Status</label>
                                    <select
                                        className="w-full rounded-lg border border-ink/10 bg-paper2 p-3 text-sm text-ink outline-none focus:border-olive"
                                        value={editing.status}
                                        onChange={e => setEditing({ ...editing, status: e.target.value as any })}
                                    >
                                        <option value="draft">Rascunho</option>
                                        <option value="published">Publicado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-ink/50 mb-1">Slug (URL)</label>
                                    <input
                                        className="w-full rounded-lg border border-ink/10 bg-paper2 p-3 text-xs font-mono text-ink outline-none focus:border-olive"
                                        value={editing.id}
                                        onChange={e => {
                                            // Simple slugify functionality on input
                                            const val = e.target.value
                                                .toLowerCase()
                                                .replace(/https?:\/\//g, '') // remove http:// or https://
                                                .replace(/[^a-z0-9-]/g, '-') // replace invalid chars with dash
                                                .replace(/-+/g, '-')         // collapse dashes
                                                .replace(/^-|-$/g, '');      // trim dashes

                                            setEditing({ ...editing, id: val });
                                        }}
                                        placeholder="ex: receita-de-kombucha"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-ink/50 mb-1">URL da Imagem</label>
                                <input
                                    className="w-full rounded-lg border border-ink/10 bg-paper2 p-3 text-sm text-ink outline-none focus:border-olive font-mono"
                                    value={editing.imageSrc}
                                    onChange={e => setEditing({ ...editing, imageSrc: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-ink/50 mb-1">Resumo (Excerpt)</label>
                                <textarea
                                    className="w-full rounded-lg border border-ink/10 bg-paper2 p-3 text-sm text-ink outline-none focus:border-olive resize-none h-20"
                                    value={editing.excerpt}
                                    onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-ink/50 mb-1">Conteúdo</label>
                                <textarea
                                    className="w-full rounded-lg border border-ink/10 bg-paper2 p-3 text-sm font-serif text-ink outline-none focus:border-olive h-64"
                                    value={editing.content}
                                    onChange={e => setEditing({ ...editing, content: e.target.value })}
                                    placeholder="Escreva seu conteúdo aqui..."
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-ink/5 flex gap-3 bg-paper shrink-0">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="flex-1 rounded-xl border border-ink/10 py-3.5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-paper2 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] rounded-xl bg-olive py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-olive/20 hover:bg-olive/90 transition-all active:scale-[0.98]"
                            >
                                Salvar Post
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
