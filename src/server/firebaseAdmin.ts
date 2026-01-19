import "server-only";
import type { Firestore } from "firebase-admin/firestore";

let adminDbInstance: Firestore | null = null;

export async function getAdminDb(): Promise<Firestore | null> {
    if (adminDbInstance) return adminDbInstance;

    try {
        const { getApps, initializeApp, cert } = await import("firebase-admin/app");
        const { getFirestore } = await import("firebase-admin/firestore");

        // Helper
        const formatPrivateKey = (key: string) => key.replace(/\\n/g, "\n");

        if (getApps().length === 0) {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
            const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

            if (projectId && clientEmail && privateKey) {
                // Production
                const serviceAccount = {
                    projectId,
                    clientEmail,
                    privateKey: formatPrivateKey(privateKey),
                };
                initializeApp({
                    credential: cert(serviceAccount),
                    projectId
                });
            } else {
                // Dev Fallback
                try {
                    const { applicationDefault } = await import("firebase-admin/app");
                    initializeApp({
                        credential: applicationDefault(),
                        projectId: projectId
                    });
                } catch (e) {
                    console.warn("⚠️ Firebase Admin: Login failed (no creds).");
                    return null;
                }
            }
        } else {
            // App already initialized
        }

        // Get DB (safe to call even if getApps() > 0)
        // using default app
        adminDbInstance = getFirestore();

        // Emulator
        if (process.env.FIRESTORE_EMULATOR_HOST) {
            adminDbInstance.settings({
                host: process.env.FIRESTORE_EMULATOR_HOST,
                ssl: false
            });
            console.log(`🔥 Admin SDK connected to Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
        }

        return adminDbInstance;
    } catch (e) {
        console.error("Firebase Admin Init Failed:", e);
        return null;
    }
}
