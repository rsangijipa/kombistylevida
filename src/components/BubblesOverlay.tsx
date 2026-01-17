import React from "react";

export function BubblesOverlay() {
    // Posições fixas "orgânicas" (não-grid) para parecer natural
    // Quantidade: ~8-14 bolhas.
    // 2-3 grandes nos cantos superiores.
    const bubbles = [
        // Top Left (Grande)
        { size: 90, left: "-4%", top: "5%", delay: "0s", opacity: 0.15 },
        // Top Right (Grande)
        { size: 80, right: "-2%", top: "8%", delay: "1.5s", opacity: 0.12 },
        // Top Middle-ish
        { size: 40, right: "20%", top: "2%", delay: "2.5s", opacity: 0.10 },

        // Middle/Side clusters
        { size: 50, left: "2%", top: "25%", delay: "1s", opacity: 0.14 },
        { size: 30, left: "5%", top: "35%", delay: "3s", opacity: 0.18 },

        { size: 60, right: "2%", top: "40%", delay: "0.5s", opacity: 0.08 },
        { size: 35, right: "6%", top: "55%", delay: "4s", opacity: 0.12 },

        // Bottom area
        { size: 45, left: "3%", top: "70%", delay: "2s", opacity: 0.10 },
        { size: 70, right: "-3%", top: "80%", delay: "1s", opacity: 0.14 },
        { size: 28, left: "10%", top: "85%", delay: "3.5s", opacity: 0.16 },
    ];

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-frame">
            {bubbles.map((b, i) => (
                <div
                    key={i}
                    className="absolute animate-floaty rounded-full border border-[rgb(120,80,40)]/20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_70%)] backdrop-blur-[0.5px]"
                    style={{
                        width: b.size,
                        height: b.size,
                        left: b.left,
                        right: b.right,
                        top: b.top,
                        animationDelay: b.delay,
                        opacity: b.opacity,
                    }}
                />
            ))}
        </div>
    );
}
