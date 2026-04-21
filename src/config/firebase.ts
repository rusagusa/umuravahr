import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let db: admin.firestore.Firestore | null = null;
let isFirebaseActive = false;
let initialized = false;

export function initFirebase() {
  if (initialized) return { db, isFirebaseActive };

  try {
    // Cloud Run sets K_SERVICE; also works in Cloud Functions (FUNCTION_NAME).
    // In both cases, we use Application Default Credentials (ADC) which are
    // automatically provided by the attached service account — no key file needed.
    const isCloudEnv = !!(process.env.K_SERVICE || process.env.FUNCTION_NAME || process.env.FUNCTIONS_EMULATOR);

    if (isCloudEnv) {
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      db = admin.firestore();
      isFirebaseActive = true;
      console.log('✅ Firebase Admin initialized with Application Default Credentials (Cloud env).');
    } else {
      // Local dev: try to load serviceAccountKey.json from known locations
      const candidates = [
        path.resolve(process.cwd(), 'serviceAccountKey.json'),
        path.resolve(process.cwd(), '..', 'serviceAccountKey.json'),
        path.resolve(__dirname, '..', '..', 'serviceAccountKey.json'),
      ];
      const serviceAccountPath = candidates.find(p => fs.existsSync(p));

      if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        if (!admin.apps.length) {
          admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        }
        db = admin.firestore();
        isFirebaseActive = true;
        console.log(`✅ Firebase Admin initialized with Service Account from: ${serviceAccountPath}`);
      } else {
        console.warn('⚠️  No serviceAccountKey.json found and not in cloud environment. Falling back to in-memory DataStore.');
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
  }

  initialized = true;
  return { db, isFirebaseActive };
}

/**
 * Returns the Firebase Firestore instance, initializing lazily if needed.
 */
export function getFirebase() {
  return initFirebase();
}

export { db, isFirebaseActive };
