import { OrderItem } from '@/types/order';

/**
 * Calculates total price of order items
 */
export const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

/**
 * Calculates single order item price
 */
export const calculateItemPrice = (quantity: number, pricePerUnit: number): number => {
  return quantity * pricePerUnit;
};

/**
 * Calculates new outstanding balance for a customer after payment
 */
export const calculateNewBalance = (currentBalance: number, chargeAmount: number, paymentAmount: number): number => {
  return currentBalance + chargeAmount - paymentAmount;
};
