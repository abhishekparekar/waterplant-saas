import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, getTenantCollection, getTenantDoc } from './firebase';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'jars' | 'parts' | 'accessories';
  quantity: number;
  unit: string;
  reorderLevel: number;
  updatedAt?: string;
}

export interface DispatchLog {
  id: string;
  type: 'load' | 'unload';
  driverName: string;
  vehicleNumber: string;
  quantity: number;
  notes?: string;
  timestamp: string;
}

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: '1', name: '20L Filled RO Water Jars', category: 'jars', quantity: 150, unit: 'jars', reorderLevel: 50 },
  { id: '2', name: '20L Empty Returned Jars', category: 'jars', quantity: 45, unit: 'jars', reorderLevel: 30 },
  { id: '3', name: 'Sanitized Blue Jar Caps', category: 'parts', quantity: 500, unit: 'caps', reorderLevel: 300 },
  { id: '4', name: 'Water Dispenser Units & Stands', category: 'accessories', quantity: 15, unit: 'units', reorderLevel: 10 }
];

export const inventoryService = {
  /**
   * Fetch all inventory items directly from Cloud Firestore.
   */
  async getAll(): Promise<InventoryItem[]> {
    try {
      const snap = await getDocs(getTenantCollection('inventory'));
      if (!snap.empty) {
        const items: InventoryItem[] = [];
        snap.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as InventoryItem);
        });
        return items.sort((a, b) => a.id.localeCompare(b.id));
      }

      // Seed initial defaults into Firestore if empty
      for (const item of DEFAULT_INVENTORY) {
        await setDoc(getTenantDoc('inventory', item.id), {
          ...item,
          updatedAt: new Date().toISOString()
        });
      }
      return DEFAULT_INVENTORY;
    } catch (err) {
      console.error('Firestore inventory fetch error:', err);
      return DEFAULT_INVENTORY;
    }
  },

  /**
   * Add a new product or inventory item to Cloud Firestore
   */
  async addItem(itemData: Omit<InventoryItem, 'id' | 'updatedAt'>): Promise<InventoryItem> {
    const now = new Date().toISOString();
    const docRef = await addDoc(getTenantCollection('inventory'), {
      ...itemData,
      updatedAt: now
    });
    return {
      id: docRef.id,
      ...itemData,
      updatedAt: now
    };
  },

  /**
   * Delete an item from Cloud Firestore
   */
  async deleteItem(id: string): Promise<void> {
    await deleteDoc(getTenantDoc('inventory', id));
  },

  /**
   * Update quantity directly in Cloud Firestore
   */
  async updateQuantity(id: string, quantity: number): Promise<void> {
    const itemRef = getTenantDoc('inventory', id);
    await updateDoc(itemRef, {
      quantity: Math.max(0, quantity),
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Adjust quantity by delta (+ or -) directly in Cloud Firestore
   */
  async adjustQuantity(id: string, delta: number): Promise<number> {
    const itemRef = getTenantDoc('inventory', id);
    const snap = await getDoc(itemRef);
    if (!snap.exists()) {
      const def = DEFAULT_INVENTORY.find(i => i.id === id) || {
        id,
        name: '20L Water Jars',
        category: 'jars' as const,
        quantity: 0,
        unit: 'jars',
        reorderLevel: 20
      };
      const newQty = Math.max(0, def.quantity + delta);
      await setDoc(itemRef, {
        ...def,
        quantity: newQty,
        updatedAt: new Date().toISOString()
      });
      return newQty;
    }

    const currentQty = snap.data().quantity || 0;
    const newQty = Math.max(0, currentQty + delta);
    await updateDoc(itemRef, {
      quantity: newQty,
      updatedAt: new Date().toISOString()
    });
    return newQty;
  },

  /**
   * Record a truck load / unload event and sync inventory
   */
  async recordDispatch(data: Omit<DispatchLog, 'id' | 'timestamp'>): Promise<DispatchLog> {
    const timestamp = new Date().toISOString();
    
    // Adjust inventory
    if (data.type === 'load') {
      // Deduct filled jars from plant
      await this.adjustQuantity('1', -data.quantity);
    } else {
      // Add empty returned jars to plant
      await this.adjustQuantity('2', data.quantity);
    }

    const docRef = await addDoc(getTenantCollection('dispatch_logs'), {
      ...data,
      timestamp
    });

    return {
      id: docRef.id,
      ...data,
      timestamp
    };
  },

  /**
   * Fetch recent dispatch and unloading activity logs
   */
  async getDispatchLogs(): Promise<DispatchLog[]> {
    try {
      const q = query(getTenantCollection('dispatch_logs'), orderBy('timestamp', 'desc'), limit(20));
      const snap = await getDocs(q);
      const logs: DispatchLog[] = [];
      snap.forEach((d) => {
        logs.push({ id: d.id, ...d.data() } as DispatchLog);
      });
      return logs;
    } catch (e) {
      try {
        const snap = await getDocs(getTenantCollection('dispatch_logs'));
        const logs: DispatchLog[] = [];
        snap.forEach((d) => {
          logs.push({ id: d.id, ...d.data() } as DispatchLog);
        });
        return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      } catch (err) {
        return [];
      }
    }
  }
};
