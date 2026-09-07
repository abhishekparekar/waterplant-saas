export interface InventoryItem {
  id: string;
  name: string; // e.g. "20L Filled Bottle", "20L Empty Bottle"
  quantity: number;
  unit: string; // e.g. "pcs", "liters"
  reorderLevel: number;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out'; // addition or consumption
  quantity: number;
  reference?: string; // e.g. "Order #1023", "Refill Station Batch"
  notes?: string;
  userId: string;
  userName: string;
  timestamp: string;
}
