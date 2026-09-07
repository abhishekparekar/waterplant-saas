import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, getTenantCollection, getTenantDoc } from './firebase';
import { Customer } from '@/types/customer';

const COLLECTION_NAME = 'customers';

// Helper to remove any undefined fields before Firestore operations
const sanitizeData = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean as Partial<T>;
};

export const customerService = {
  /**
   * Fetch all customers ordered by name directly from Cloud Firestore
   */
  async getAll(): Promise<Customer[]> {
    try {
      const q = query(getTenantCollection(COLLECTION_NAME), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const customers: Customer[] = [];
      querySnapshot.forEach((docSnap) => {
        customers.push({ id: docSnap.id, ...docSnap.data() } as Customer);
      });
      return customers;
    } catch (err: any) {
      // Fallback query without orderBy if index is still building in Firestore
      try {
        const querySnapshot = await getDocs(getTenantCollection(COLLECTION_NAME));
        const customers: Customer[] = [];
        querySnapshot.forEach((docSnap) => {
          customers.push({ id: docSnap.id, ...docSnap.data() } as Customer);
        });
        return customers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } catch (fallbackErr: any) {
        console.error('Firestore customer fetch failed:', fallbackErr);
        throw fallbackErr;
      }
    }
  },

  /**
   * Get single customer by id directly from Cloud Firestore
   */
  async getById(id: string): Promise<Customer | null> {
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
  },

  /**
   * Create a new customer record directly in Cloud Firestore
   */
  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const now = new Date().toISOString();
    const cleanPayload = sanitizeData({
      ...customerData,
      createdAt: now,
      updatedAt: now
    });

    const docRef = await addDoc(getTenantCollection(COLLECTION_NAME), cleanPayload);

    return {
      id: docRef.id,
      ...customerData,
      createdAt: now,
      updatedAt: now
    };
  },

  /**
   * Update existing customer directly in Cloud Firestore
   */
  async update(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const now = new Date().toISOString();
    const cleanUpdates = sanitizeData({
      ...updates,
      updatedAt: now
    });

    const docRef = getTenantDoc(COLLECTION_NAME, id);
    await updateDoc(docRef, cleanUpdates);
  },

  /**
   * Delete customer directly in Cloud Firestore
   */
  async delete(id: string): Promise<void> {
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
