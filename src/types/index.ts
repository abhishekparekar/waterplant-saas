// Water Plant Management SaaS - TypeScript Definitions

export type UserRole = 'owner' | 'manager' | 'delivery' | 'office';

export type CustomerType = 
  | 'Home'
  | 'Office'
  | 'Hotel'
  | 'Restaurant'
  | 'School'
  | 'Hospital'
  | 'Shop'
  | 'Event'
  | 'Distributor'
  | 'Other';

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Assigned'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Partially Delivered'
  | 'Failed'
  | 'Cancelled';

export type DeliveryStatus = 
  | 'Pending'
  | 'In Transit'
  | 'Delivered'
  | 'Partially Delivered'
  | 'Failed'
  | 'Rescheduled';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';

export type BottleMovementType = 
  | 'Plant Produced'
  | 'Dispatched to Delivery'
  | 'Delivered to Customer'
  | 'Empty Returned from Customer'
  | 'Returned to Plant'
  | 'Damaged at Plant'
  | 'Damaged by Customer'
  | 'Lost'
  | 'Disposed'
  | 'Adjustment';

export type StockTransactionType = 
  | 'Opening'
  | 'Production'
  | 'Delivery Dispatch'
  | 'Customer Return'
  | 'Plant Breakage'
  | 'Adjustment'
  | 'Disposal';

export type RecurringFrequency = 
  | 'Daily'
  | 'Alternate Days'
  | 'Weekly'
  | 'Weekdays'
  | 'Monthly'
  | 'Custom';

export type SubscriptionPlan = 'Starter' | 'Growth' | 'Business' | 'Enterprise';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAYMENT_PENDING' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED';

export interface Tenant {
  id: string;
  name: string;
  ownerName: string;
  mobile: string;
  email: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  logo?: string;
  workingHours: string;
  currency: string;
  invoicePrefix: string;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialDaysLeft: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  assignedRoute?: string;
  joiningDate: string;
  performance?: {
    totalDeliveries: number;
    completedDeliveries: number;
    failedDeliveries: number;
    totalCollected: number;
    bottlesCollected: number;
  };
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  category: '20L Jar' | '10L Jar' | 'Bottled Water' | 'Dispenser' | 'Accessory';
  unit: string;
  sellingPrice: number;
  purchasePrice: number;
  bottleDeposit: number;
  taxRate: number; // in percentage e.g. 18
  active: boolean;
  stockCount: number;
  emptyBottleCount: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  customerType: CustomerType;
  address: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  defaultProductId: string;
  defaultPrice: number;
  bottleDeposit: number;
  creditLimit: number;
  paymentTerms: string;
  bottleBalance: number; // Bottles currently held by customer
  outstandingBalance: number; // Unpaid amount
  totalSalesAmount: number;
  totalPaidAmount: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  deliveredQuantity?: number;
  unitPrice: number;
  bottleDeposit: number;
  taxRate: number;
  total: number;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  bottleDepositAmount: number;
  grandTotal: number;
  paidAmount: number;
  status: OrderStatus;
  orderType: 'One-Time' | 'Recurring';
  recurringId?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  scheduledDate: string;
  deliveredDate?: string;
  notes?: string;
  createdAt: string;
}

export interface RecurringSchedule {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  frequency: RecurringFrequency;
  selectedDays?: string[]; // e.g. ['Mon', 'Wed', 'Fri']
  preferredTimeSlot?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  nextRunDate: string;
  notes?: string;
}

export interface Delivery {
  id: string;
  tenantId: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  items: OrderItem[];
  orderedQuantity: number;
  deliveredQuantity: number;
  expectedEmptyBottles: number;
  collectedEmptyBottles: number;
  amountToCollect: number;
  collectedAmount: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  status: DeliveryStatus;
  failedReason?: string;
  customerSignature?: string;
  deliveryPhoto?: string;
  deliveryNotes?: string;
  deliveryDate: string;
  startedAt?: string;
  completedAt?: string;
  offlineCreated?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface BottleLedger {
  id: string;
  tenantId: string;
  customerId?: string;
  customerName?: string;
  employeeId?: string;
  employeeName?: string;
  deliveryId?: string;
  movementType: BottleMovementType;
  quantity: number; // positive or negative
  previousBalance: number;
  newBalance: number;
  balanceCategory: 'At Plant Filled' | 'At Plant Empty' | 'With Customer' | 'With Employee' | 'Damaged' | 'Lost';
  notes: string;
  timestamp: string;
}

export interface StockLedger {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  category: 'Filled Bottles' | 'Empty Jars' | 'Raw Material Caps' | 'Raw Material Labels';
  transactionType: StockTransactionType;
  quantityChange: number; // e.g. +500 or -250
  previousStock: number;
  newStock: number;
  referenceId?: string; // productionId, deliveryId, etc.
  reason: string;
  operator: string;
  timestamp: string;
}

export interface ProductionRecord {
  id: string;
  tenantId: string;
  batchNumber: string;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  productId: string;
  productName: string;
  quantityProduced: number;
  damagedQuantity: number;
  netQuantity: number;
  waterSourceTDS?: number;
  purifiedTDS?: number;
  operator: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  orderId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  collectedBy: string;
  paymentDate: string;
  notes?: string;
  status: 'Completed' | 'Pending Verification' | 'Voided';
  createdAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerGst?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  depositAmount: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  dueDate: string;
  invoiceDate: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  category: 
    | 'Fuel'
    | 'Electricity'
    | 'Salary'
    | 'Vehicle Maintenance'
    | 'Bottle Purchase'
    | 'Packaging & Caps'
    | 'Raw Material / Filter'
    | 'Rent'
    | 'Marketing'
    | 'Repair & Maintenance'
    | 'Other';
  amount: number;
  date: string;
  description: string;
  paidBy: string;
  paymentMethod: PaymentMethod;
  receiptAttachment?: string;
  createdAt: string;
}

export interface DailyClosing {
  id: string;
  tenantId: string;
  date: string;
  closedBy: string;
  totalSales: number;
  totalCollections: number;
  totalExpenses: number;
  netCashFlow: number;
  deliveriesCount: number;
  completedDeliveries: number;
  failedDeliveries: number;
  producedBottles: number;
  returnedBottles: number;
  damagedBottles: number;
  lostBottles: number;
  cashInHand: number;
  upiCollections: number;
  bankCollections: number;
  status: 'Closed' | 'Draft' | 'Adjusted';
  auditNotes?: string;
  closedAt: string;
}

export interface AppNotification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'bottle' | 'stock' | 'payment' | 'closing' | 'system';
  targetRole?: UserRole;
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
