import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db, getTenantCollection, getTenantDoc } from './firebase';
import { Order, OrderStatus } from '@/types/order';

const COLLECTION_NAME = 'orders';

export const orderService = {
  /**
   * Fetch all orders
   */
  async getAll(): Promise<Order[]> {
    const q = query(getTenantCollection(COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
  },

  /**
   * Get single order by id
   */
  async getById(id: string): Promise<Order | null> {
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  },

  /**
   * Get orders assigned to a specific helper
   */
  async getByHelper(helperId: string): Promise<Order[]> {
    const q = query(
      getTenantCollection(COLLECTION_NAME), 
      where('assignedHelperId', '==', helperId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
  },

  /**
   * Get orders by customer
   */
  async getByCustomer(customerId: string): Promise<Order[]> {
    const q = query(
      getTenantCollection(COLLECTION_NAME), 
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
  },

  /**
   * Create new order and auto-generate delivery run if helper is assigned
   */
  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const now = new Date().toISOString();
    const docRef = await addDoc(getTenantCollection(COLLECTION_NAME), {
      ...orderData,
      createdAt: now,
      updatedAt: now
    });
    
    // Auto-create delivery run if helper is assigned
    if (orderData.assignedHelperName) {
      await addDoc(getTenantCollection('deliveries'), {
        orderId: docRef.id,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        helperId: orderData.assignedHelperId || 'default-helper-id',
        helperName: orderData.assignedHelperName,
        status: 'pending',
        scheduledDate: orderData.deliveryDate || now,
        bottlesDelivered: orderData.items[0]?.quantity || 1,
        emptyBottlesReturned: 0,
        cashCollected: 0,
        notes: orderData.notes,
        createdAt: now,
        updatedAt: now
      });
    }

    return {
      id: docRef.id,
      ...orderData,
      createdAt: now,
      updatedAt: now
    };
  },

  /**
   * Update order status or assigned helper
   */
  async updateStatus(id: string, status: OrderStatus, extraUpdates?: Partial<Order>): Promise<void> {
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      ...extraUpdates,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Assign driver to an order
   */
  async assignHelper(id: string, helperId: string, helperName: string): Promise<void> {
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    await updateDoc(docRef, {
      assignedHelperId: helperId,
      assignedHelperName: helperName,
      status: 'assigned',
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Update generic order fields
   */
  async update(id: string, updates: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Delete order
   */
  async delete(id: string): Promise<void> {
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
