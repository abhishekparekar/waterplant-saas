export type PaymentMethod = 'cash' | 'online' | 'credit' | 'upi' | 'bank_transfer';

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
  notes?: string;
  receivedById: string; // User ID of who received it
  receivedByName: string;
  paymentDate: string;
  createdAt: string;
}
