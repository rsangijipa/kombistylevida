"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BookOpen, Sprout } from "lucide-react"; // Icons for scientific/light modes

type ContentMode = "light" | "scientific";

interface ContentModeToggleProps {
    mode: ContentMode;
    onChange: (mode: ContentMode) => void;
}

export function ContentModeToggle({ mode, onChange }: ContentModeToggleProps) {
    return (
        <div className="inline-flex items-center rounded-full border border-ink/20 bg-paper2 p-1 shadow-inner">
            <button
                onClick={() => onChange("light")}
                className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-300",
                    mode === "light"
                        ? "bg-white text-olive shadow-sm"
                        : "text-ink/50 hover:text-ink/80"
                )}
            >
                <Sprout className="h-4 w-4" />
                <span>Leve</span>
            </button>
            <button
                onClick={() => onChange("scientific")}
                className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-300",
                    mode === "scientific"
                        ? "bg-white text-olive shadow-sm"
                        : "text-ink/50 hover:text-ink/80"
                )}
            >
                <BookOpen className="h-4 w-4" />
                <span>Científico</span>
            </button>
        </div>
    );
}
