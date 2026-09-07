import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, getTenantCollection, getTenantDoc } from './firebase';
import { StaffMember } from '@/types/staff';

const sanitizeData = (data: any): any => {
  const sanitized: any = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

export const staffService = {
  /**
   * Fetch all staff members directly from Cloud Firestore under user mobile node
   */
  async getAll(): Promise<StaffMember[]> {
    try {
      const q = query(getTenantCollection('staff'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const remoteStaff: StaffMember[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        remoteStaff.push({
          id: d.id,
          name: data.name || 'Staff Member',
          phone: data.phone || '',
          email: data.email || '',
          password: data.password || 'password123',
          role: data.role || 'driver',
          status: data.status || 'active',
          vehicleNumber: data.vehicleNumber || '',
          assignedRoute: data.assignedRoute || '',
          salaryOrCommission: data.salaryOrCommission || '',
          address: data.address || '',
          ownerId: data.ownerId || 'owner_1',
          businessName: data.businessName || 'Abhiraj Water Plant',
          totalDeliveriesCompleted: data.totalDeliveriesCompleted || 0,
          todayDeliveries: data.todayDeliveries || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        });
      });
      return remoteStaff;
    } catch (err) {
      // Fallback query without orderBy if index is still building in Firestore
      try {
        const snapshot = await getDocs(getTenantCollection('staff'));
        const remoteStaff: StaffMember[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          remoteStaff.push({
            id: d.id,
            name: data.name || 'Staff Member',
            phone: data.phone || '',
            email: data.email || '',
            password: data.password || 'password123',
            role: data.role || 'driver',
            status: data.status || 'active',
            vehicleNumber: data.vehicleNumber || '',
            assignedRoute: data.assignedRoute || '',
            salaryOrCommission: data.salaryOrCommission || '',
            address: data.address || '',
            ownerId: data.ownerId || 'owner_1',
            businessName: data.businessName || 'Abhiraj Water Plant',
            totalDeliveriesCompleted: data.totalDeliveriesCompleted || 0,
            todayDeliveries: data.todayDeliveries || 0,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          });
        });
        return remoteStaff;
      } catch (fallbackErr) {
        console.error('Firestore staff fetch error:', fallbackErr);
        return [];
      }
    }
  },

  /**
   * Create staff member directly in Cloud Firestore under user mobile node
   */
  async create(staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffMember> {
    const sanitized = sanitizeData({
      ...staffData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const docRef = await addDoc(getTenantCollection('staff'), sanitized);

    return {
      ...staffData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Update staff member directly in Cloud Firestore under user mobile node
   */
  async update(id: string, updates: Partial<StaffMember>): Promise<void> {
    const sanitized = sanitizeData({
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await updateDoc(getTenantDoc('staff', id), sanitized);
  },

  async toggleStatus(id: string, newStatus: 'active' | 'inactive'): Promise<void> {
    await this.update(id, { status: newStatus });
  },

  /**
   * Delete staff member directly from Cloud Firestore under user mobile node
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(getTenantDoc('staff', id));
  }
};
