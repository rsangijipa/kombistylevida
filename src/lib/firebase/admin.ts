import "server-only";

import { initializeApp, getApps, getApp, App, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from 'fs';
import path from 'path';

/**
 * FIREBASE ADMIN SDK INITIALIZATION (Lazy & Build-Safe)
 * 
 * This file is designed to be imported anywhere without crashing the build.
 * Initialization happens only on the first access to adminDb or adminAuth.
 */

function getAdminConfig(): ServiceAccount | string | null {
    // 1. Check for Environment Variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64
        ? Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
        : process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (privateKey) {
        // Handle "double quote wrapper" from some copy-pastes
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        // Robust replacement: Handle literal "\n" (two chars) -> real newline
        // but preserve real newlines if they already exist
        // And don't break if it's already correct.
        if (privateKey.includes("\\n")) {
            privateKey = privateKey.replace(/\\n/g, "\n");
        }
    }

    if (projectId && clientEmail && privateKey) {
        return {
            projectId,
            clientEmail,
            privateKey
        };
    }

    // 2. Check for JSON file fallback (mostly local)
    const jsonPath = path.join(process.cwd(), 'planar-outlook-final-creds.json');
    if (fs.existsSync(jsonPath)) {
        return jsonPath;
    }

    return null;
}

function initAdmin(): App {
    if (getApps().length > 0) return getApp();

    const config = getAdminConfig();

    if (!config && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== 'phase-production-build') {
        console.error("❌ Firebase Admin Configuration Missing! Database operations will fail.");
    } else if (process.env.NODE_ENV === "production") {
        console.log(`✅ Firebase Admin Initializing. Project: ${(config as any)?.projectId || 'N/A'}, Strategy: ${typeof config === 'string' ? 'File' : 'Env'}`);
    }

    try {
        return initializeApp({
            credential: config ? cert(config) : undefined,
        });
    } catch (error) {
        if ((error as any).code === 'app/already-exists') {
            return getApp();
        }
        console.error("FATAL: Firebase Admin Init Failed", error);
        throw error;
    }
}

// Proxied exports to avoid top-level execution crashes during build
// These will only trigger initAdmin() when a property is accessed.

/* eslint-disable @typescript-eslint/no-explicit-any */
export const adminDb: Firestore = new Proxy({} as Firestore, {
    get(target, prop, receiver) {
        const app = initAdmin();
        const db = getFirestore(app, "kombuchaarike");
        const value = (db as any)[prop];
        return typeof value === 'function' ? value.bind(db) : value;
    }
});

export const adminAuth: Auth = new Proxy({} as Auth, {
    get(target, prop, receiver) {
        const app = initAdmin();
        const auth = getAuth(app);
        const value = (auth as any)[prop];
        return typeof value === 'function' ? value.bind(auth) : value;
    }
});

export const adminApp = new Proxy({} as App, {
    get(target, prop, receiver) {
        const app = initAdmin();
        return (app as any)[prop];
    }
});
/* eslint-enable @typescript-eslint/no-explicit-any */
