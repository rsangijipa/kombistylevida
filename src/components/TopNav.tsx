"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const SECTION_IDS = ["sobre", "sabores", "cultura", "faq", "contato"] as const;

export function TopNav() {
    const [active, setActive] = useState<(typeof SECTION_IDS)[number]>("cultura");

    const items = useMemo(
        () => [
            { id: "sobre", label: "Sobre" },
            { id: "sabores", label: "Sabores" },
            { id: "cultura", label: "Cultura Viva" },
            { id: "faq", label: "FAQ" },
            { id: "contato", label: "Contato" },
        ],
        []
    );

    useEffect(() => {
        const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
                if (visible?.target?.id) setActive(visible.target.id as any);
            },
            { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: "-18% 0px -68% 0px" }
        );

        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <nav className="mx-auto flex max-w-4xl items-center justify-center gap-6 pt-2 text-[15px] md:gap-8">
            {items.map((it) => {
                const isActive = active === it.id;
                return (
                    <a
                        key={it.id}
                        href={`#${it.id}`}
                        className={cn(
                            "relative font-serif text-ink2/90 transition hover:text-ink",
                            "after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[1px] after:bg-ink2/65 after:content-['']",
                            isActive && "vintage-underline text-ink"
                        )}
                    >
                        {it.label}
                    </a>
                );
            })}
        </nav>
    );
}
