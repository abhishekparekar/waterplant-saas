export type OrderStatus = 'pending' | 'assigned' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'partial';

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  deliveryAddress: string;
  deliveryDate: string; // ISO date string
  assignedHelperId?: string; // UID of helper assigned
  assignedHelperName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
