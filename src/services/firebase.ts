import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  // @ts-ignore
  getReactNativePersistence, 
  getAuth,
  Auth
} from 'firebase/auth';
import { getFirestore, collection, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(APP_CONFIG.firebase) : getApp();

// Initialize Firebase Auth with React Native AsyncStorage persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);

/**
 * Returns the active user mobile number.
 * Defaults to the plant owner primary mobile (8485877633) if not logged in.
 */
export const getUserMobile = (): string => {
  try {
    const { useAuthStore } = require('@/store/authStore');
    const user = useAuthStore.getState().user;
    if (user) {
      // If helper or customer, use support/owner phone if present, else their registered phone
      const phone = (user.role === 'helper' && user.supportPhone) 
        ? user.supportPhone 
        : (user.phoneNumber || user.supportPhone);
        
      if (phone) {
        const clean = phone.replace(/[^0-9]/g, '');
        if (clean.length >= 10) return clean.slice(-10);
        if (clean.length > 0) return clean;
      }
    }
  } catch (e) {}
  return '8485877633';
};

/**
 * Root document reference for the "waterplant" project under "tenants" collection
 * Path: tenants/waterplant
 */
export const getWaterPlantProjectDocRef = () => doc(db, 'tenants', 'waterplant');

/**
 * Document reference for the user mobile node under waterplant project
 * Path: tenants/waterplant/users/<userMobile>
 */
export const getUserMobileDocRef = (mobile?: string) => {
  const m = mobile || getUserMobile();
  return doc(db, 'tenants', 'waterplant', 'users', m);
};

/**
 * Tenant-scoped subcollection reference saved under the user mobile node
 * Path: tenants/waterplant/users/<userMobile>/<subcollectionName>
 */
export const getTenantCollection = (subcollectionName: string, mobile?: string) => {
  const m = mobile || getUserMobile();
  return collection(db, 'tenants', 'waterplant', 'users', m, subcollectionName);
};

/**
 * Tenant-scoped document reference saved under the user mobile node
 * Path: tenants/waterplant/users/<userMobile>/<subcollectionName>/<docId>
 */
export const getTenantDoc = (subcollectionName: string, docId: string, mobile?: string) => {
  const m = mobile || getUserMobile();
  return doc(db, 'tenants', 'waterplant', 'users', m, subcollectionName, docId);
};

// Backward-compatible alias
export const getTenantDocRef = getUserMobileDocRef;

export { app, auth, db };
export default app;
