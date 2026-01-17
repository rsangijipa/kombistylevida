"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Recipe } from "@/types/firestore";
import Link from "next/link";
import { ArrowLeft, Share2, Clock, ChefHat, Users, CheckCircle2, AlertCircle, MessageCircle, Heart } from "lucide-react";

// Since it's a dynamic route, we receive params.
// But this is a Client Component so we use the hook or receive params via props if it was Server.
// In Next 13 App Dir, page blocks receive `{ params }: { params: { slug: string } }`
// Let's make this page accept the prop.

import { RECIPES_DATA } from "@/lib/recipes-data";
import { useParams } from "next/navigation";

export default function RecipeDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecipe() {
            setLoading(true);
            try {
                // Find by slug
                const q = query(
                    collection(db, "recipes"),
                    where("slug", "==", slug),
                    limit(1)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setRecipe(snapshot.docs[0].data() as Recipe);
                } else {
                    // Fallback to static data
                    const staticRecipe = RECIPES_DATA.find(r => r.slug === slug);
                    if (staticRecipe) {
                        console.log("Recipe not found in DB, using static fallback.");
                        setRecipe(staticRecipe);
                    } else {
                        setRecipe(null);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch recipe", e);
                // Try fallback on error too
                const staticRecipe = RECIPES_DATA.find(r => r.slug === slug);
                if (staticRecipe) setRecipe(staticRecipe);
            } finally {
                setLoading(false);
            }
        }
        if (slug) fetchRecipe();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <span className="text-4xl">🍵</span>
                    <div className="text-olive font-serif text-2xl tracking-widest uppercase">Infusionando Sabores...</div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-6 text-center p-6">
                <span className="text-6xl text-ink/20">📜</span>
                <h1 className="font-serif text-4xl font-bold text-olive">Receita não encontrada.</h1>
                <p className="text-ink/60 max-w-md text-lg">Parece que esta página do nosso livro de receitas foi arrancada ou ainda não foi escrita.</p>
                <Link href="/receitas" className="bg-olive text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-olive/90 transition-all">
                    Voltar ao Início
                </Link>
            </div>
        );
    }

    const whatsappMessage = recipe.ctaWhatsAppText
        ? encodeURIComponent(recipe.ctaWhatsAppText)
        : encodeURIComponent(`Olá! Vi a receita de *${recipe.title}* e gostaria de saber quais kombuchas combinam com ela! 🌿`);

    return (
        <div className="min-h-screen bg-paper text-ink pb-32">
            {/* Full Screen Background Image */}
            <div className="fixed inset-0 z-0">
                {recipe.image ? (
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover opacity-90"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-beige text-ink/10 text-9xl font-serif">
                        🥥
                    </div>
                )}
                {/* Global Overlay for readability */}
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            </div>

            {/* Back Button - Fixed & Touch Friendly */}
            <div className="fixed top-6 left-6 z-50">
                <Link
                    href="/receitas"
                    className="flex items-center justify-center bg-stone-100/90 backdrop-blur-md text-olive border border-white/50 w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={18} className="md:mr-2" />
                    <span className="hidden md:inline">Voltar</span>
                </Link>
            </div>

            {/* Header Content */}
            <div className="relative z-10 pt-[40vh] md:pt-[35vh] px-6 pb-12">
                <div className="max-w-7xl mx-auto w-full">

                    {/* Title with Blurred Gradient Background */}
                    <div className="relative mb-6 inline-block">
                        <div className="absolute inset-0 bg-black/30 blur-2xl -z-10 rounded-full scale-125 opacity-80" />
                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl leading-[1.1] max-w-5xl">
                            {recipe.title}
                        </h1>
                    </div>

                    {/* Tags - Now Below Title */}
                    <div className="flex flex-wrap gap-3 mb-8 animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                        <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            {recipe.category}
                        </span>
                        {recipe.hasAlcohol && (
                            <span className="bg-orange-500/30 backdrop-blur-md text-orange-50 border border-orange-200/30 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                <AlertCircle size={14} /> Teor Alcoólico
                            </span>
                        )}
                        <span className="bg-black/20 backdrop-blur-md text-white/90 border border-white/10 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                            <Clock size={14} /> {recipe.timeMinutes} min
                        </span>
                    </div>

                    <p className="text-xl md:text-3xl text-white/95 font-serif italic max-w-3xl leading-relaxed mb-12 drop-shadow-lg font-medium">
                        &ldquo;{recipe.excerpt}&rdquo;
                    </p>

                    {/* Stats Bar (Simplified/Transparent) */}
                    <div className="hidden md:flex flex-wrap gap-12 border-t border-white/20 pt-8 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <ChefHat size={32} className="text-white/80" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">Dificuldade</p>
                                <p className="font-serif text-2xl font-bold text-white">{recipe.difficulty}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users size={32} className="text-white/80" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">Rendimento</p>
                                <p className="font-serif text-2xl font-bold text-white">{recipe.servings}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout - No Overlap */}
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-16 xl:gap-24 relative z-20 pb-20">

                {/* Sidebar (Ingredients & Kombucha) */}
                <aside className="space-y-8">
                    {/* Ingredients Card */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-olive/40 to-transparent" />

                        <h3 className="font-serif text-2xl font-bold text-olive mb-6 flex items-center gap-3">
                            <span className="text-4xl filter drop-shadow-sm">🍅</span> Ingredientes
                        </h3>

                        <ul className="space-y-4">
                            {recipe.ingredients?.map((ing, idx) => (
                                <li key={idx} className="flex gap-4 items-start group">
                                    <div className="mt-1 h-5 w-5 rounded-full border-2 border-olive/20 group-hover:border-olive group-hover:bg-olive/10 transition-colors flex-shrink-0" />
                                    <span className="text-lg text-ink leading-snug group-hover:text-olive transition-colors font-medium">
                                        {ing}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* WhatsApp CTA Mini */}
                        <div className="mt-8 pt-8 border-t border-dashed border-ink/10 text-center">
                            <p className="text-sm text-ink/60 mb-3">Faltou algum ingrediente?</p>
                            <a
                                href={`https://wa.me/5548999999999?text=${whatsappMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-green-50 text-green-700 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-green-100 transition-colors border border-green-100"
                            >
                                <MessageCircle size={16} /> Pedir no WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Kombucha Base Card */}
                    <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-white/40 shadow-sm">
                        <h3 className="font-serif text-xl font-bold text-olive mb-4 flex items-center gap-2">
                            ✨ A Alma do Drink
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">Base Recomendada</p>
                                <p className="text-lg font-serif text-ink font-semibold">{recipe.kombuchaBase}</p>
                            </div>
                            {recipe.kombuchaFlavorSuggested && recipe.kombuchaFlavorSuggested.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-2">Sabores que Harmonizam</p>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.kombuchaFlavorSuggested.map(f => (
                                            <span key={f} className="bg-olive/5 text-olive px-3 py-1 rounded text-sm font-bold border border-olive/10">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main: Instructions & Tips */}
                <article className="space-y-8">

                    {/* Steps Card */}
                    <section className="bg-white/70 backdrop-blur-lg p-8 md:p-12 rounded-[2rem] shadow-sm border border-white/50">
                        <h3 className="font-serif text-3xl font-bold text-olive mb-8 pb-4 border-b border-olive/10 flex items-center gap-4">
                            <span className="text-4xl opacity-50">🥣</span> Modo de Preparo
                        </h3>
                        <div className="space-y-10">
                            {recipe.steps?.map((step, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="flex-shrink-0 relative">
                                        <span className="font-serif text-5xl font-bold text-olive/20 group-hover:text-olive/40 transition-colors select-none">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-olive/20 rounded-full" />
                                    </div>
                                    <p className="text-xl text-ink leading-relaxed pt-2 group-hover:text-ink/80 transition-colors font-medium">
                                        {step}
                                    </p>
                                </div>
                            ))}
                            {!recipe.steps?.length && (
                                <p className="text-ink/50 italic">Nenhum passo a passo cadastrado.</p>
                            )}
                        </div>
                    </section>

                    {/* Tips & Tricks - Glass Card */}
                    {recipe.tips && recipe.tips.length > 0 && (
                        <section className="bg-yellow-50/60 backdrop-blur-md p-8 rounded-2xl border border-yellow-100/50 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-yellow-500/10 rotate-12">
                                <AlertCircle size={120} />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-yellow-900 mb-6 flex items-center gap-3 relative z-10">
                                💡 Dicas da Alquimista
                            </h3>
                            <ul className="grid gap-4 relative z-10">
                                {recipe.tips.map((tip, i) => (
                                    <li key={i} className="flex gap-3 text-yellow-900/80 text-lg leading-relaxed font-medium">
                                        <span className="text-yellow-500 text-xl">•</span> {tip}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Pairings - Glass Card */}
                    {recipe.pairings && recipe.pairings.length > 0 && (
                        <section className="bg-purple-50/40 backdrop-blur-md p-8 rounded-2xl border border-purple-100/50">
                            <h3 className="font-serif text-xl font-bold text-purple-900 mb-6 flex items-center gap-3">
                                🍷 Harmonização Perfeita
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {recipe.pairings.map((p, i) => (
                                    <span key={i} className="px-4 py-2 bg-white/80 rounded-lg shadow-sm text-purple-800 font-bold border border-purple-100">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Disclaimer */}
                    {recipe.disclaimer && (
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg text-white/90 text-sm flex gap-3 italic border border-white/20 shadow-lg">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            {recipe.disclaimer}
                        </div>
                    )}

                </article>
            </div>

            {/* Sticky Mobile CTA or Bottom CTA */}
            <div className="fixed bottom-6 right-6 z-40 hidden md:block animate-in slide-in-from-bottom duration-1000 delay-1000">
                <a
                    href={`https://wa.me/5548999999999?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 pl-4 pr-6 py-4 bg-olive text-white rounded-full shadow-2xl hover:bg-olive/90 hover:scale-105 transition-all"
                >
                    <div className="bg-white/20 p-2 rounded-full">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Gostou?</p>
                        <p className="font-bold font-serif text-lg leading-none">Peça os Kits no Whats</p>
                    </div>
                </a>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 inset-x-0 p-4 bg-white border-t border-ink/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
                <a
                    href={`https://wa.me/5548999999999?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 w-full py-4 bg-olive text-white rounded-xl font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                >
                    <MessageCircle size={20} /> Pedir Ingredientes
                </a>
            </div>

        </div>
    );
}
