import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, getTenantCollection, getTenantDoc } from './firebase';

export interface MonthlyCard {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  planName: string;
  totalQuota: number;
  deliveredCount: number;
  month: string; // e.g. "Sep 2026"
  price: number;
  paymentStatus: 'paid' | 'pending';
  dailyDeliveries: Record<number, number>; // day of month (1-31) -> jar count
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'monthly_cards';

export const monthlyCardService = {
  /**
   * Fetch all monthly subscription cards
   */
  async getAll(): Promise<MonthlyCard[]> {
    try {
      const q = query(getTenantCollection(COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const cards: MonthlyCard[] = [];
      snap.forEach((d) => {
        cards.push({ id: d.id, ...d.data() } as MonthlyCard);
      });
      return cards;
    } catch (e) {
      try {
        const snap = await getDocs(getTenantCollection(COLLECTION_NAME));
        const cards: MonthlyCard[] = [];
        snap.forEach((d) => {
          cards.push({ id: d.id, ...d.data() } as MonthlyCard);
        });
        return cards.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      } catch (err) {
        return [];
      }
    }
  },

  /**
   * Issue a new monthly card to a customer
   */
  async issueCard(data: Omit<MonthlyCard, 'id' | 'createdAt' | 'updatedAt' | 'deliveredCount' | 'dailyDeliveries' | 'status'>): Promise<MonthlyCard> {
    const now = new Date().toISOString();
    const docRef = await addDoc(getTenantCollection(COLLECTION_NAME), {
      ...data,
      deliveredCount: 0,
      dailyDeliveries: {},
      status: 'active',
      createdAt: now,
      updatedAt: now
    });

    return {
      id: docRef.id,
      ...data,
      deliveredCount: 0,
      dailyDeliveries: {},
      status: 'active',
      createdAt: now,
      updatedAt: now
    };
  },

  /**
   * Punch delivery for a specific day of the month (1-31)
   */
  async punchDelivery(cardId: string, day: number, count: number): Promise<{ deliveredCount: number; dailyDeliveries: Record<number, number> }> {
    const cardRef = getTenantDoc(COLLECTION_NAME, cardId);
    const snap = await getDoc(cardRef);
    if (!snap.exists()) {
      throw new Error('Monthly card not found.');
    }

    const card = snap.data() as MonthlyCard;
    const currentDeliveries = card.dailyDeliveries || {};
    
    // Set or toggle delivery for the day
    const updatedDeliveries = {
      ...currentDeliveries,
      [day]: count
    };

    if (count <= 0) {
      delete updatedDeliveries[day];
    }

    // Calculate total delivered count from all days
    const totalDelivered = Object.values(updatedDeliveries).reduce((sum, qty) => sum + qty, 0);
    const isCompleted = totalDelivered >= (card.totalQuota || 30);
    const newStatus = isCompleted ? 'completed' : 'active';

    const now = new Date().toISOString();
    await updateDoc(cardRef, {
      dailyDeliveries: updatedDeliveries,
      deliveredCount: totalDelivered,
      status: newStatus,
      updatedAt: now
    });

    return {
      deliveredCount: totalDelivered,
      dailyDeliveries: updatedDeliveries
    };
  },

  /**
   * Renew card for next month
   */
  async renewCard(cardId: string, nextMonthStr: string): Promise<MonthlyCard> {
    const cardRef = getTenantDoc(COLLECTION_NAME, cardId);
    const snap = await getDoc(cardRef);
    if (!snap.exists()) {
      throw new Error('Monthly card not found.');
    }

    const card = snap.data() as MonthlyCard;
    return await this.issueCard({
      customerId: card.customerId,
      customerName: card.customerName,
      customerPhone: card.customerPhone,
      customerAddress: card.customerAddress,
      planName: card.planName,
      totalQuota: card.totalQuota,
      month: nextMonthStr,
      price: card.price,
      paymentStatus: 'pending'
    });
  }
};
