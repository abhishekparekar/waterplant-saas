import { create } from 'zustand';
import { Customer } from '@/types/customer';
import { customerService } from '@/services/customerService';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const customers = await customerService.getAll();
      set({ customers, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch customers', loading: false });
    }
  },
  
  addCustomer: async (customerData) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await customerService.create(customerData);
      set({ 
        customers: [...get().customers, newCustomer],
        loading: false 
      });
      return newCustomer;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add customer', loading: false });
      throw err;
    }
  },
  
  updateCustomer: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await customerService.update(id, updates);
      set({
        customers: get().customers.map((c) => 
          c.id === id 
            ? { ...c, ...updates, updatedAt: new Date().toISOString() } 
            : c
        ),
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update customer', loading: false });
      throw err;
    }
  },
  
  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      await customerService.delete(id);
      set({
        customers: get().customers.filter((c) => c.id !== id),
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete customer', loading: false });
      throw err;
    }
  }
}));
