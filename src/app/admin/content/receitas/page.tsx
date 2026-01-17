"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy, deleteDoc } from "firebase/firestore";
import { Recipe, RecipeCategory } from "@/types/firestore";
import { Plus, Save, Edit, Trash2, ChevronLeft, ChevronDown, ListPlus, X, Copy } from "lucide-react";
import Link from "next/link";

const CATEGORIES: RecipeCategory[] = [
    "Mocktail (Sem Álcool)",
    "Coquetel (Com Álcool)",
    "Gastronomia (Salgados)",
    "Sobremesas"
];

const DIFFICULTIES = ["Fácil", "Médio", "Avançado"];

const EMPTY_RECIPE: Partial<Recipe> = {
    title: "",
    slug: "",
    category: "Mocktail (Sem Álcool)",
    difficulty: "Fácil",
    timeMinutes: 10,
    servings: "1 drink",
    excerpt: "",
    image: "",
    tags: [],
    kombuchaBase: "",
    kombuchaFlavorSuggested: [],
    ingredients: [],
    steps: [],
    tips: [],
    pairings: [],
    hasAlcohol: false,
    disclaimer: "",
    ctaWhatsAppText: "",
    status: "DRAFT",
    featuredRank: undefined
};

export default function AdminRecipesPage() {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Recipe>>(EMPTY_RECIPE);

    // Temporary inputs for array fields
    const [inputs, setInputs] = useState({
        tag: "",
        ingredient: "",
        step: "",
        tip: "",
        pairing: "",
        flavor: ""
    });

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Recipe));
            setRecipes(data);
        } catch (e) {
            console.error("Failed to fetch recipes", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setFormData({ ...EMPTY_RECIPE });
        setInputs({ tag: "", ingredient: "", step: "", tip: "", pairing: "", flavor: "" });
        setIsEditing(true);
    };

    const handleEdit = (recipe: Recipe) => {
        setFormData({ ...recipe });
        setInputs({ tag: "", ingredient: "", step: "", tip: "", pairing: "", flavor: "" });
        setIsEditing(true);
    };

    const handleDuplicate = async (recipe: Recipe) => {
        const { id, ...data } = recipe;
        const newRecipe = {
            ...data,
            title: `${data.title} (Cópia)`,
            slug: `${data.slug}-copy`,
            status: "DRAFT" as const,
            createdAt: new Date().toISOString()
        };
        try {
            await addDoc(collection(db, "recipes"), newRecipe);
            fetchRecipes();
        } catch (e) {
            console.error("Error duplicating", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta receita?")) return;
        try {
            await deleteDoc(doc(db, "recipes", id));
            fetchRecipes();
        } catch (e) {
            console.error(e);
            alert("Erro ao excluir.");
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.slug) {
            alert("Título e Slug são obrigatórios.");
            return;
        }

        try {
            const recipeData = {
                ...formData,
                updatedAt: new Date().toISOString()
            };

            if (formData.id) {
                const ref = doc(db, "recipes", formData.id);
                const { id, ...data } = recipeData as any;
                await updateDoc(ref, data);
            } else {
                const newRecipe = {
                    ...recipeData,
                    createdAt: new Date().toISOString(),
                };
                await addDoc(collection(db, "recipes"), newRecipe);
            }

            setIsEditing(false);
            fetchRecipes();
        } catch (e) {
            console.error("Error saving recipe", e);
            alert("Erro ao salvar.");
        }
    };

    // Helper to add item to array
    const addItem = (field: keyof typeof inputs, arrayField: keyof Recipe) => {
        const val = inputs[field].trim();
        if (!val) return;
        const currentArray = (formData[arrayField] as string[]) || [];
        setFormData(prev => ({ ...prev, [arrayField]: [...currentArray, val] }));
        setInputs(prev => ({ ...prev, [field]: "" }));
    };

    // Helper to remove item from array
    const removeItem = (idx: number, arrayField: keyof Recipe) => {
        const currentArray = (formData[arrayField] as string[]) || [];
        setFormData(prev => ({ ...prev, [arrayField]: currentArray.filter((_, i) => i !== idx) }));
    };

    if (loading) return <div className="p-8 text-ink/40 font-serif animate-pulse">Carregando CMS...</div>;

    if (isEditing) {
        return (
            <div className="max-w-5xl mx-auto animate-in slide-in-from-right pb-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-paper/90 backdrop-blur-md p-4 rounded-b-xl z-20 border-b border-olive/10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-ink/5 rounded-full">
                            <ChevronLeft size={24} className="text-olive" />
                        </button>
                        <h2 className="text-2xl font-serif text-olive font-bold">
                            {formData.id ? "Editar Receita" : "Nova Receita"}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-olive text-white font-bold uppercase tracking-wider shadow-lg hover:bg-olive/90 transition-transform active:scale-95"
                        >
                            <Save size={18} /> Salvar
                        </button>
                    </div>
                </div>

                <div className="grid gap-8">
                    {/* Basic Info Module */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-olive mb-4 border-b border-olive/10 pb-2">Informações Básicas</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-ink/40">Título</label>
                                    <input
                                        className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none font-serif text-lg"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-ink/40">Slug (URL)</label>
                                        <input
                                            className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none font-mono text-sm"
                                            value={formData.slug}
                                            // Lock slug if editing existing
                                            readOnly={!!formData.id}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-ink/40">Imagem (URL)</label>
                                        <input
                                            className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none font-mono text-sm"
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-ink/40">Resumo (Excerpt)</label>
                                    <textarea
                                        className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none h-24"
                                        value={formData.excerpt}
                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-ink/40">Categoria</label>
                                    <select
                                        className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none appearance-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-ink/40">Dificuldade</label>
                                        <select
                                            className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none"
                                            value={formData.difficulty}
                                            onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                                        >
                                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-ink/40">Tempo (min)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none"
                                            value={formData.timeMinutes}
                                            onChange={e => setFormData({ ...formData, timeMinutes: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-ink/40">Porções</label>
                                        <input
                                            className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none"
                                            value={formData.servings}
                                            onChange={e => setFormData({ ...formData, servings: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer bg-red-50 p-2 rounded border border-red-100">
                                        <input
                                            type="checkbox"
                                            checked={formData.hasAlcohol}
                                            onChange={e => setFormData({ ...formData, hasAlcohol: e.target.checked })}
                                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                        />
                                        <span className="text-xs font-bold uppercase text-red-800">Contém Álcool</span>
                                    </label>

                                    <div className="flex-1">
                                        <label className="text-xs font-bold uppercase text-ink/40 block mb-1">Rank Destaque (1-3)</label>
                                        <input
                                            type="number"
                                            min="1" max="3"
                                            className="w-full p-2 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none"
                                            value={formData.featuredRank || ""}
                                            onChange={e => setFormData({ ...formData, featuredRank: e.target.value ? Number(e.target.value) as 1 | 2 | 3 : undefined })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center justify-between bg-paper p-3 rounded-lg border border-ink/10">
                                        <span className="font-bold text-olive">Status</span>
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, status: p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }))}
                                            className={`px-4 py-2 rounded-full font-bold uppercase text-xs transition-colors ${formData.status === 'PUBLISHED' ? 'bg-olive text-white' : 'bg-gray-200 text-gray-500'}`}
                                        >
                                            {formData.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kombucha & Conversion */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-olive mb-4 border-b border-olive/10 pb-2">Kombucha & Conversão</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-ink/40">Base Recomendada</label>
                                    <input
                                        className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none"
                                        value={formData.kombuchaBase}
                                        placeholder="ex: Chá Verde"
                                        onChange={e => setFormData({ ...formData, kombuchaBase: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-ink/40">Sabores Sugeridos</label>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {formData.kombuchaFlavorSuggested?.map((f, i) => (
                                            <span key={i} className="bg-olive/10 text-olive px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                {f} <X size={12} className="cursor-pointer" onClick={() => removeItem(i, 'kombuchaFlavorSuggested')} />
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 p-2 border border-ink/10 rounded-lg outline-none text-sm"
                                            value={inputs.flavor}
                                            onChange={e => setInputs({ ...inputs, flavor: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && addItem('flavor', 'kombuchaFlavorSuggested')}
                                            placeholder="Add sabor..."
                                        />
                                        <button onClick={() => addItem('flavor', 'kombuchaFlavorSuggested')} className="bg-olive text-white p-2 rounded-lg"><Plus size={16} /></button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-ink/40 mb-2 block">CTA WhatsApp (Mensagem pronta)</label>
                                <textarea
                                    className="w-full p-3 border border-ink/10 rounded-lg bg-green-50 focus:border-green-500 outline-none h-32 text-sm text-green-900 placeholder:text-green-800/50"
                                    value={formData.ctaWhatsAppText || ""}
                                    onChange={e => setFormData({ ...formData, ctaWhatsAppText: e.target.value })}
                                    placeholder="Olá! Quero pedir os ingredientes para a receita X..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Arrays: Ingredients & Steps */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Ingredients */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-olive mb-4 border-b border-olive/10 pb-2">Ingredientes</h3>
                            <ul className="space-y-2 mb-4">
                                {formData.ingredients?.map((ing, i) => (
                                    <li key={i} className="flex gap-2 items-start text-sm p-2 bg-paper2/30 rounded border border-transparent hover:border-olive/20 group">
                                        <span className="w-5 h-5 rounded-full bg-olive/10 text-olive flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                                        <span className="flex-1">{ing}</span>
                                        <button onClick={() => removeItem(i, 'ingredients')} className="text-red-400 opacity-0 group-hover:opacity-100"><X size={14} /></button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 p-2 border border-ink/10 rounded-lg outline-none"
                                    value={inputs.ingredient}
                                    onChange={e => setInputs({ ...inputs, ingredient: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && addItem('ingredient', 'ingredients')}
                                    placeholder="Novo ingrediente..."
                                />
                                <button onClick={() => addItem('ingredient', 'ingredients')} className="bg-olive text-white px-4 rounded-lg font-bold"><Plus size={18} /></button>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-olive mb-4 border-b border-olive/10 pb-2">Passo a Passo</h3>
                            <ul className="space-y-2 mb-4">
                                {formData.steps?.map((s, i) => (
                                    <li key={i} className="flex gap-2 items-start text-sm p-2 bg-paper2/30 rounded border border-transparent hover:border-olive/20 group">
                                        <span className="w-5 h-5 rounded-full bg-olive text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                                        <span className="flex-1">{s}</span>
                                        <button onClick={() => removeItem(i, 'steps')} className="text-red-400 opacity-0 group-hover:opacity-100"><X size={14} /></button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <textarea
                                    className="flex-1 p-2 border border-ink/10 rounded-lg outline-none h-20 resize-none"
                                    value={inputs.step}
                                    onChange={e => setInputs({ ...inputs, step: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addItem('step', 'steps'))}
                                    placeholder="Descreva o passo..."
                                />
                                <button onClick={() => addItem('step', 'steps')} className="bg-olive text-white px-4 rounded-lg font-bold place-self-end h-10"><Plus size={18} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Tips, Pairings & Tags */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-olive mb-4 border-b border-olive/10 pb-2">Dicas Técnicas</h3>
                            <ul className="space-y-2 mb-4">
                                {formData.tips?.map((t, i) => (
                                    <div key={i} className="flex justify-between items-start text-sm p-2 bg-yellow-50 text-yellow-800 rounded border border-yellow-100">
                                        <span>💡 {t}</span>
                                        <X size={14} className="cursor-pointer shrink-0 ml-2" onClick={() => removeItem(i, 'tips')} />
                                    </div>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 p-2 border border-ink/10 rounded-lg outline-none text-sm"
                                    value={inputs.tip}
                                    onChange={e => setInputs({ ...inputs, tip: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && addItem('tip', 'tips')}
                                    placeholder="Dica..."
                                />
                                <button onClick={() => addItem('tip', 'tips')} className="bg-olive text-white p-2 rounded-lg"><Plus size={16} /></button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-olive mb-4 border-b border-olive/10 pb-2">Harmonizações</h3>
                            <ul className="space-y-2 mb-4">
                                {formData.pairings?.map((p, i) => (
                                    <div key={i} className="flex justify-between items-start text-sm p-2 bg-purple-50 text-purple-900 rounded border border-purple-100">
                                        <span>🍷 {p}</span>
                                        <X size={14} className="cursor-pointer shrink-0 ml-2" onClick={() => removeItem(i, 'pairings')} />
                                    </div>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 p-2 border border-ink/10 rounded-lg outline-none text-sm"
                                    value={inputs.pairing}
                                    onChange={e => setInputs({ ...inputs, pairing: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && addItem('pairing', 'pairings')}
                                    placeholder="Harmoniza com..."
                                />
                                <button onClick={() => addItem('pairing', 'pairings')} className="bg-olive text-white p-2 rounded-lg"><Plus size={16} /></button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-olive mb-4 border-b border-olive/10 pb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.tags?.map((t, i) => (
                                    <span key={i} className="bg-ink/5 text-ink px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        #{t} <X size={12} className="cursor-pointer" onClick={() => removeItem(i, 'tags')} />
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 p-2 border border-ink/10 rounded-lg outline-none text-sm"
                                    value={inputs.tag}
                                    onChange={e => setInputs({ ...inputs, tag: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && addItem('tag', 'tags')}
                                    placeholder="Tag..."
                                />
                                <button onClick={() => addItem('tag', 'tags')} className="bg-olive text-white p-2 rounded-lg"><Plus size={16} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-beige">
                        <label className="text-xs font-bold uppercase text-ink/40 mb-2 block">Disclaimer (Segurança/Cuidado)</label>
                        <input
                            className="w-full p-3 border border-ink/10 rounded-lg bg-paper2/50 focus:border-olive outline-none text-red-800/70 placeholder:text-red-200"
                            value={formData.disclaimer || ""}
                            onChange={e => setFormData({ ...formData, disclaimer: e.target.value })}
                            placeholder="Ex: Contém álcool. Beba com moderação."
                        />
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-olive mb-2">Receitas do Alquimista</h1>
                    <p className="text-ink/60 max-w-lg">Gerencie o conteúdo de engajamento, receitas e harmonizações da comunidade KombiStyle.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-3 px-6 py-4 rounded-xl bg-olive text-white font-bold uppercase tracking-wider shadow-lg hover:bg-olive/90 transition-all hover:-translate-y-1 active:scale-95 self-start md:self-auto"
                >
                    <Plus size={20} /> Nova Receita
                </button>
            </div>

            {/* List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recipes.map(recipe => (
                    <div key={recipe.id} className="group bg-white rounded-2xl border border-ink/5 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative">
                        {recipe.featuredRank && (
                            <div className="absolute top-0 left-0 z-10 bg-yellow-400 text-yellow-900 border-b border-r border-yellow-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-br-lg shadow-sm">
                                Destaque #{recipe.featuredRank}
                            </div>
                        )}
                        <div className="h-48 bg-paper2 relative overflow-hidden">
                            {recipe.image ? (
                                <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-ink/10 text-4xl">🥥</div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${recipe.status === 'PUBLISHED' ? 'bg-olive text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {recipe.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                                </span>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                <span className="text-white/90 text-xs font-bold uppercase tracking-widest">{recipe.category}</span>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-serif text-xl font-bold text-olive mb-2 leading-tight group-hover:text-olive/80 transition-colors">{recipe.title}</h3>
                            <p className="text-ink/50 text-sm mb-4 line-clamp-2">{recipe.excerpt}</p>

                            <div className="mt-auto flex items-center gap-4 text-xs font-bold text-ink/40 uppercase tracking-widest border-t border-ink/5 pt-4">
                                <span>⏱ {recipe.timeMinutes} min</span>
                                <span>⚡ {recipe.difficulty}</span>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(recipe)}
                                    className="flex-1 py-2 rounded-lg bg-ink/5 hover:bg-olive hover:text-white transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    <Edit size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDuplicate(recipe)}
                                    className="px-3 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                    title="Duplicar"
                                >
                                    <Copy size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(recipe.id)}
                                    className="px-3 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {recipes.length === 0 && !loading && (
                <div className="text-center py-24 m-auto max-w-sm opacity-50">
                    <div className="text-6xl mb-4">📜</div>
                    <p className="font-serif text-xl text-olive">O livro de receitas está vazio.</p>
                </div>
            )}
        </div>
    );
}
