import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let initialized = false;

export function initFirebase(): void {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return;
  }

  // Prefer explicit service account file (best for local dev + Cloud Run)
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const resolved = path.isAbsolute(credPath)
      ? credPath
      : path.resolve(process.cwd(), credPath);

    if (fs.existsSync(resolved)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log(`[Firebase] Initialized with service account: ${resolved}`);
      initialized = true;
      return;
    }
    console.warn(`[Firebase] Service account file not found at: ${resolved}`);
  }

  // Fallback: Application Default Credentials (Cloud Run managed env)
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log('[Firebase] Initialized with Application Default Credentials.');
  initialized = true;
}

/**
 * Lazy getter — always returns the Firestore instance AFTER initFirebase() is called.
 * This avoids the "No app" crash when db is imported at module load time.
 */
export function getDb(): admin.firestore.Firestore {
  return admin.firestore();
}
