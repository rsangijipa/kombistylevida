import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F3EBDD",
        paper2: "#EFE3D1",
        ink: "#2D2A25",
        ink2: "#494834",
        inkSoft: "rgba(45, 42, 37, 0.65)",
        olive: "#6B7A55",
        amber: "#D7A85E",
        amber2: "#EECE88",
        faq: "#EDE4D5",
      },
      boxShadow: {
        paper: "0 18px 45px rgba(0,0,0,0.18)",
        print: "0 1px 0 rgba(0,0,0,0.18)",
      },
      borderRadius: {
        frame: "28px",
        frameInner: "18px",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "var(--font-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%, 100%": { transform: "translateX(0px)" },
          "50%": { transform: "translateX(8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        drift: "drift 10s ease-in-out infinite",
        pulseSoft: "pulseSoft 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
