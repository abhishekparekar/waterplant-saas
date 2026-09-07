import { create } from 'zustand';
import { Delivery, DeliveryStatus } from '@/types/delivery';
import { deliveryService } from '@/services/deliveryService';

interface DeliveryState {
  deliveries: Delivery[];
  loading: boolean;
  error: string | null;
  fetchDeliveries: () => Promise<void>;
  fetchHelperDeliveries: (helperId: string) => Promise<void>;
  createDelivery: (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Delivery>;
  updateDeliveryStatus: (id: string, status: DeliveryStatus, updates?: Partial<Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  loading: false,
  error: null,
  
  fetchDeliveries: async () => {
    set({ loading: true, error: null });
    try {
      const deliveries = await deliveryService.getAll();
      set({ deliveries, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch deliveries', loading: false });
    }
  },
  
  fetchHelperDeliveries: async (helperId) => {
    set({ loading: true, error: null });
    try {
      const deliveries = await deliveryService.getByHelper(helperId);
      set({ deliveries, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch helper deliveries', loading: false });
    }
  },
  
  createDelivery: async (deliveryData) => {
    set({ loading: true, error: null });
    try {
      const newDelivery = await deliveryService.create(deliveryData);
      set({
        deliveries: [newDelivery, ...get().deliveries],
        loading: false
      });
      return newDelivery;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create delivery', loading: false });
      throw err;
    }
  },
  
  updateDeliveryStatus: async (id, status, updates) => {
    set({ loading: true, error: null });
    try {
      await deliveryService.updateStatus(id, status, updates);
      const now = new Date().toISOString();
      
      // Update local deliveries state
      set({
        deliveries: get().deliveries.map((d) =>
          d.id === id
            ? { 
                ...d, 
                status, 
                ...updates, 
                completedAt: status === 'completed' ? now : d.completedAt,
                updatedAt: now 
              }
            : d
        ),
        loading: false
      });

      // If delivery is completed, reload client balances and order logs dynamically
      if (status === 'completed') {
        const { useCustomerStore } = require('./customerStore');
        const { useOrderStore } = require('./orderStore');
        useCustomerStore.getState().fetchCustomers();
        useOrderStore.getState().fetchOrders();
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to update delivery status', loading: false });
      throw err;
    }
  }
}));
