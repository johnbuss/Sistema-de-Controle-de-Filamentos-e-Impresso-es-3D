import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
      // Lê o arquivo de credenciais do caminho especificado
      const absolutePath = serviceAccountPath.startsWith('/')
        ? serviceAccountPath
        : join(process.cwd(), serviceAccountPath);

      const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback: tenta usar GOOGLE_APPLICATION_CREDENTIALS (padrão do Google Cloud)
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
}

// Configurar Firestore para ignorar valores undefined
const db = admin.firestore();
db.settings({
  ignoreUndefinedProperties: true,
});

export { db };
export default admin;
