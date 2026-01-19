"use client";

import React, { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Recipe, RecipeCategory } from "@/types/firestore";
import { ArrowRight, Clock, ChefHat, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteShell } from "@/components/SiteShell";

const CATEGORIES: RecipeCategory[] = [
    "Mocktail (Sem Álcool)",
    "Coquetel (Com Álcool)",
    "Gastronomia (Salgados)",
    "Sobremesas"
];

import { RECIPES_DATA } from "@/lib/recipes-data";

export default function RecipesList() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | "Todas">("Todas");

    useEffect(() => {
        async function fetchRecipes() {
            setLoading(true);
            try {
                const res = await fetch('/api/recipes');

                let data: Recipe[] = [];
                if (res.ok) {
                    data = await res.json();
                }

                if (data.length === 0) {
                    // Fallback to static data if DB is empty (Architecture Decision for Stability)
                    console.log("No recipes found in DB, using static fallback.");
                    data = RECIPES_DATA.filter(r => r.status === "PUBLISHED");
                }

                // Manual sort since we might lack index
                data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setRecipes(data);
            } catch (e) {
                console.error("Failed to fetch recipes", e);
                // Fallback on error (Permission/Network/Index)
                console.log("Error fetching DB, using static fallback.");
                const data = RECIPES_DATA.filter(r => r.status === "PUBLISHED");
                data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setRecipes(data);
            } finally {
                setLoading(false);
            }
        }
        fetchRecipes();
    }, []);

    const filteredRecipes = selectedCategory === "Todas"
        ? recipes
        : recipes.filter(r => r.category === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="animate-pulse text-olive font-serif text-2xl tracking-widest uppercase">Carregando o Livro de Receitas...</div>
            </div>
        );
    }

    return (
        <SiteShell>
            <div className="min-h-screen bg-paper text-ink">
                {/* Header */}
                <header className="py-16 px-6 text-center relative overflow-hidden -mx-4 md:-mx-12 rounded-t-[32px] md:rounded-t-[48px]">
                    {/* same header content */}
                    {/* Custom Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/recipes/header_bg.png"
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                    </div>


                    {/* Bottom fade only - keeps top clear */}
                    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-paper to-transparent pointer-events-none z-10" />

                    <div className="relative z-20 max-w-4xl mx-auto">
                        <span className="text-olive/80 font-bold uppercase tracking-[0.2em] text-sm mb-4 block drop-shadow-sm">Kombucha Arikê</span>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive mb-6 leading-tight drop-shadow-sm">
                            Alquimia & <br /> <span className="italic text-ink/80">Sabores Vivos</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-ink/80 text-lg md:text-xl leading-relaxed font-serif font-medium drop-shadow-sm">
                            Explore nossa coleção curada de drinks probióticos, harmonizações gastronômicas e segredos para elevar seu ritual diário.
                        </p>
                    </div>
                </header>

                {/* Filters */}
                <nav className="sticky top-[calc(var(--topnav-h)-1px)] z-30 bg-paper/95 backdrop-blur-sm border-b border-olive/10 py-4 px-4 md:px-12 shadow-sm -mx-4 md:-mx-12 transition-all">
                    <div className="max-w-6xl mx-auto overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2 min-w-max justify-start md:justify-center px-2">
                            <button
                                onClick={() => setSelectedCategory("Todas")}
                                className={cn(
                                    "px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300",
                                    selectedCategory === "Todas"
                                        ? "bg-olive text-white shadow-lg scale-105"
                                        : "bg-paper2 text-ink/50 hover:bg-olive/10 hover:text-olive"
                                )}
                            >
                                Todas
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300",
                                        selectedCategory === cat
                                            ? "bg-olive text-white shadow-lg scale-105"
                                            : "bg-paper2 text-ink/50 hover:bg-olive/10 hover:text-olive"
                                    )}
                                >
                                    {cat.split(" (")[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Grid */}
                <main className="max-w-none mx-auto px-4 py-8 pb-16 -mx-4 md:-mx-12 bg-paper relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {filteredRecipes.length === 0 ? (
                            <div className="text-center py-32 opacity-50">
                                <div className="text-6xl mb-6">🍃</div>
                                <p className="text-2xl font-serif text-olive">Nenhuma receita encontrada nesta seção.</p>
                                <p className="mt-2 text-ink/60">Experimente outra categoria ou volte em breve.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {filteredRecipes.map((recipe) => (
                                    <Link
                                        key={recipe.id}
                                        href={`/receitas/${recipe.slug}`}
                                        className="group block bg-white rounded-t-[2rem] rounded-b-lg overflow-hidden  shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                                    >
                                        <div className="aspect-[3/4] bg-paper2 relative overflow-hidden">
                                            {recipe.featuredRank && (
                                                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-olive px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                                                    Destaque da Chef
                                                </div>
                                            )}
                                            {recipe.image ? (
                                                <img
                                                    src={recipe.image}
                                                    alt={recipe.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[0.1] group-hover:grayscale-0"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-ink/20 font-serif bg-brand-beige/20">
                                                    <span className="text-4xl mb-4">🥥</span>
                                                    <span>Em breve</span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{recipe.category.split(" (")[0]}</span>
                                                <div className="flex items-center gap-4 text-white/90 text-xs font-medium">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {recipe.timeMinutes} min</span>
                                                    <span className="flex items-center gap-1"><ChefHat size={12} /> {recipe.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 md:p-6 flex-1 flex flex-col bg-white relative">
                                            <div className="absolute -top-6 right-6 w-12 h-12 bg-olive text-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-brand-orange transition-colors duration-300">
                                                <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                            </div>

                                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-olive mb-3 leading-tight group-hover:text-ink transition-colors">
                                                {recipe.title}
                                            </h2>

                                            <p className="text-ink/60 text-sm leading-relaxed mb-4 line-clamp-3 font-serif">
                                                {recipe.excerpt}
                                            </p>

                                            <div className="mt-auto flex flex-wrap gap-2 pt-6 border-t border-olive/10">
                                                {recipe.tags?.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] lowercase italic text-olive/70">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </SiteShell>
    );
}
