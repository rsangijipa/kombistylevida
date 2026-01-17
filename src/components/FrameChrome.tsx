import React from "react";

export function FrameChrome() {
    return (
        <>
            {/* 
        1) Border lines removed for cleaner look
      */}


            {/* 
        3) Ornamentos nos 4 cantos (SVG)
        - Absolute positioning
        - No distortion
      */}
            {/* Top Left */}
            <CornerOrnament className="absolute left-6 top-6 h-12 w-12 text-ink/55 md:left-8 md:top-8" />
            {/* Top Right (Rotate 90) */}
            <CornerOrnament className="absolute right-6 top-6 h-12 w-12 rotate-90 text-ink/55 md:right-8 md:top-8" />
            {/* Bottom Right (Rotate 180) */}
            <CornerOrnament className="absolute bottom-6 right-6 h-12 w-12 rotate-180 text-ink/55 md:bottom-8 md:right-8" />
            {/* Bottom Left (Rotate 270) */}
            <CornerOrnament className="absolute bottom-6 left-6 h-12 w-12 -rotate-90 text-ink/55 md:bottom-8 md:left-8" />

            {/* 
        4) Flourish Central Superior 
        - Centered
        - Opacity controlled
      */}
            <div className="absolute left-1/2 top-5 -translate-x-1/2 opacity-60 md:top-7">
                <TopFlourish className="h-6 w-32 text-ink/40" />
            </div>
        </>
    );
}

function CornerOrnament({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 50 50" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
            {/* Canto arredondado estilizado */}
            <path
                d="M2 50V24C2 11.85 11.85 2 24 2h26"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Detalhe interno */}
            <path
                d="M12 50v-8c0-12 12-12 12-24h8"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.6"
                strokeLinecap="round"
            />
            {/* Bolinha decorativa */}
            <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
        </svg>
    );
}

function TopFlourish({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 140 20" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
            {/* Linha curva suave tipo "bigode" */}
            <path
                d="M70 18 C 50 18, 40 5, 10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M70 18 C 90 18, 100 5, 130 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            {/* Pequeno diamante central */}
            <rect x="68" y="4" width="4" height="4" transform="rotate(45 70 6)" fill="currentColor" />
        </svg>
    );
}
