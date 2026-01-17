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
        paper: "#F9F6EC",
        paper2: "#FBF2E9",
        ink: "#322918",
        ink2: "#494834",
        olive: "#353424",
        amber: "#ECBC75",
        amber2: "#EECE88",
        faq: "#EDE4D5",
      },
      boxShadow: {
        paper: "0 18px 45px rgba(0,0,0,.18)",
        print: "0 1px 0 rgba(0,0,0,.18)",
      },
      borderRadius: {
        frame: "22px",
        frameInner: "18px",
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
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
