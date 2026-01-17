"use client";

import React, { useEffect, useState, use } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Post } from "@/types/firestore";
import { getPostBySlug, savePost } from "@/services/contentService";
import { Loader2, ArrowLeft, Save, Globe, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- ZOD SCHEMA (Simulated locally for simplicity in this file, or explicit validation) ---
// Validations: excerpt mandatory, title mandatory, slug mandatory format.

export default function PostEditorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params); // Unwrapping params in Next 15+

    return (
        <AuthProvider>
            <PostEditor slug={slug} />
        </AuthProvider>
    );
}

function PostEditor({ slug }: { slug: string }) {
    const isNew = slug === 'new';
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');

    // Form State
    const [formData, setFormData] = useState<Partial<Post>>({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        tags: [],
        featuredRank: null,
        status: "DRAFT",
        coverImage: null,
        seo: { title: "", description: "" }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [slugLocked, setSlugLocked] = useState(!isNew);

    useEffect(() => {
        if (!isNew) {
            loadPost();
        } else {
            // Defaults for new post
            setFormData(prev => ({
                ...prev,
                author: { uid: user?.uid || "", name: user?.email?.split('@')[0] },
                tags: []
            }));
        }
    }, [slug, user]);

    async function loadPost() {
        setLoading(true);
        const data = await getPostBySlug(slug);
        if (data) {
            setFormData(data);
        } else {
            alert("Post não encontrado"); // Should redirect
            router.push("/admin/content/posts");
        }
        setLoading(false);
    }

    // Auto-generate slug from title if new and not manually edited
    useEffect(() => {
        if (isNew && !slugLocked && formData.title) {
            setFormData(prev => ({ ...prev, slug: slugify(formData.title || "") }));
        }
    }, [formData.title, isNew, slugLocked]);

    function validate(): boolean {
        const newErrors: Record<string, string> = {};
        if (!formData.title?.trim()) newErrors.title = "Título obrigatório";
        if (!formData.slug?.trim()) newErrors.slug = "Slug obrigatório";
        if (!formData.excerpt?.trim()) newErrors.excerpt = "Resumo (excerpt) obrigatório para SEO";
        if (formData.excerpt && formData.excerpt.length > 160) newErrors.excerpt = "Resumo muito longo (max 160 chars)";

        // Slug format check
        if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = "Slug inválido (apenas letras minúsculas, números e hífens)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSave(targetStatus?: 'DRAFT' | 'PUBLISHED') {
        if (!validate()) {
            alert("Corrija os erros antes de salvar.");
            return;
        }
        if (!user?.uid) return;

        setSaving(true);
        try {
            const finalStatus = targetStatus || formData.status || 'DRAFT';
            const now = new Date().toISOString();

            const postToSave: Post = {
                // merge basics
                ...(formData as unknown as Post), // Cast partial to merge
                // Enforce required fields structure logic
                id: formData.slug!,
                slug: formData.slug!,
                updatedAt: now,
                status: finalStatus,
                author: formData.author || { uid: user.uid, name: "Admin" },
                readingTimeMinutes: 0, // Service calculates this
                createdAt: formData.createdAt || now,
                publishedAt: (finalStatus === 'PUBLISHED' && !formData.publishedAt) ? now : formData.publishedAt || null
            };

            await savePost(postToSave, user.uid);

            if (isNew) {
                // Redirect to edit page (real slug) so we don't create dupes on refresh
                router.replace(`/admin/content/posts/${postToSave.slug}`);
            } else {
                alert("Salvo com sucesso!");
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    }

    // --- RENDER HELPERS ---

    // Tag handling
    const addTag = (t: string) => {
        if (!t) return;
        const current = formData.tags || [];
        if (!current.includes(t)) setFormData({ ...formData, tags: [...current, t] });
    };
    const removeTag = (t: string) => {
        setFormData({ ...formData, tags: (formData.tags || []).filter(tag => tag !== t) });
    };

    if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-40"> {/* pb-40 for bottom bar space */}

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/content/posts" className="p-2 hover:bg-gray-100 rounded-full text-ink/50">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="text-xs uppercase font-bold text-ink/40 tracking-wider">
                            {isNew ? "Criando Novo Post" : "Editando Post"}
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-ink truncate max-w-lg">
                            {formData.title || "Sem Título"}
                        </h1>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <button
                            className={cn("px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2", viewMode === 'EDIT' ? "bg-ink/5 text-ink" : "text-ink/50")}
                            onClick={() => setViewMode('EDIT')}
                        >
                            <EditIcon size={14} /> Editor
                        </button>
                        <button
                            className={cn("px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2", viewMode === 'PREVIEW' ? "bg-ink/5 text-ink" : "text-ink/50")}
                            onClick={() => setViewMode('PREVIEW')}
                        >
                            <Eye size={14} /> Preview
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Editor Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {viewMode === 'EDIT' ? (
                            <>
                                {/* Basic Info */}
                                <div className="bg-white p-6 rounded-xl border space-y-4">
                                    <div>
                                        <label className="label">Título</label>
                                        <input
                                            className="input text-lg font-serif"
                                            placeholder="Ex: Benefícios do Kombucha"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        {errors.title && <p className="error">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="label flex justify-between">
                                            <span>Slug (URL)</span>
                                            {slugLocked && <button onClick={() => setSlugLocked(false)} className="text-[10px] underline text-blue-500">Editar</button>}
                                        </label>
                                        <input
                                            className={cn("input font-mono text-sm", slugLocked && "bg-gray-50 text-gray-500 cursor-not-allowed")}
                                            value={formData.slug}
                                            readOnly={slugLocked}
                                            onChange={e => setFormData({ ...formData, slug: slugify(e.target.value) })}
                                            placeholder="beneficios-do-kombucha"
                                        />
                                        {errors.slug && <p className="error">{errors.slug}</p>}
                                    </div>

                                    <div>
                                        <label className="label">Resumo (Excerpt)</label>
                                        <p className="text-[10px] text-ink/40 mb-1">Aparece nos cards e no Google. Max 160 caracteres.</p>
                                        <textarea
                                            className="input h-24 resize-none"
                                            placeholder="Resumo atrativo para o leitor..."
                                            value={formData.excerpt}
                                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                            maxLength={160}
                                        />
                                        <div className="text-right text-[10px] text-ink/30">
                                            {formData.excerpt?.length || 0}/160
                                        </div>
                                        {errors.excerpt && <p className="error">{errors.excerpt}</p>}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="bg-white p-6 rounded-xl border space-y-2">
                                    <label className="label">Conteúdo (Markdown)</label>
                                    <div className="border rounded-lg overflow-hidden focus-within:ring-2 ring-olive/20 transition-all">
                                        {/* Toolbar (Fake for now) */}
                                        <div className="bg-gray-50 border-b px-3 py-2 flex gap-2 text-ink/50 text-xs font-bold">
                                            <span>M↓ Markdown Supported</span>
                                        </div>
                                        <textarea
                                            className="w-full h-[500px] p-4 font-mono text-sm outline-none resize-y"
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="# Comece a escrever aqui..."
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* PREVIEW MODE */
                            <div className="bg-white p-8 rounded-xl border min-h-[600px] prose prose-stone max-w-none">
                                <h1 className="font-serif text-4xl font-bold mb-4">{formData.title}</h1>
                                {formData.coverImage?.src && (
                                    <img src={formData.coverImage.src} alt={formData.coverImage.alt} className="w-full h-64 object-cover rounded-xl mb-8" />
                                )}
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formData.content || "*Sem conteúdo*"}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Settings */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Status Card */}
                        <div className="bg-white p-4 rounded-xl border">
                            <h3 className="label mb-3">Publicação</h3>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-ink/60">Status atual:</span>
                                <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase", formData.status === 'PUBLISHED' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                                    {formData.status === 'PUBLISHED' ? "Publicado" : "Rascunho"}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => handleSave('DRAFT')}
                                    disabled={saving}
                                    className="w-full py-2 rounded border border-ink/10 hover:bg-gray-50 font-bold text-ink/70 text-sm flex justify-center items-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    Salvar Rascunho
                                </button>

                                {formData.status === 'DRAFT' ? (
                                    <button
                                        onClick={() => handleSave('PUBLISHED')}
                                        disabled={saving}
                                        className="w-full py-2 rounded bg-olive text-white hover:bg-olive/90 font-bold text-sm shadow-sm flex justify-center items-center gap-2"
                                    >
                                        <Globe size={14} /> Publicar Agora
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSave('DRAFT')}
                                        disabled={saving}
                                        className="w-full py-2 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold text-sm"
                                    >
                                        Despublicar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Image */}
                        <div className="bg-white p-4 rounded-xl border">
                            <h3 className="label mb-3">Imagem de Capa</h3>
                            <input
                                className="input mb-2 text-xs"
                                placeholder="URL da Imagem (https://...)"
                                value={formData.coverImage?.src || ""}
                                onChange={e => setFormData({
                                    ...formData,
                                    coverImage: { src: e.target.value, alt: formData.coverImage?.alt || "" }
                                })}
                            />
                            <input
                                className="input text-xs"
                                placeholder="Descrição (Alt Text) - Obrigatório"
                                value={formData.coverImage?.alt || ""}
                                onChange={e => setFormData({
                                    ...formData,
                                    coverImage: { src: formData.coverImage?.src || "", alt: e.target.value }
                                })}
                            />
                            {formData.coverImage?.src && (
                                <div className="mt-2 rounded-lg overflow-hidden border h-32 relative">
                                    <img src={formData.coverImage.src} className="w-full h-full object-cover" alt="preview" />
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="bg-white p-4 rounded-xl border">
                            <h3 className="label mb-3">Tags & SEO</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags?.map(tag => (
                                    <span key={tag} className="bg-paper2 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 group">
                                        #{tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                className="input text-xs"
                                placeholder="Adicionar tag (Enter)"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag(e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />

                            <hr className="my-4" />

                            <label className="label text-[10px]">Featured Rank (1-3)</label>
                            <input
                                type="number"
                                min="1" max="3"
                                className="input text-xs w-20"
                                value={formData.featuredRank || ""}
                                onChange={e => setFormData({ ...formData, featuredRank: e.target.value ? parseInt(e.target.value) : null })}
                            />
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
                .label { @apply block text-xs font-bold uppercase text-ink/50 mb-1 tracking-wider; }
                .input { @apply w-full p-2 rounded border border-ink/10 focus:border-olive focus:ring-1 focus:ring-olive transition-all outline-none; }
                .error { @apply text-red-500 text-xs mt-1 font-bold; }
            `}</style>
        </AdminLayout>
    );
}

function EditIcon({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
}
