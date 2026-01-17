import React from "react";
import { SiteShell } from "@/components/SiteShell";

export function QuizShell({ children }: { children: React.ReactNode }) {
    return (
        <SiteShell>
            <div className="min-h-screen bg-[#FDFBF7] pb-20">
                {/* Top Compliance Bar */}
                <div className="bg-ink/5 py-2 text-center border-b border-ink/10">
                    <p className="text-[10px] uppercase tracking-widest text-ink/60 font-bold">
                        Conteúdo Educativo • Não substitui orientação médica
                    </p>
                </div>

                <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-12">
                    {/* Paper Container */}
                    <div className="relative bg-paper2 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-xl border border-ink/5 overflow-hidden min-h-[600px] flex flex-col">
                        {/* Decorative Top Line */}
                        <div className="h-2 w-full bg-gradient-to-r from-amber-200 via-olive-300 to-amber-200 opacity-60" />

                        <div className="p-6 md:p-12 flex-1 flex flex-col">
                            {children}
                        </div>

                        {/* Texture */}
                        <div className="absolute inset-0 bg-paper opacity-30 mix-blend-multiply pointer-events-none z-0" />
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
