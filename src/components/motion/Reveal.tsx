"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    variant?: "soft" | "medium" | "hero";
    delay?: number;
    width?: "fit-content" | "100%";
}

const variants = {
    soft: {
        initial: { opacity: 0, y: 14, filter: "blur(6px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.8, ease: "easeOut" },
    },
    medium: {
        initial: { opacity: 0, y: 30, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 1, ease: "easeOut" },
    },
    hero: {
        initial: { opacity: 0, y: 40, filter: "blur(12px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 1.2, ease: "easeOut" },
    },
};

export function Reveal({ children, variant = "soft", delay = 0, width = "fit-content" }: RevealProps) {
    return (
        <motion.div
            variants={variants[variant]}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            transition={{ ...variants[variant].transition, delay }}
            style={{ width, position: "relative" }}
        >
            {children}
        </motion.div>
    );
}
