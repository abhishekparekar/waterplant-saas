import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  runTransaction,
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db, getTenantCollection, getTenantDoc } from './firebase';
import { Delivery, DeliveryStatus } from '@/types/delivery';

const COLLECTION_NAME = 'deliveries';

export const deliveryService = {
  /**
   * Fetch all deliveries
   */
  async getAll(): Promise<Delivery[]> {
    const q = query(getTenantCollection(COLLECTION_NAME), orderBy('scheduledDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const deliveries: Delivery[] = [];
    querySnapshot.forEach((doc) => {
      deliveries.push({ id: doc.id, ...doc.data() } as Delivery);
    });
    return deliveries;
  },

  /**
   * Get deliveries for a specific helper
   */
  async getByHelper(helperId: string): Promise<Delivery[]> {
    const q = query(
      getTenantCollection(COLLECTION_NAME),
      where('helperId', '==', helperId),
      orderBy('scheduledDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const deliveries: Delivery[] = [];
    querySnapshot.forEach((doc) => {
      deliveries.push({ id: doc.id, ...doc.data() } as Delivery);
    });
    return deliveries;
  },

  /**
   * Create new delivery run
   */
  async create(deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Delivery> {
    const now = new Date().toISOString();
    const docRef = await addDoc(getTenantCollection(COLLECTION_NAME), {
      ...deliveryData,
      createdAt: now,
      updatedAt: now
    });
    return {
      id: docRef.id,
      ...deliveryData,
      createdAt: now,
      updatedAt: now
    };
  },

  /**
   * Complete or update delivery details transactionally
   */
  async updateStatus(
    id: string, 
    status: DeliveryStatus, 
    updates?: Partial<Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const now = new Date().toISOString();
    
    // If not completing, do a simple update
    if (status !== 'completed') {
      const docRef = getTenantDoc(COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status,
        ...updates,
        updatedAt: now
      });
      return;
    }

    // Run complete transactional workflow
    const deliveryDocRef = getTenantDoc(COLLECTION_NAME, id);

    await runTransaction(db, async (transaction) => {
      // 1. Fetch delivery snapshot
      const deliverySnap = await transaction.get(deliveryDocRef);
      if (!deliverySnap.exists()) {
        throw new Error('Delivery run record not found.');
      }
      const deliveryData = deliverySnap.data() as Omit<Delivery, 'id'>;

      const orderId = deliveryData.orderId;
      const customerId = deliveryData.customerId;

      const orderDocRef = getTenantDoc('orders', orderId);
      const customerDocRef = getTenantDoc('customers', customerId);
      const filledInvDocRef = getTenantDoc('inventory', '1'); // filled bottles
      const emptyInvDocRef = getTenantDoc('inventory', '2'); // empty bottles

      // 2. Fetch associated documents (reads must happen before writes)
      const orderSnap = await transaction.get(orderDocRef);
      const customerSnap = await transaction.get(customerDocRef);
      const filledInvSnap = await transaction.get(filledInvDocRef);
      const emptyInvSnap = await transaction.get(emptyInvDocRef);

      if (!orderSnap.exists()) {
        throw new Error('Associated order record not found.');
      }
      if (!customerSnap.exists()) {
        throw new Error('Associated customer record not found.');
      }

      const orderTotal = orderSnap.data().totalAmount || 0;
      const cash = updates?.cashCollected ?? 0;
      const returnedJars = updates?.emptyBottlesReturned ?? 0;
      const deliveredJars = deliveryData.bottlesDelivered || 0;

      // 3. Calculate updates
      // A. Customer balance: Add charge, subtract cash collected
      const currentBalance = customerSnap.data().balance || 0;
      const newBalance = currentBalance + orderTotal - cash;

      // B. Customer empty jars held
      const currentJars = customerSnap.data().emptyBottlesHeld || 0;
      const newJarsHeld = Math.max(0, currentJars + deliveredJars - returnedJars);

      // C. Order status and payment status
      const paymentStatus = cash >= orderTotal ? 'paid' : cash > 0 ? 'partial' : 'pending';

      // 4. Perform transaction writes
      // A. Update Delivery record
      transaction.update(deliveryDocRef, {
        status: 'completed',
        ...updates,
        completedAt: now,
        updatedAt: now
      });

      // B. Update Customer ledger
      transaction.update(customerDocRef, {
        balance: newBalance,
        emptyBottlesHeld: newJarsHeld,
        updatedAt: now
      });

      // C. Update Order status
      transaction.update(orderDocRef, {
        status: 'delivered',
        amountPaid: cash,
        paymentStatus,
        updatedAt: now
      });

      // D. Register payment ledger record if cash collected
      if (cash > 0) {
        const paymentsCollectionRef = getTenantCollection('payments');
        const newPaymentDocRef = doc(paymentsCollectionRef);
        transaction.set(newPaymentDocRef, {
          customerId,
          customerName: deliveryData.customerName,
          orderId,
          amount: cash,
          method: 'cash',
          receivedById: deliveryData.helperId,
          receivedByName: deliveryData.helperName,
          paymentDate: now,
          createdAt: now
        });
      }

      // E. Update inventory (if records exist)
      if (filledInvSnap.exists()) {
        const currentFilled = filledInvSnap.data().quantity || 0;
        transaction.update(filledInvDocRef, {
          quantity: Math.max(0, currentFilled - deliveredJars),
          updatedAt: now
        });
      }
      if (emptyInvSnap.exists()) {
        const currentEmpty = emptyInvSnap.data().quantity || 0;
        transaction.update(emptyInvDocRef, {
          quantity: currentEmpty + returnedJars,
          updatedAt: now
        });
      }
    });
  }
};
