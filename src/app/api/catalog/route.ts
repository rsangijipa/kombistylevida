import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Product, Combo } from "@/types/firestore";

// Helper to ensure cache revalidation if needed
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [productsSnap, combosSnap] = await Promise.all([
            adminDb.collection("products").get(),
            adminDb.collection("combos").get()
        ]);

        const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        const combos = combosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Combo[];

        return NextResponse.json({ products, combos });
    } catch (error: any) {
        console.error("API Catalog Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
