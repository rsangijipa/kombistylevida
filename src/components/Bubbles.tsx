import React from "react";

export function Bubbles({ side }: { side: "left" | "right" }) {
    const isLeft = side === "left";
    return (
        <div
            aria-hidden
            className={[
                "pointer-events-none absolute top-0 h-full w-[140px] opacity-70",
                isLeft ? "left-0" : "right-0",
            ].join(" ")}
        >
            <svg className="h-full w-full" viewBox="0 0 140 650" fill="none">
                {[...Array(18)].map((_, i) => {
                    const cx = isLeft ? (i % 3) * 26 + 26 : 140 - ((i % 3) * 26 + 26);
                    const cy = 40 + i * 33;
                    const r = 6 + (i % 5) * 4;
                    const op = 0.18 + (i % 4) * 0.08;
                    return (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={r}
                            stroke={`rgba(50,41,24,${op})`}
                            strokeWidth="2"
                            fill={`rgba(255,255,255,${op * 0.35})`}
                        />
                    );
                })}
            </svg>

            <div className={["absolute inset-0", isLeft ? "animate-floaty" : "animate-drift"].join(" ")} />
        </div>
    );
}
