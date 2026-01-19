import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { Product, Combo } from "@/types/firestore";
import { PRODUCTS, BUNDLES } from "@/data/catalog";

const COLLECTION = "products";

// Client-side fetch via API Proxy to avoid permission/DB-ID issues
export async function getCatalog(): Promise<{ products: Product[]; combos: Combo[] }> {
    const res = await fetch('/api/catalog');
    if (!res.ok) throw new Error("Failed to fetch catalog");
    return res.json();
}

export async function saveProduct(product: Product) {
    await setDoc(doc(db, COLLECTION, product.id), {
        ...product,
        updatedAt: new Date().toISOString()
    }, { merge: true });
}

export async function toggleProductActive(productId: string, active: boolean) {
    await updateDoc(doc(db, COLLECTION, productId), {
        active,
        updatedAt: new Date().toISOString()
    });
}

/**
 * Seeds the database with the static catalog if empty or forced.
 */
export async function seedCatalog() {
    const promises = PRODUCTS.map(p => {
        const productData = {
            ...p,
            priceCents: p.priceCents || 0,
            active: true,
            updatedAt: new Date().toISOString()
        } as Product;
        return setDoc(doc(db, COLLECTION, p.id), productData, { merge: true });
    });
    await Promise.all(promises);
}
