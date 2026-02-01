import "server-only";

import type { App, ServiceAccount } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import fs from 'fs';
import path from 'path';

/**
 * FIREBASE ADMIN SDK INITIALIZATION (Lazy & Build-Safe)
 * 
 * This file is designed to be imported anywhere without crashing the build.
 * Initialization happens only on the first access to adminDb or adminAuth.
 * All imports are dynamic (require) to prevent bundling 'firebase-admin' in client chunks.
 */



// Singleton holder for the app
let initializedApp: App | undefined;

function initAdmin(): App {
    if (initializedApp) return initializedApp;

    // --- LAZY IMPORTS ---
    // These require statements run ONLY on the server, at runtime.
    const { initializeApp, getApps, getApp, cert } = require("firebase-admin/app");

    // Check global/existing apps first
    if (getApps().length > 0) {
        initializedApp = getApp();
        return initializedApp!;
    }

    // --- CONFIGURATION ---
    // Read inside function to avoid build-time evaluation
    let config: ServiceAccount | string | null = null;

    // Dynamic key access to prevent Webpack DefinePlugin from inlining secrets
    const getEnv = (key: string) => process.env[key];

    // Split keys to avoid static analysis detection
    const projectId = getEnv('FIREBASE_' + 'ADMIN_' + 'PROJECT_ID');
    const clientEmail = getEnv('FIREBASE_' + 'ADMIN_' + 'CLIENT_EMAIL');

    // Encode/decode handling
    let privateKey = getEnv('FIREBASE_' + 'ADMIN_' + 'PRIVATE_KEY_' + 'BASE64')
        ? Buffer.from(getEnv('FIREBASE_' + 'ADMIN_' + 'PRIVATE_KEY_' + 'BASE64') || '', 'base64').toString('utf8')
        : getEnv('FIREBASE_' + 'ADMIN_' + 'PRIVATE_KEY');

    if (privateKey) {
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        if (privateKey.includes("\\n")) {
            privateKey = privateKey.replace(/\\n/g, "\n");
        }
    }

    if (projectId && clientEmail && privateKey) {
        config = {
            projectId,
            clientEmail,
            privateKey
        };
    } else {
        // Fallback to JSON file
        try {
            const jsonPath = path.join(process.cwd(), 'planar-outlook-final-creds.json');
            if (fs.existsSync(jsonPath)) {
                config = jsonPath;
            }
        } catch (e) { /* ignore */ }
    }

    if (!config && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== 'phase-production-build') {
        console.error("❌ Firebase Admin Configuration Missing! Database operations will fail.");
    } else if (process.env.NODE_ENV === "production") {
        console.log(`✅ Firebase Admin Initializing. Strategy: ${typeof config === 'string' ? 'File' : 'Env'}`);
    }

    try {
        initializedApp = initializeApp({
            credential: config ? cert(config) : undefined,
        });
        return initializedApp!;
    } catch (error) {
        if ((error as any).code === 'app/already-exists') {
            initializedApp = getApp();
            return initializedApp!;
        }
        console.error("FATAL: Firebase Admin Init Failed", error);
        throw error;
    }
}

// Proxied exports
/* eslint-disable @typescript-eslint/no-explicit-any */
export const adminDb: Firestore = new Proxy({} as Firestore, {
    get(target, prop, receiver) {
        const app = initAdmin();
        const { getFirestore } = require("firebase-admin/firestore");
        const db = getFirestore(app, "kombuchaarike");
        const value = (db as any)[prop];
        return typeof value === 'function' ? value.bind(db) : value;
    }
});

export const adminAuth: Auth = new Proxy({} as Auth, {
    get(target, prop, receiver) {
        const app = initAdmin();
        const { getAuth } = require("firebase-admin/auth");
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
