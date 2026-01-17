import React from "react";

export function OrnateFrame() {
    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1000 650"
            fill="none"
        >
            {/* linhas externas */}
            <rect x="24" y="24" width="952" height="602" rx="26" stroke="rgba(50,41,24,.55)" strokeWidth="2" />
            <rect x="42" y="42" width="916" height="566" rx="22" stroke="rgba(50,41,24,.35)" strokeWidth="2" />

            {/* cantos ornamentais */}
            <path
                d="M78 78c26 0 36 10 36 36 0 18-10 28-28 28-10 0-18-6-22-14"
                stroke="rgba(50,41,24,.55)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M922 78c-26 0-36 10-36 36 0 18 10 28 28 28 10 0 18-6 22-14"
                stroke="rgba(50,41,24,.55)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M78 572c26 0 36-10 36-36 0-18-10-28-28-28-10 0-18 6-22 14"
                stroke="rgba(50,41,24,.55)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M922 572c-26 0-36-10-36-36 0-18 10-28 28-28 10 0 18 6 22 14"
                stroke="rgba(50,41,24,.55)"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* arabescos laterais */}
            <path
                d="M55 180c30 10 30 40 0 50 30 10 30 40 0 50 30 10 30 40 0 50"
                stroke="rgba(50,41,24,.30)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M945 180c-30 10-30 40 0 50-30 10-30 40 0 50-30 10-30 40 0 50"
                stroke="rgba(50,41,24,.30)"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* pequenos círculos decorativos */}
            {[
                [92, 116],
                [908, 116],
                [92, 534],
                [908, 534],
            ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="6" stroke="rgba(50,41,24,.45)" strokeWidth="2" />
            ))}
        </svg>
    );
}
