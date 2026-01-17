import admin from "firebase-admin";
import fs from "node:fs";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountPath) {
    console.error("Defina FIREBASE_SERVICE_ACCOUNT_JSON apontando para o JSON da service account.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];
if (!uid) {
    console.error("Uso: node scripts/set-admin.mjs <UID>");
    process.exit(1);
}

await admin.auth().setCustomUserClaims(uid, { role: "admin" });
console.log("OK: role=admin aplicada ao UID:", uid);
process.exit(0);
