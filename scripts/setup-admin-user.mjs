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

const EMAIL = "admin@kombucha.com";
const PASSWORD = "kombuchaarike2026";

async function main() {
    let user;
    try {
        user = await admin.auth().getUserByEmail(EMAIL);
        console.log(`Usuário ${EMAIL} já existe (UID: ${user.uid}).`);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.log(`Criando usuário ${EMAIL}...`);
            user = await admin.auth().createUser({
                email: EMAIL,
                password: PASSWORD,
                emailVerified: true
            });
            console.log(`Usuário criado com sucesso (UID: ${user.uid}).`);
        } else {
            console.error("Erro ao verificar usuário:", e);
            process.exit(1);
        }
    }

    console.log(`Atribuindo role='admin' para ${EMAIL}...`);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    console.log("Sucesso! O usuário agora é Admin.");
    process.exit(0);
}

main();
