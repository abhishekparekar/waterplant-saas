export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Delivery {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  helperId: string;
  helperName: string;
  status: DeliveryStatus;
  scheduledDate: string;
  completedAt?: string;
  bottlesDelivered: number;
  emptyBottlesReturned: number;
  cashCollected: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
