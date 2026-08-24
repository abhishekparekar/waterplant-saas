// Firebase Architecture & Client Configuration for Water Plant Management SaaS
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { 
  Customer, 
  Delivery, 
  BottleLedger, 
  StockLedger, 
  ProductionRecord, 
  Payment, 
  Order, 
  Tenant, 
  SubscriptionPlan,
  SubscriptionDuration,
  SubscriptionRecord 
} from '../types';

// Default Firebase Configuration (can be populated via environment variables or runtime settings)
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
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('Dummy')
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
  console.warn("Firebase initialized with local fallback:", err);
}

export { app, db, auth, storage };

/**
 * FIRESTORE MULTI-TENANT BACKEND SERVICES
 * Each tenant's data is strictly partitioned under: /tenants/{tenantId}/[subcollection]
 */

export const FirestoreTenantService = {
  /**
   * Fetch tenant profile and subscription metadata
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    const firestore = db;
    if (!firestore) return null;
    try {
      const docRef = doc(firestore, 'tenants', tenantId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? (snapshot.data() as Tenant) : null;
    } catch (err) {
      console.error('Error fetching tenant from Firestore:', err);
      return null;
    }
  },

  /**
   * Save or update tenant subscription and profile details
   */
  async updateSubscription(
    tenantId: string, 
    plan: SubscriptionPlan, 
    durationMonths: SubscriptionDuration,
    subscriptionRecord: SubscriptionRecord
  ): Promise<boolean> {
    const firestore = db;
    if (!firestore) return false;
    try {
      const tenantRef = doc(firestore, 'tenants', tenantId);
      const subRecordRef = doc(firestore, `tenants/${tenantId}/subscriptions`, subscriptionRecord.id);

      await runTransaction(firestore, async (transaction) => {
        transaction.update(tenantRef, {
          plan,
          subscriptionStatus: 'ACTIVE',
          subscriptionDuration: durationMonths,
          subscriptionExpiryDate: subscriptionRecord.expiryDate,
          updatedAt: serverTimestamp()
        });
        transaction.set(subRecordRef, {
          ...subscriptionRecord,
          createdAt: serverTimestamp()
        });
      });
      return true;
    } catch (err) {
      console.error('Error updating subscription in Firestore:', err);
      return false;
    }
  }
};

export const FirestoreCustomerService = {
  /**
   * Realtime listener for customers within tenant
   */
  subscribeCustomers(tenantId: string, callback: (customers: Customer[]) => void) {
    const firestore = db;
    if (!firestore) return () => {};
    const q = query(
      collection(firestore, `tenants/${tenantId}/customers`),
      orderBy('name', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const custs: Customer[] = [];
      snapshot.forEach(docSnap => custs.push(docSnap.data() as Customer));
      callback(custs);
    }, (error) => {
      console.warn('Firestore customer subscribe warning (local mode active):', error.message);
    });
  },

  /**
   * Add or update customer in Firestore
   */
  async saveCustomer(tenantId: string, customer: Customer): Promise<boolean> {
    const firestore = db;
    if (!firestore) return false;
    try {
      await setDoc(doc(firestore, `tenants/${tenantId}/customers`, customer.id), {
        ...customer,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving customer to Firestore:', err);
      return false;
    }
  }
};

export const FirestoreDeliveryService = {
  /**
   * Realtime listener for active deliveries
   */
  subscribeDeliveries(tenantId: string, callback: (deliveries: Delivery[]) => void) {
    const firestore = db;
    if (!firestore) return () => {};
    const q = query(
      collection(firestore, `tenants/${tenantId}/deliveries`),
      orderBy('deliveryDate', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const dels: Delivery[] = [];
      snapshot.forEach(docSnap => dels.push(docSnap.data() as Delivery));
      callback(dels);
    }, (error) => {
      console.warn('Firestore deliveries subscribe warning:', error.message);
    });
  },

  /**
   * Atomic Delivery Completion Transaction in Firestore:
   * 1. Updates delivery record with quantity, empties, payments, signature
   * 2. Updates customer bottle balance and outstanding ledger
   * 3. Appends bottle ledger history
   * 4. Deducts filled stock & adds empty jars
   */
  async completeDeliveryTransaction(
    tenantId: string,
    delivery: Delivery,
    deliveredQty: number,
    collectedBottles: number,
    collectedAmount: number,
    bottleLedgerEntries: BottleLedger[],
    stockLedgerEntry: StockLedger,
    paymentEntry?: Payment
  ): Promise<boolean> {
    const firestore = db;
    if (!firestore) return false;
    try {
      const deliveryRef = doc(firestore, `tenants/${tenantId}/deliveries`, delivery.id);
      const customerRef = doc(firestore, `tenants/${tenantId}/customers`, delivery.customerId);

      await runTransaction(firestore, async (transaction) => {
        // 1. Delivery update
        transaction.update(deliveryRef, {
          status: deliveredQty < delivery.orderedQuantity ? 'Partially Delivered' : 'Delivered',
          deliveredQuantity: deliveredQty,
          collectedEmptyBottles: collectedBottles,
          collectedAmount,
          completedAt: serverTimestamp()
        });

        // 2. Customer balance update
        const custSnap = await transaction.get(customerRef);
        if (custSnap.exists()) {
          const currentData = custSnap.data() as Customer;
          const bottleDiff = deliveredQty - collectedBottles;
          const unpaid = (deliveredQty * (delivery.items[0]?.unitPrice || 35)) - collectedAmount;
          transaction.update(customerRef, {
            bottleBalance: Math.max(0, currentData.bottleBalance + bottleDiff),
            outstandingBalance: Math.max(0, currentData.outstandingBalance + unpaid),
            totalPaidAmount: currentData.totalPaidAmount + collectedAmount,
            updatedAt: serverTimestamp()
          });
        }

        // 3. Bottle Ledger
        bottleLedgerEntries.forEach(entry => {
          const entryRef = doc(firestore, `tenants/${tenantId}/bottleLedger`, entry.id);
          transaction.set(entryRef, { ...entry, timestamp: serverTimestamp() });
        });

        // 4. Stock Ledger
        const stockRef = doc(firestore, `tenants/${tenantId}/stockLedger`, stockLedgerEntry.id);
        transaction.set(stockRef, { ...stockLedgerEntry, timestamp: serverTimestamp() });

        // 5. Payment record
        if (paymentEntry && collectedAmount > 0) {
          const paymentRef = doc(firestore, `tenants/${tenantId}/payments`, paymentEntry.id);
          transaction.set(paymentRef, { ...paymentEntry, createdAt: serverTimestamp() });
        }
      });
      return true;
    } catch (err) {
      console.error('Error executing delivery transaction in Firestore:', err);
      return false;
    }
  }
};

/**
 * PRODUCTION-GRADE FIRESTORE SECURITY RULES
 * Copy this into your Firebase Console -> Firestore Database -> Rules tab:
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


