import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { Product } from "@/types/firestore";
import { PRODUCTS } from "@/data/catalog";

const COLLECTION = "products";

export async function getAllProducts(): Promise<Product[]> {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map(d => d.data() as Product);
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
        const productData: Product = {
            ...p,
            priceCents: p.priceCents || 0, // Ensure required
            active: true,
            updatedAt: new Date().toISOString()
        };
        return setDoc(doc(db, COLLECTION, p.id), productData, { merge: true });
    });
    await Promise.all(promises);
}
