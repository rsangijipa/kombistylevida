import { db } from "@/lib/firebase";
import { Post, Testimonial, AuditLog } from "@/types/firestore";
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where, addDoc } from "firebase/firestore";

// --- HELPERS ---

function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

// --- POSTS ---

// export async function getAllPosts(status?: 'PUBLISHED' | 'DRAFT'): Promise<Post[]> {
//     const postsCol = collection(db, "posts");
//     let q = query(postsCol, orderBy("updatedAt", "desc"));
// 
//     if (status === 'PUBLISHED') {
//         q = query(postsCol, where("status", "==", "PUBLISHED"), orderBy("publishedAt", "desc"));
//     } else if (status === 'DRAFT') {
//         q = query(postsCol, where("status", "==", "DRAFT"), orderBy("updatedAt", "desc"));
//     }
// 
//     const snap = await getDocs(q);
//     return snap.docs.map(d => d.data() as Post);
// }

// export async function getPostBySlug(slug: string): Promise<Post | null> {
//     const docRef = doc(db, "posts", slug);
//     const snap = await getDoc(docRef);
//     if (!snap.exists()) return null;
//     return snap.data() as Post;
// }

export async function savePost(post: Post, actorUid: string) {
    const ref = doc(db, "posts", post.slug);

    // Calculate reading time
    post.readingTimeMinutes = calculateReadingTime(post.content);
    post.updatedAt = new Date().toISOString();

    const snap = await getDoc(ref);
    const exists = snap.exists();

    await setDoc(ref, post, { merge: true });

    // Audit Log
    await logAction({
        actorUid,
        actorRole: 'content',
        action: exists ? 'POST_UPDATE' : 'POST_CREATE',
        entity: 'posts',
        entityId: post.slug,
        after: { title: post.title, status: post.status }
    });
}

export async function deletePost(slug: string, actorUid: string) {
    await deleteDoc(doc(db, "posts", slug));
    await logAction({
        actorUid,
        actorRole: 'content',
        action: 'POST_DELETE',
        entity: 'posts',
        entityId: slug
    });
}

// --- TESTIMONIALS ---

// Testimonials migrated to /api/admin/testimonials

// --- AUDIT ---

async function logAction(data: Omit<AuditLog, "id" | "createdAt">) {
    try {
        await addDoc(collection(db, "auditLogs"), {
            ...data,
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Failed to audit log", e);
    }
}
