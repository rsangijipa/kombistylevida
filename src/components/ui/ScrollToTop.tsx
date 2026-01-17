"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // Toggle visibility based on scroll position
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-3 md:p-4 rounded-full bg-olive text-white shadow-lg border border-white/20 hover:bg-olive/90 hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            aria-label="Voltar ao topo"
            title="Voltar ao topo"
        >
            <ArrowUp size={24} />
        </button>
    );
}
