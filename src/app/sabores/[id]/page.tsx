import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { PRODUCTS } from "@/data/catalog";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export async function generateStaticParams() {
    return [
        { id: 'ginger-lemon' },
        { id: 'red-berries' },
        { id: 'purple-grape' },
        { id: 'passionfruit' }
    ];
}

export default function FlavorPage({ params }: { params: { id: string } }) {
    const product = PRODUCTS.find(p => p.id === params.id);

    // Fallback logic
    if (!product) return notFound();

    const richData: Record<string, { longDesc: string, ingredients: string[], pairings: string[] }> = {
        "ginger-lemon": {
            longDesc: "Um clássico revigorante. A picância natural do gengibre encontra a acidez vibrante do limão, criando uma bebida que desperta os sentidos, auxilia na digestão e fortalece a imunidade.",
            ingredients: ["Chá verde (Camellia sinensis)", "Gengibre fresco orgânico", "Suco de limão taiti", "Açúcar orgânico"],
            pairings: ["Saladas frescas", "Peixes grelhados", "Cuscuz marroquino", "Dias de sol"]
        },
        "red-berries": {
            longDesc: "Uma explosão de sabores do bosque. Esta combinação antioxidante traz o azedinho do hibisco equilibrado com a doçura natural do morango e da amora.",
            ingredients: ["Chá preto (Camellia sinensis)", "Morango", "Amora", "Mirtilo", "Flor de hibisco", "Açúcar orgânico"],
            pairings: ["Cheesecakes", "Queijos suaves (Brie)", "Brownies", "Fim de tarde"]
        },
        "purple-grape": {
            longDesc: "Intenso, encorpado e sofisticado. Feito com uvas de colheita selecionada, traz notas profundas que lembram um bom vinho, mas sem álcool e cheio de probióticos.",
            ingredients: ["Chá preto (Camellia sinensis)", "Suco concentrado de uva integral", "Açúcar orgânico"],
            pairings: ["Massas com molho vermelho", "Risotos", "Tábuas de frios", "Jantares especiais"]
        },
        "passionfruit": {
            longDesc: "Tropicalidade pura no copo. O perfume inconfundível do maracujá traz calma e refrescância, com aquele azedinho equilibrado que todo mundo ama.",
            ingredients: ["Chá verde (Camellia sinensis)", "Polpa de maracujá natural", "Capim-santo", "Açúcar orgânico"],
            pairings: ["Moquecas", "Poke bowls", "Salada de frutas", "Momentos relax"]
        }
    };

    const extra = richData[product.id] || {
        longDesc: product.shortDesc || "",
        ingredients: ["Chá verde", "Açúcar orgânico", "Cultura kombucha"],
        pairings: ["Beba gelado!"]
    };

    return (
        <SiteShell>
            <div className="mx-auto max-w-4xl py-6 md:py-12">
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">

                    {/* Image Side */}
                    <div className="w-full md:w-1/2 ">
                        <div className="aspect-square relative overflow-hidden rounded-[32px] bg-[#fdfbf7] border border-ink/5 shadow-inner flex items-center justify-center group">
                            <div className="absolute inset-0 opacity-30 mix-blend-multiply bg-[url('/images/paper-texture.png')] bg-repeat" />

                            {/* Vignette */}
                            <div className="absolute inset-0 bg-radial-vignette opacity-20" />

                            {product.imageSrc && (
                                <div className="relative w-[320px] h-[320px] transition-transform duration-700 hover:scale-105">
                                    <Image
                                        src={product.imageSrc}
                                        alt={product.name}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        sizes="(max-width: 768px) 100vw, 400px"
                                        priority
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center h-full">
                        <span className="mb-2 inline-block rounded-full bg-olive/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-olive w-fit">
                            Kombucha Artesanal
                        </span>

                        <h1 className="font-serif text-[42px] leading-[1.1] font-bold text-olive mb-4 md:text-[52px]">
                            {product.name}
                        </h1>

                        <p className="font-serif text-[18px] text-ink2 leading-relaxed mb-8 border-l-4 border-amber pl-4">
                            {extra.longDesc}
                        </p>

                        <div className="space-y-6 mb-10">
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40 mb-2">Ingredientes</h4>
                                <p className="text-sm text-ink/80 font-medium leading-relaxed">
                                    {extra.ingredients.join(" • ")}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40 mb-2">Harmonização</h4>
                                <div className="flex flex-wrap gap-2">
                                    {extra.pairings.map(p => (
                                        <span key={p} className="inline-block rounded-md border border-ink/10 bg-white px-3 py-1.5 text-xs font-bold text-ink2 shadow-sm">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center gap-6">
                            <div className="text-3xl font-serif font-bold text-ink">
                                R$ {((product.priceCents || 0) / 100).toFixed(2).replace(".", ",")}
                            </div>
                            <AddToCartButton productId={product.id} className="w-full sm:w-auto px-8 py-3.5 text-sm flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
