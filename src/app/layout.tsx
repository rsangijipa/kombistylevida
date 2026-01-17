import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/cn";
import { CatalogProvider } from "@/context/CatalogContext";

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

export const metadata: Metadata = {
    title: "Kombistyle Vida | Kombucha Artesanal",
    description: "Kombucha fermentada naturalmente, feita com ingredientes reais e carinho. Descubra o equilíbrio entre saúde e sabor.",
    keywords: ["kombucha", "fermentação natural", "probióticos", "saúde", "bem-estar", "bebida artesanal", "chá fermentado"],
    openGraph: {
        title: "Kombistyle Vida | Estilo e sabor em cada gole",
        description: "Kombucha artesanal de verdade. Fermentação lenta, ingredientes naturais e muita vida.",
        type: "website",
        locale: "pt_BR",
        // images: ["/images/og-image.jpg"], // TODO: Add OG Image later if available
    },
    twitter: {
        card: "summary_large_image",
        title: "Kombistyle Vida",
        description: "Kombucha artesanal fermentada naturalmente.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="scroll-smooth">
            <body
                className={cn(
                    serif.variable,
                    sans.variable,
                    "antialiased selection:bg-amber/30 selection:text-ink"
                )}
            >
                <CatalogProvider>
                    {children}
                </CatalogProvider>
            </body>
        </html>
    );
}
