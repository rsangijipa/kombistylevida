import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/cn";
import { CatalogProvider } from "@/context/CatalogContext";
import { ToastProvider } from "@/context/ToastContext";

const serif = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
    variable: "--font-serif",
    display: "swap",
});

const sans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "Kombucha Arikê | Artesanal de Verdade",
    description: "Kombucha fermentada naturalmente em Ariquemes - RO, feita com ingredientes reais e carinho. Descubra o equilíbrio entre saúde e sabor.",
    keywords: ["kombucha", "fermentação natural", "probióticos", "saúde", "bem-estar", "bebida artesanal", "chá fermentado", "Ariquemes", "Rondônia"],
    openGraph: {
        title: "Kombucha Arikê | Estilo e sabor em cada gole",
        description: "Kombucha artesanal de verdade. Fermentação lenta, ingredientes naturais e muita vida. Feito em Ariquemes - RO.",
        type: "website",
        locale: "pt_BR",
        images: ["/images/hero-new.jpg"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Kombucha Arikê",
        description: "Kombucha artesanal fermentada naturalmente.",
    },
};

import { ScrollToTop } from "@/components/ui/ScrollToTop";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body
                className={cn(
                    serif.variable,
                    sans.variable,
                    "antialiased selection:bg-amber/30 selection:text-ink text-ink leading-relaxed"
                )}
            >
                <CatalogProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                    <ScrollToTop />
                </CatalogProvider>
            </body>
        </html>
    );
}
