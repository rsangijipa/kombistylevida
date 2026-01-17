import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Recipe } from "@/types/firestore";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

async function getRecipes() {
    // In a real server component we can't use the client SDK directly if not configured for edge/node
    // But this project uses client SDK for everything currently. 
    // We should enable "use client" or verify if we have admin SDK.
    // Given the context, let's make this a Client Component for simplicity or use the existing client lib.
    // Actually, allowing Server Components to fetch from Firestore requires Admin SDK or fetch('https://firestore...')
    // For consistency with the rest of this P1/P2/P3 migration which is Client-heavy for now (due to AuthContext):
    // We will make this "use client" for now or simulate server fetch?
    // Let's stick to "use client" for safety unless we are sure about SSR setup.
    // However, for SEO (Content Commerce), SSR is better.
    // Let's try to do it right: Client Component that fetches on mount, OR Server Component with mock data / proper fetch.
    // The user said "Frontend Público" - let's make it a nice static-like page.

    // Changing strategy: Client Component for now to avoid build issues with missing Admin SDK keys on server.
    return [];
}

export default async function RecipesPage() {
    // Since we don't have Server Admin SDK setup confirmed in this chat context, 
    // I will write this as a CLIENT component to fetch data.
    // Wait, I can't write "use client" on an async component.
    // I'll create a Client Wrapper or just make the page client side.
    return <RecipesList />;
}

// Sub-component in same file for simplicity
import RecipesList from "./RecipesList";
