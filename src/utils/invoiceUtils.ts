import { Order } from '@/types/order';

/**
 * Generate a random or structured invoice reference string
 */
export const generateInvoiceReference = (orderId: string): string => {
  const cleanId = orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  const dateCode = new Date().toISOString().substring(2, 10).replace(/-/g, '');
  return `INV-${dateCode}-${cleanId}`;
};

/**
 * Format currency value to local format (e.g., $25.00 or ₹25.00)
 */
export const formatCurrency = (amount: number | null | undefined, currencySymbol: string = '₹'): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${currencySymbol}${num.toFixed(2)}`;
};

/**
 * Summarizes the items in an order into a single line string (safe against null/undefined)
 */
export const getOrderSummaryText = (order?: Order | null): string => {
  if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return '20L Water Jars';
  }
  return order.items.map((item) => `${item.itemName || '20L Jar'} x ${item.quantity || 1}`).join(', ');
};
