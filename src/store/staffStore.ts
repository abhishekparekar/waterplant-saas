import { create } from 'zustand';
import { StaffMember } from '@/types/staff';
import { staffService } from '@/services/staffService';

interface StaffState {
  staffList: StaffMember[];
  loading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  addStaff: (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StaffMember>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  toggleStaffStatus: (id: string, newStatus: 'active' | 'inactive') => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staffList: [],
  loading: false,
  error: null,

  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const staffList = await staffService.getAll();
      set({ staffList, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load staff list', loading: false });
    }
  },

  addStaff: async (staffData) => {
    set({ loading: true, error: null });
    try {
      const newStaff = await staffService.create(staffData);
      set((state) => ({
        staffList: [newStaff, ...state.staffList],
        loading: false
      }));
      return newStaff;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create staff profile', loading: false });
      throw err;
    }
  },

  updateStaff: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await staffService.update(id, updates);
      set((state) => ({
        staffList: state.staffList.map((s) => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update staff profile', loading: false });
      throw err;
    }
  },

  toggleStaffStatus: async (id, newStatus) => {
    try {
      await staffService.toggleStatus(id, newStatus);
      set((state) => ({
        staffList: state.staffList.map((s) => s.id === id ? { ...s, status: newStatus } : s)
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to toggle staff status' });
    }
  },

  deleteStaff: async (id) => {
    set({ loading: true, error: null });
    try {
      await staffService.delete(id);
      set((state) => ({
        staffList: state.staffList.filter((s) => s.id !== id),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete staff member', loading: false });
      throw err;
    }
  }
}));
