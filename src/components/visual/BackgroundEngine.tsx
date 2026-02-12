"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";

const ParticlesLayer = dynamic(() => import("./ParticlesLayer").then((mod) => mod.ParticlesLayer), {
    ssr: false,
});

export function BackgroundEngine() {
    return (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            {/* Background Base Texture (from globals.css via body::before usually, but here as a layer for Engine) */}
            <div className="absolute inset-0 bg-paper" />

            {/* Aurora Layer */}
            <div className={cn(
                "absolute inset-[-50%] opacity-40 animate-aurora fx-aurora",
                "mobile-reduce-blur:blur-xl" // Hypothetical class for mobile reduction if needed, but usually handled in globals.css
            )} />

            {/* Watercolor Layer */}
            <div className="absolute inset-0 opacity-10 fx-watercolor bg-ink/5" />

            {/* Grain Layer */}
            <div className="absolute inset-0 fx-grain pointer-events-none" />

            {/* Particles Layer (Only on Larger screens / not reduced motion) */}
            <div className="hidden sm:block">
                <ParticlesLayer />
            </div>

            {/* Fade Masks */}
            <div className="absolute inset-0 mask-fade-y pointer-events-none" />
        </div>
    );
}
