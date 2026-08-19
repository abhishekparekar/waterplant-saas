// Firebase Architecture & Client Configuration for Water Plant Management SaaS
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Default Firebase Configuration (can be populated via environment variables or settings)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyWaterPlantKey_991823",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "water-plant-saas-prod.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "water-plant-saas-prod",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "water-plant-saas-prod.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "882910394857",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:882910394857:web:910bf837920ab",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (err) {
  console.warn("Firebase initialized in demo/local mode:", err);
}

export { app, db, auth, storage };

/**
 * FIRESTORE SECURITY RULES (Production Grade - Multi-Tenant Isolation):
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     
 *     function isAuthenticated() {
 *       return request.auth != null;
 *     }
 *     
 *     function isTenantUser(tenantId) {
 *       return isAuthenticated() && 
 *         request.auth.token.tenantId == tenantId;
 *     }
 *     
 *     function isOwnerOrManager(tenantId) {
 *       return isTenantUser(tenantId) && 
 *         (request.auth.token.role == 'owner' || request.auth.token.role == 'manager');
 *     }
 *     
 *     match /tenants/{tenantId} {
 *       allow read: if isTenantUser(tenantId);
 *       allow write: if isTenantUser(tenantId) && request.auth.token.role == 'owner';
 *       
 *       match /{collectionName}/{docId} {
 *         allow read: if isTenantUser(tenantId);
 *         allow write: if isOwnerOrManager(tenantId) || 
 *           (request.auth.token.role == 'delivery' && collectionName in ['deliveries', 'bottleLedger', 'payments']);
 *       }
 *     }
 *     
 *     match /users/{userId} {
 *       allow read: if isAuthenticated();
 *       allow write: if request.auth.uid == userId;
 *     }
 *   }
 * }
 */
