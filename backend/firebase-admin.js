import admin from "firebase-admin";

// Inicializa Firebase Admin apenas uma vez
if (!admin.apps.length) {
  try {
    // Pega as credenciais da variável de ambiente
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin inicializado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase Admin:", error.message);
    throw new Error("Falha na inicialização do Firebase Admin. Verifique FIREBASE_SERVICE_ACCOUNT.");
  }
}

// Exporta a instância do Firestore
export const db = admin.firestore();

// Exporta o admin caso precise usar em outros lugares
export default admin;
