import { create } from 'zustand';
import { Order, OrderStatus } from '@/types/order';
import { orderService } from '@/services/orderService';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchHelperOrders: (helperId: string) => Promise<void>;
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus, extraUpdates?: Partial<Order>) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await orderService.getAll();
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch orders', loading: false });
    }
  },
  
  fetchHelperOrders: async (helperId) => {
    set({ loading: true, error: null });
    try {
      const orders = await orderService.getByHelper(helperId);
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch helper orders', loading: false });
    }
  },
  
  addOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const newOrder = await orderService.create(orderData);
      set({
        orders: [newOrder, ...get().orders],
        loading: false
      });
      
      // Lazy load delivery store to sync route schedules
      const { useDeliveryStore } = require('./deliveryStore');
      if (orderData.assignedHelperId) {
        useDeliveryStore.getState().fetchHelperDeliveries(orderData.assignedHelperId);
      } else {
        useDeliveryStore.getState().fetchDeliveries();
      }
      
      return newOrder;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add order', loading: false });
      throw err;
    }
  },
  
  updateOrderStatus: async (id, status, extraUpdates) => {
    set({ loading: true, error: null });
    try {
      await orderService.updateStatus(id, status, extraUpdates);
      set({
        orders: get().orders.map((o) =>
          o.id === id
            ? { ...o, status, ...extraUpdates, updatedAt: new Date().toISOString() }
            : o
        ),
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update order status', loading: false });
      throw err;
    }
  }
}));
