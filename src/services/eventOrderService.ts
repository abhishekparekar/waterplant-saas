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
  orderBy 
} from 'firebase/firestore';
import { db, getTenantCollection, getTenantDoc } from './firebase';

export type EventType = 'wedding' | 'corporate' | 'party' | 'festival' | 'other';
export type EventStatus = 'booked' | 'dispatched' | 'completed' | 'cancelled';

export interface EventOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  eventType: EventType;
  eventTitle: string;
  venueAddress: string;
  eventDate: string; // e.g. "2026-09-15"
  eventTime: string; // e.g. "10:00 AM"
  jarQuantity: number;
  ratePerJar: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  dispenserStandsCount: number;
  assignedDriverName?: string;
  assignedVehicle?: string;
  status: EventStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'event_orders';

export const eventOrderService = {
  /**
   * Fetch all event bulk bookings
   */
  async getAll(): Promise<EventOrder[]> {
    try {
      const q = query(getTenantCollection(COLLECTION_NAME), orderBy('eventDate', 'asc'));
      const snap = await getDocs(q);
      const orders: EventOrder[] = [];
      snap.forEach((d) => {
        orders.push({ id: d.id, ...d.data() } as EventOrder);
      });
      return orders;
    } catch (e) {
      try {
        const snap = await getDocs(getTenantCollection(COLLECTION_NAME));
        const orders: EventOrder[] = [];
        snap.forEach((d) => {
          orders.push({ id: d.id, ...d.data() } as EventOrder);
        });
        return orders.sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''));
      } catch (err) {
        return [];
      }
    }
  },

  /**
   * Create a new event order booking
   */
  async create(data: Omit<EventOrder, 'id' | 'createdAt' | 'updatedAt' | 'balanceDue'>): Promise<EventOrder> {
    const now = new Date().toISOString();
    const balanceDue = Math.max(0, data.totalAmount - (data.advancePaid || 0));

    const docRef = await addDoc(getTenantCollection(COLLECTION_NAME), {
      ...data,
      balanceDue,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: docRef.id,
      ...data,
      balanceDue,
      createdAt: now,
      updatedAt: now
    };
  },

  /**
   * Update event booking status or details
   */
  async updateStatus(id: string, status: EventStatus, updates?: Partial<EventOrder>): Promise<void> {
    const now = new Date().toISOString();
    const docRef = getTenantDoc(COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      ...updates,
      updatedAt: now
    });
  },

  /**
   * Delete an event booking
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(getTenantDoc(COLLECTION_NAME, id));
  }
};
