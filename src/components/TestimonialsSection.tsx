"use client";

import React, { useEffect, useState } from "react";
import { getAllTestimonials } from "@/services/contentService";
import { Testimonial } from "@/types/firestore";
import { Star, Quote, Loader2 } from "lucide-react";

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // Fetch only approved testimonials
                const data = await getAllTestimonials('APPROVED');
                // Limit to 6 recent ones
                setTestimonials(data.slice(0, 6));
            } catch (e) {
                console.error("Failed to load testimonials", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (!loading && testimonials.length === 0) return null;

    return (
        <section id="depoimentos" className="mt-20 md:mt-28 mb-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="font-serif text-[36px] font-semibold text-olive md:text-[42px]">
                        Quem Prova, Ama
                    </h2>
                    <div className="mt-4 h-[2px] w-12 mx-auto bg-amber rounded-full opacity-60" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-olive/50" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.id} className="bg-paper2/50 p-6 rounded-xl border border-ink/5 relative flex flex-col gap-4 hover:border-olive/20 transition-colors">
                                <Quote className="absolute top-4 right-4 text-olive/10" size={40} />

                                <div className="flex gap-1 text-amber-500 mb-2">
                                    {Array(t.rating || 5).fill(0).map((_, i) => (
                                        <Star key={i} size={14} fill="currentColor" />
                                    ))}
                                </div>

                                <p className="text-ink/80 italic text-sm leading-relaxed flex-1">
                                    &ldquo;{t.text}&rdquo;
                                </p>

                                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-ink/5">
                                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center font-bold text-olive shadow-sm uppercase border border-ink/5">
                                        {t.displayName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-ink">{t.displayName}</div>
                                        {t.role && <div className="text-xs text-ink/50 uppercase tracking-wide">{t.role}</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
