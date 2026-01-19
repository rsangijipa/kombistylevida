import "server-only";

import { initializeApp, getApps, getApp, App, cert } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// --- Configuration ---
const FIREBASE_ADMIN_PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID;
const FIREBASE_ADMIN_CLIENT_EMAIL = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// Decode Base64 Private Key
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
    : process.env.FIREBASE_ADMIN_PRIVATE_KEY;

// Fallback: Handle legacy newline normalization if not base64
if (privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
}
const FIREBASE_ADMIN_PRIVATE_KEY = privateKey;



if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Missing Firebase Admin Environment Variables in Production!");
    } else {
        console.warn("⚠️ Missing Admin Env Vars. Admin SDK functionality will fail.");
    }
}
// The service account is now loaded from a JSON file, so these environment variables are no longer needed.
// const FIREBASE_ADMIN_PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID;
// const FIREBASE_ADMIN_CLIENT_EMAIL = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// // Decode Base64 Private Key
// let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64
//     ? Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
//     : process.env.FIREBASE_ADMIN_PRIVATE_KEY;

// // Fallback: Handle legacy newline normalization if not base64
// if (privateKey) {
//     if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
//         privateKey = privateKey.slice(1, -1);
//     }
//     privateKey = privateKey.replace(/\\n/g, "\n");
// }
// const FIREBASE_ADMIN_PRIVATE_KEY = privateKey;



if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Missing Firebase Admin Environment Variables in Production!");
    } else {
        console.warn("⚠️ Missing Admin Env Vars. Admin SDK functionality will fail.");
    }
}

// --- Singleton Initialization ---
let adminApp: App;

if (getApps().length === 0) {
    const serviceAccountPath = process.cwd() + '/planar-outlook-final-creds.json';

    // DEBUG: Log Credential Details
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const creds = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log("----------------------------------------------------------------");
        console.log("🔥 FIREBASE ADMIN INIT");
        console.log(`🔹 Project ID:   ${creds.project_id}`);
        console.log(`🔹 Client Email: ${creds.client_email}`);
        console.log(`🔹 Creds File:   ${serviceAccountPath}`);
        console.log(`🔹 Database ID:  kombuchaarike (Explicit)`);
        console.log("----------------------------------------------------------------");
    } catch (err) {
        console.warn("⚠️ Failed to read creds file for debug logging:", err);
    }

    try {
        adminApp = initializeApp({
            credential: cert(serviceAccountPath)
        });
    } catch (error: any) {
        if (error.code === 'app/already-exists') {
            adminApp = getApp();
        } else {
            console.error("FATAL: Firebase Admin Init Failed", error);
            throw error;
        }
    }
} else {
    adminApp = getApp();
}

// Initialize specific database
export const adminDb: Firestore = getFirestore(adminApp, "kombuchaarike");
export const adminAuth: Auth = getAuth(adminApp);
export { adminApp };
