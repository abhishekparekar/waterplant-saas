import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Tenant, 
  UserProfile, 
  UserRole, 
  Customer, 
  Product, 
  Order, 
  RecurringSchedule, 
  Delivery, 
  BottleLedger, 
  StockLedger, 
  ProductionRecord, 
  Payment, 
  Invoice, 
  Expense, 
  DailyClosing, 
  AppNotification, 
  AuditLog,
  DeliveryStatus,
  PaymentMethod,
  SubscriptionPlan,
  SubscriptionDuration,
  SubscriptionRecord
} from '../types';
import { FirestoreTenantService } from '../services/firebase';
import { 
  initialTenants, 
  initialUsers, 
  initialProducts, 
  initialCustomers, 
  initialOrders, 
  initialRecurringSchedules, 
  initialDeliveries, 
  initialBottleLedger, 
  initialStockLedger, 
  initialProduction, 
  initialPayments, 
  initialInvoices, 
  initialExpenses, 
  initialDailyClosings, 
  initialNotifications, 
  initialAuditLogs 
} from '../data/mockData';

interface AppContextType {
  // Multitenancy & User Session
  currentTenant: Tenant;
  currentUser: UserProfile;
  tenants: Tenant[];
  users: UserProfile[];
  switchTenant: (tenantId: string) => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  updateTenantInfo: (data: Partial<Tenant>) => void;
  
  // UI & View Mode
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileSimulator: boolean;
  setIsMobileSimulator: (val: boolean) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (val: boolean) => void;
  offlineQueueCount: number;
  syncOfflineData: () => void;

  // Data Collections
  customers: Customer[];
  products: Product[];
  orders: Order[];
  recurringSchedules: RecurringSchedule[];
  deliveries: Delivery[];
  bottleLedger: BottleLedger[];
  stockLedger: StockLedger[];
  productionRecords: ProductionRecord[];
  payments: Payment[];
  invoices: Invoice[];
  expenses: Expense[];
  dailyClosings: DailyClosing[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];

  // Customer Operations
  addCustomer: (cust: Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'totalSalesAmount' | 'totalPaidAmount' | 'bottleBalance' | 'outstandingBalance'>) => Customer;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Product Operations
  addProduct: (prod: Omit<Product, 'id' | 'tenantId' | 'createdAt'>) => Product;
  updateProduct: (id: string, prod: Partial<Product>) => void;

  // Order & Recurring Operations
  createOrder: (order: Omit<Order, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'paidAmount'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  createRecurringSchedule: (rec: Omit<RecurringSchedule, 'id' | 'tenantId' | 'nextRunDate'>) => void;
  toggleRecurringSchedule: (id: string) => void;
  generateDailyDeliveriesFromRecurring: () => number;

  // Delivery & Driver Flow Operations
  startDelivery: (deliveryId: string) => void;
  completeDelivery: (
    deliveryId: string, 
    deliveredQuantity: number, 
    collectedEmptyBottles: number, 
    collectedAmount: number, 
    paymentMethod: PaymentMethod,
    paymentReference?: string,
    notes?: string,
    signature?: string
  ) => { success: boolean; message: string };
  recordFailedDelivery: (deliveryId: string, reason: string) => void;
  assignDeliveryEmployee: (deliveryId: string, employeeId: string) => void;

  // Production Operations
  addProductionRecord: (rec: Omit<ProductionRecord, 'id' | 'tenantId' | 'netQuantity' | 'createdAt'>) => void;

  // Bottle & Stock Operations
  recordBottleAdjustment: (
    customerId: string | undefined, 
    quantity: number, 
    category: BottleLedger['balanceCategory'], 
    reason: string
  ) => void;
  recordStockAdjustment: (
    productId: string, 
    quantityChange: number, 
    category: StockLedger['category'], 
    reason: string
  ) => void;

  // Financial & Expense Operations
  recordPayment: (pay: Omit<Payment, 'id' | 'tenantId' | 'createdAt' | 'status'>) => void;
  generateInvoiceForOrder: (orderId: string) => Invoice | null;
  addExpense: (exp: Omit<Expense, 'id' | 'tenantId' | 'createdAt'>) => void;
  
  // Daily Closing
  performDailyClosing: (closingData: {
    cashInHand: number;
    auditNotes?: string;
  }) => { success: boolean; message: string };
  isTodayClosed: boolean;

  // Notifications & Subscription
  subscriptionHistory: SubscriptionRecord[];
  markNotificationRead: (id: string) => void;
  upgradePlan: (plan: SubscriptionPlan) => void;
  renewSubscription: (
    plan: SubscriptionPlan, 
    duration: SubscriptionDuration, 
    paymentMethod: PaymentMethod,
    paymentReference?: string
  ) => { success: boolean; record: SubscriptionRecord };

  // Summary Metrics
  metrics: {
    todaySales: number;
    todayCollections: number;
    todayExpenses: number;
    totalOutstanding: number;
    totalFilledStock: number;
    totalEmptyStock: number;
    totalBottlesWithCustomers: number;
    totalDamagedBottles: number;
    todayCompletedDeliveries: number;
    todayPendingDeliveries: number;
    todayFailedDeliveries: number;
    todayProducedJars: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'WATER_PLANT_SAAS_STATE_V1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tenants`);
    return saved ? JSON.parse(saved) : initialTenants;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string>(tenants[0]?.id || 'tenant_apw_001');

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>('user_owner_01');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Collections state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_recurring`);
    return saved ? JSON.parse(saved) : initialRecurringSchedules;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_deliveries`);
    return saved ? JSON.parse(saved) : initialDeliveries;
  });

  const [bottleLedger, setBottleLedger] = useState<BottleLedger[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_bottleLedger`);
    return saved ? JSON.parse(saved) : initialBottleLedger;
  });

  const [stockLedger, setStockLedger] = useState<StockLedger[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_stockLedger`);
    return saved ? JSON.parse(saved) : initialStockLedger;
  });

  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_production`);
    return saved ? JSON.parse(saved) : initialProduction;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_dailyClosings`);
    return saved ? JSON.parse(saved) : initialDailyClosings;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_subscriptions`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'sub_rec_initial_001',
        tenantId: 'tenant_apw_001',
        plan: 'Growth',
        durationMonths: 6,
        amountPaid: 17844,
        discountApplied: 3150,
        startDate: '2026-06-01',
        expiryDate: '2026-12-01',
        paymentMethod: 'UPI',
        paymentReference: 'UPI-RAZORPAY-892019',
        invoiceNumber: 'INV-SUB-2026-0042',
        status: 'Active',
        createdAt: '2026-06-01T10:00:00Z'
      }
    ];
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tenants`, JSON.stringify(tenants));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_orders`, JSON.stringify(orders));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_recurring`, JSON.stringify(recurringSchedules));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_deliveries`, JSON.stringify(deliveries));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_bottleLedger`, JSON.stringify(bottleLedger));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_stockLedger`, JSON.stringify(stockLedger));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_production`, JSON.stringify(productionRecords));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(payments));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_dailyClosings`, JSON.stringify(dailyClosings));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_subscriptions`, JSON.stringify(subscriptionHistory));
  }, [
    tenants, users, products, customers, orders, recurringSchedules,
    deliveries, bottleLedger, stockLedger, productionRecords, payments,
    invoices, expenses, dailyClosings, notifications, auditLogs, subscriptionHistory
  ]);

  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    const tenantUser = users.find(u => u.tenantId === tenantId);
    if (tenantUser) setCurrentUserId(tenantUser.id);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find(u => u.tenantId === currentTenantId && u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      if (role === 'delivery') {
        setActiveTab('deliveries');
      }
    }
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      if (target.role === 'delivery') {
        setActiveTab('deliveries');
      }
    }
  };

  const updateTenantInfo = (data: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === currentTenantId ? { ...t, ...data } : t));
  };

  // Check if today is closed
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayClosed = dailyClosings.some(c => c.tenantId === currentTenantId && c.date === todayStr && c.status === 'Closed');

  // Customer Management
  const addCustomer = (custData: Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'totalSalesAmount' | 'totalPaidAmount' | 'bottleBalance' | 'outstandingBalance'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
      tenantId: currentTenantId,
      bottleBalance: 0,
      outstandingBalance: 0,
      totalSalesAmount: 0,
      totalPaidAmount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);

    // Add Audit Log
    setAuditLogs(prev => [{
      id: `audit_${Date.now()}`,
      tenantId: currentTenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: newCust.id,
      details: `Added new customer: ${newCust.name} (${newCust.customerType})`,
      timestamp: new Date().toISOString()
    }, ...prev]);

    return newCust;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString().split('T')[0] } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Product Operations
  const addProduct = (prodData: Omit<Product, 'id' | 'tenantId' | 'createdAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod_${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'paidAmount'>) => {
    const count = orders.filter(o => o.tenantId === currentTenantId).length + 1;
    const orderNumber = `${currentTenant.invoicePrefix}-ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(count).padStart(2, '0')}`;
    
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      tenantId: currentTenantId,
      orderNumber,
      paidAmount: 0,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    // Automatically generate Delivery item
    const newDelivery: Delivery = {
      id: `del_${Date.now()}`,
      tenantId: currentTenantId,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      customerMobile: newOrder.customerMobile,
      customerAddress: newOrder.customerAddress,
      assignedEmployeeId: newOrder.assignedEmployeeId || 'user_delivery_01',
      assignedEmployeeName: newOrder.assignedEmployeeName || 'Rahul Pawar',
      items: newOrder.items,
      orderedQuantity: newOrder.items.reduce((acc, item) => acc + item.quantity, 0),
      deliveredQuantity: 0,
      expectedEmptyBottles: newOrder.items.reduce((acc, item) => acc + item.quantity, 0),
      collectedEmptyBottles: 0,
      amountToCollect: newOrder.grandTotal,
      collectedAmount: 0,
      status: 'Pending',
      deliveryDate: newOrder.scheduledDate,
      syncStatus: 'synced'
    };

    setDeliveries(prev => [newDelivery, ...prev]);

    // Notify assigned driver
    setNotifications(prev => [{
      id: `notif_${Date.now()}`,
      tenantId: currentTenantId,
      title: '📦 New Delivery Order Created',
      message: `Order ${orderNumber} for ${newOrder.customerName} assigned for delivery.`,
      type: 'order',
      targetRole: 'delivery',
      read: false,
      timestamp: new Date().toISOString()
    }, ...prev]);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const createRecurringSchedule = (recData: Omit<RecurringSchedule, 'id' | 'tenantId' | 'nextRunDate'>) => {
    const newRec: RecurringSchedule = {
      ...recData,
      id: `rec_${Date.now()}`,
      tenantId: currentTenantId,
      nextRunDate: new Date().toISOString().split('T')[0]
    };
    setRecurringSchedules(prev => [newRec, ...prev]);
  };

  const toggleRecurringSchedule = (id: string) => {
    setRecurringSchedules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const generateDailyDeliveriesFromRecurring = () => {
    let generated = 0;
    const active = recurringSchedules.filter(r => r.tenantId === currentTenantId && r.active);
    const today = new Date().toISOString().split('T')[0];

    active.forEach(sched => {
      // Check if already created today
      const alreadyHas = deliveries.some(d => d.tenantId === currentTenantId && d.deliveryDate === today && d.customerId === sched.customerId);
      if (!alreadyHas) {
        const cust = customers.find(c => c.id === sched.customerId);
        const prod = products.find(p => p.id === sched.productId);
        if (cust && prod) {
          const itemTotal = sched.quantity * (cust.defaultPrice || prod.sellingPrice);
          const order = createOrder({
            customerId: cust.id,
            customerName: cust.name,
            customerMobile: cust.mobile,
            customerAddress: cust.address,
            items: [{
              productId: prod.id,
              productName: prod.name,
              quantity: sched.quantity,
              unitPrice: cust.defaultPrice || prod.sellingPrice,
              bottleDeposit: 0,
              taxRate: prod.taxRate,
              total: itemTotal
            }],
            totalAmount: itemTotal,
            bottleDepositAmount: 0,
            grandTotal: itemTotal,
            status: 'Pending',
            orderType: 'Recurring',
            recurringId: sched.id,
            scheduledDate: today,
            assignedEmployeeId: 'user_delivery_01',
            assignedEmployeeName: 'Rahul Pawar'
          });
          generated++;
        }
      }
    });

    return generated;
  };

  // Delivery Execution Workflow (PRD Section 20, 21, 23, 24, 25)
  const startDelivery = (deliveryId: string) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? {
      ...d,
      status: 'In Transit',
      startedAt: new Date().toISOString()
    } : d));
  };

  const completeDelivery = (
    deliveryId: string, 
    deliveredQuantity: number, 
    collectedEmptyBottles: number, 
    collectedAmount: number, 
    paymentMethod: PaymentMethod,
    paymentReference?: string,
    notes?: string,
    signature?: string
  ) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return { success: false, message: 'Delivery record not found' };

    const cust = customers.find(c => c.id === delivery.customerId);
    const prod = products.find(p => p.id === delivery.items[0]?.productId) || products[0];

    // Rule 25: Bottle Balance Verification
    if (cust && collectedEmptyBottles > (cust.bottleBalance + deliveredQuantity)) {
      return {
        success: false,
        message: `Validation Error: Customer only holds ${cust.bottleBalance} bottles. Cannot collect ${collectedEmptyBottles} empty bottles without manual adjustment.`
      };
    }

    const isPartial = deliveredQuantity < delivery.orderedQuantity;
    const finalStatus: DeliveryStatus = isPartial ? 'Partially Delivered' : 'Delivered';
    const completionTimestamp = new Date().toISOString();

    // 1. Update Delivery Record
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? {
      ...d,
      status: finalStatus,
      deliveredQuantity,
      collectedEmptyBottles,
      collectedAmount,
      paymentMethod,
      paymentReference,
      deliveryNotes: notes,
      customerSignature: signature,
      completedAt: completionTimestamp,
      syncStatus: isOfflineMode ? 'pending' : 'synced'
    } : d));

    // 2. Update Order
    setOrders(prev => prev.map(o => o.id === delivery.orderId ? {
      ...o,
      status: isPartial ? 'Partially Delivered' : 'Delivered',
      paidAmount: o.paidAmount + collectedAmount,
      deliveredDate: completionTimestamp
    } : o));

    // 3. Update Customer Bottle Balance & Financial Balance
    const bottleDiff = deliveredQuantity - collectedEmptyBottles; // e.g. delivered 10, returned 8 -> net increase +2 with customer
    const pricePerUnit = delivery.items[0]?.unitPrice || 35;
    const totalOrderCost = deliveredQuantity * pricePerUnit;
    const unpaidAmount = totalOrderCost - collectedAmount;

    if (cust) {
      setCustomers(prev => prev.map(c => c.id === cust.id ? {
        ...c,
        bottleBalance: Math.max(0, c.bottleBalance + bottleDiff),
        outstandingBalance: Math.max(0, c.outstandingBalance + unpaidAmount),
        totalSalesAmount: c.totalSalesAmount + totalOrderCost,
        totalPaidAmount: c.totalPaidAmount + collectedAmount,
        updatedAt: completionTimestamp.split('T')[0]
      } : c));
    }

    // 4. Update Product Stock (Filled bottles decrease by deliveredQuantity, empty bottles increase by collectedEmptyBottles)
    if (prod) {
      setProducts(prev => prev.map(p => p.id === prod.id ? {
        ...p,
        stockCount: Math.max(0, p.stockCount - deliveredQuantity),
        emptyBottleCount: p.emptyBottleCount + collectedEmptyBottles
      } : p));
    }

    // 5. Create Bottle Ledger Entries (Rule 3 & PRD Section 24)
    const prevCustBottles = cust?.bottleBalance || 0;
    const deliveredLedger: BottleLedger = {
      id: `bot_led_${Date.now()}_del`,
      tenantId: currentTenantId,
      customerId: delivery.customerId,
      customerName: delivery.customerName,
      employeeId: delivery.assignedEmployeeId,
      employeeName: delivery.assignedEmployeeName,
      deliveryId: delivery.id,
      movementType: 'Delivered to Customer',
      quantity: deliveredQuantity,
      previousBalance: prevCustBottles,
      newBalance: prevCustBottles + deliveredQuantity,
      balanceCategory: 'With Customer',
      notes: `Delivered ${deliveredQuantity} jars via ${delivery.orderNumber}`,
      timestamp: completionTimestamp
    };

    const returnedLedger: BottleLedger = {
      id: `bot_led_${Date.now()}_ret`,
      tenantId: currentTenantId,
      customerId: delivery.customerId,
      customerName: delivery.customerName,
      employeeId: delivery.assignedEmployeeId,
      employeeName: delivery.assignedEmployeeName,
      deliveryId: delivery.id,
      movementType: 'Empty Returned from Customer',
      quantity: -collectedEmptyBottles,
      previousBalance: prevCustBottles + deliveredQuantity,
      newBalance: prevCustBottles + deliveredQuantity - collectedEmptyBottles,
      balanceCategory: 'With Customer',
      notes: `Collected ${collectedEmptyBottles} empty jars`,
      timestamp: completionTimestamp
    };

    setBottleLedger(prev => [returnedLedger, deliveredLedger, ...prev]);

    // 6. Create Stock Ledger Entry (PRD Section 28)
    const newStockLedgerEntry: StockLedger = {
      id: `stk_led_${Date.now()}`,
      tenantId: currentTenantId,
      productId: prod?.id || 'prod_20l_jar',
      productName: prod?.name || '20L Jar',
      category: 'Filled Bottles',
      transactionType: 'Delivery Dispatch',
      quantityChange: -deliveredQuantity,
      previousStock: prod?.stockCount || 0,
      newStock: Math.max(0, (prod?.stockCount || 0) - deliveredQuantity),
      referenceId: delivery.id,
      reason: `Dispatched & delivered ${deliveredQuantity} jars to ${delivery.customerName}`,
      operator: delivery.assignedEmployeeName,
      timestamp: completionTimestamp
    };
    setStockLedger(prev => [newStockLedgerEntry, ...prev]);

    // 7. Record Payment if collected (Rule 2)
    if (collectedAmount > 0) {
      const newPayment: Payment = {
        id: `pay_${Date.now()}`,
        tenantId: currentTenantId,
        customerId: delivery.customerId,
        customerName: delivery.customerName,
        orderId: delivery.orderId,
        amount: collectedAmount,
        paymentMethod,
        referenceNumber: paymentReference || `DEL-COLL-${Date.now().toString().slice(-4)}`,
        collectedBy: delivery.assignedEmployeeName,
        paymentDate: completionTimestamp.split('T')[0],
        status: 'Completed',
        notes: `Field collection during delivery ${delivery.orderNumber}`,
        createdAt: completionTimestamp
      };
      setPayments(prev => [newPayment, ...prev]);
    }

    // 8. Generate Auto Invoice
    const invoiceNumber = `${currentTenant.invoicePrefix}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const subtotal = Number((totalOrderCost / 1.18).toFixed(2));
    const taxAmount = Number((totalOrderCost - subtotal).toFixed(2));
    
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      tenantId: currentTenantId,
      invoiceNumber,
      orderId: delivery.orderId,
      customerId: delivery.customerId,
      customerName: delivery.customerName,
      customerMobile: delivery.customerMobile,
      customerAddress: delivery.customerAddress,
      items: [{
        productId: prod?.id || 'prod_20l_jar',
        productName: prod?.name || '20L Jar',
        quantity: deliveredQuantity,
        unitPrice: pricePerUnit,
        bottleDeposit: 0,
        taxRate: 18,
        total: totalOrderCost
      }],
      subtotal,
      taxAmount,
      discount: 0,
      depositAmount: 0,
      total: totalOrderCost,
      paidAmount: collectedAmount,
      balanceAmount: unpaidAmount,
      status: unpaidAmount === 0 ? 'Paid' : collectedAmount > 0 ? 'Partial' : 'Unpaid',
      dueDate: completionTimestamp.split('T')[0],
      invoiceDate: completionTimestamp.split('T')[0],
      createdAt: completionTimestamp
    };
    setInvoices(prev => [newInvoice, ...prev]);

    return {
      success: true,
      message: `Delivery completed successfully for ${delivery.customerName}. Jars delivered: ${deliveredQuantity}, Empties collected: ${collectedEmptyBottles}, Collected: ₹${collectedAmount}`
    };
  };

  const recordFailedDelivery = (deliveryId: string, reason: string) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? {
      ...d,
      status: 'Failed',
      failedReason: reason,
      completedAt: new Date().toISOString()
    } : d));

    const del = deliveries.find(d => d.id === deliveryId);
    if (del) {
      setOrders(prev => prev.map(o => o.id === del.orderId ? { ...o, status: 'Failed' } : o));
    }
  };

  const assignDeliveryEmployee = (deliveryId: string, employeeId: string) => {
    const emp = users.find(u => u.id === employeeId);
    if (emp) {
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? {
        ...d,
        assignedEmployeeId: emp.id,
        assignedEmployeeName: emp.name
      } : d));
    }
  };

  // Production Module (PRD Section 26)
  const addProductionRecord = (recData: Omit<ProductionRecord, 'id' | 'tenantId' | 'netQuantity' | 'createdAt'>) => {
    const netQuantity = recData.quantityProduced - recData.damagedQuantity;
    const newRec: ProductionRecord = {
      ...recData,
      id: `prod_rec_${Date.now()}`,
      tenantId: currentTenantId,
      netQuantity,
      createdAt: new Date().toISOString()
    };

    setProductionRecords(prev => [newRec, ...prev]);

    // Increase finished goods stock & decrease empty jars
    const prod = products.find(p => p.id === recData.productId) || products[0];
    if (prod) {
      setProducts(prev => prev.map(p => p.id === prod.id ? {
        ...p,
        stockCount: p.stockCount + netQuantity,
        emptyBottleCount: Math.max(0, p.emptyBottleCount - recData.quantityProduced)
      } : p));

      // Stock Ledger entry
      setStockLedger(prev => [{
        id: `stk_led_${Date.now()}`,
        tenantId: currentTenantId,
        productId: prod.id,
        productName: prod.name,
        category: 'Filled Bottles',
        transactionType: 'Production',
        quantityChange: netQuantity,
        previousStock: prod.stockCount,
        newStock: prod.stockCount + netQuantity,
        referenceId: newRec.id,
        reason: `Shift ${newRec.shift} Batch ${newRec.batchNumber} Production`,
        operator: newRec.operator,
        timestamp: new Date().toISOString()
      }, ...prev]);

      // Bottle Ledger for Plant Filled
      setBottleLedger(prev => [{
        id: `bot_led_${Date.now()}`,
        tenantId: currentTenantId,
        movementType: 'Plant Produced',
        quantity: netQuantity,
        previousBalance: prod.stockCount,
        newBalance: prod.stockCount + netQuantity,
        balanceCategory: 'At Plant Filled',
        notes: `Production Batch ${newRec.batchNumber} net output`,
        timestamp: new Date().toISOString()
      }, ...prev]);
    }
  };

  // Bottle Adjustment (PRD Section 24, 25)
  const recordBottleAdjustment = (
    customerId: string | undefined, 
    quantity: number, 
    category: BottleLedger['balanceCategory'], 
    reason: string
  ) => {
    const cust = customerId ? customers.find(c => c.id === customerId) : undefined;
    const currentCustBalance = cust ? cust.bottleBalance : 0;
    const newCustBalance = Math.max(0, currentCustBalance + quantity);

    if (cust) {
      setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, bottleBalance: newCustBalance } : c));
    }

    const newLedger: BottleLedger = {
      id: `bot_led_${Date.now()}`,
      tenantId: currentTenantId,
      customerId,
      customerName: cust?.name,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      movementType: 'Adjustment',
      quantity,
      previousBalance: currentCustBalance,
      newBalance: newCustBalance,
      balanceCategory: category,
      notes: reason,
      timestamp: new Date().toISOString()
    };

    setBottleLedger(prev => [newLedger, ...prev]);
  };

  // Stock Adjustment (PRD Section 28)
  const recordStockAdjustment = (
    productId: string, 
    quantityChange: number, 
    category: StockLedger['category'], 
    reason: string
  ) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const prevStock = prod.stockCount;
    const newStock = Math.max(0, prevStock + quantityChange);

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockCount: newStock } : p));

    setStockLedger(prev => [{
      id: `stk_led_${Date.now()}`,
      tenantId: currentTenantId,
      productId: prod.id,
      productName: prod.name,
      category,
      transactionType: 'Adjustment',
      quantityChange,
      previousStock: prevStock,
      newStock,
      reason,
      operator: currentUser.name,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  // Payments (PRD Section 29, 30)
  const recordPayment = (payData: Omit<Payment, 'id' | 'tenantId' | 'createdAt' | 'status'>) => {
    const newPayment: Payment = {
      ...payData,
      id: `pay_${Date.now()}`,
      tenantId: currentTenantId,
      status: 'Completed',
      createdAt: new Date().toISOString()
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update customer outstanding
    setCustomers(prev => prev.map(c => c.id === payData.customerId ? {
      ...c,
      outstandingBalance: Math.max(0, c.outstandingBalance - payData.amount),
      totalPaidAmount: c.totalPaidAmount + payData.amount,
      updatedAt: new Date().toISOString().split('T')[0]
    } : c));

    // If linked to invoice, update invoice paid amount
    if (payData.invoiceId) {
      setInvoices(prev => prev.map(inv => inv.id === payData.invoiceId ? {
        ...inv,
        paidAmount: inv.paidAmount + payData.amount,
        balanceAmount: Math.max(0, inv.balanceAmount - payData.amount),
        status: (inv.paidAmount + payData.amount) >= inv.total ? 'Paid' : 'Partial'
      } : inv));
    }
  };

  const generateInvoiceForOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const existing = invoices.find(i => i.orderId === orderId);
    if (existing) return existing;

    const subtotal = Number((order.grandTotal / 1.18).toFixed(2));
    const taxAmount = Number((order.grandTotal - subtotal).toFixed(2));

    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      tenantId: currentTenantId,
      invoiceNumber: `${currentTenant.invoicePrefix}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      customerMobile: order.customerMobile,
      customerAddress: order.customerAddress,
      items: order.items,
      subtotal,
      taxAmount,
      discount: 0,
      depositAmount: order.bottleDepositAmount,
      total: order.grandTotal,
      paidAmount: order.paidAmount,
      balanceAmount: order.grandTotal - order.paidAmount,
      status: order.paidAmount >= order.grandTotal ? 'Paid' : order.paidAmount > 0 ? 'Partial' : 'Unpaid',
      dueDate: order.scheduledDate,
      invoiceDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  // Expenses (PRD Section 32)
  const addExpense = (expData: Omit<Expense, 'id' | 'tenantId' | 'createdAt'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp_${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  // Daily Closing (PRD Section 33)
  const performDailyClosing = (closingData: { cashInHand: number; auditNotes?: string }) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate metrics for today
    const todayPayments = payments.filter(p => p.tenantId === currentTenantId && p.paymentDate === today);
    const totalCollections = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const cashCollections = todayPayments.filter(p => p.paymentMethod === 'Cash').reduce((s, p) => s + p.amount, 0);
    const upiCollections = todayPayments.filter(p => p.paymentMethod === 'UPI').reduce((s, p) => s + p.amount, 0);
    const bankCollections = todayPayments.filter(p => p.paymentMethod === 'Bank Transfer').reduce((s, p) => s + p.amount, 0);

    const todayExpensesList = expenses.filter(e => e.tenantId === currentTenantId && e.date === today);
    const totalExpensesAmount = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);

    const todayOrdersList = orders.filter(o => o.tenantId === currentTenantId && o.scheduledDate === today);
    const totalSalesAmount = todayOrdersList.reduce((sum, o) => sum + o.grandTotal, 0);

    const todayDeliveriesList = deliveries.filter(d => d.tenantId === currentTenantId && d.deliveryDate === today);
    const completedDel = todayDeliveriesList.filter(d => d.status === 'Delivered').length;
    const failedDel = todayDeliveriesList.filter(d => d.status === 'Failed').length;

    const todayProduction = productionRecords.filter(p => p.tenantId === currentTenantId && p.date === today);
    const producedBottles = todayProduction.reduce((sum, p) => sum + p.netQuantity, 0);
    const returnedBottles = todayDeliveriesList.reduce((sum, d) => sum + (d.collectedEmptyBottles || 0), 0);

    const newClosing: DailyClosing = {
      id: `close_${today.replace(/-/g, '')}`,
      tenantId: currentTenantId,
      date: today,
      closedBy: currentUser.name,
      totalSales: totalSalesAmount,
      totalCollections,
      totalExpenses: totalExpensesAmount,
      netCashFlow: totalCollections - totalExpensesAmount,
      deliveriesCount: todayDeliveriesList.length,
      completedDeliveries: completedDel,
      failedDeliveries: failedDel,
      producedBottles,
      returnedBottles,
      damagedBottles: 0,
      lostBottles: 0,
      cashInHand: closingData.cashInHand || cashCollections,
      upiCollections,
      bankCollections,
      status: 'Closed',
      auditNotes: closingData.auditNotes,
      closedAt: new Date().toISOString()
    };

    setDailyClosings(prev => [newClosing, ...prev]);

    // Audit Log for day closing lock
    setAuditLogs(prev => [{
      id: `audit_${Date.now()}`,
      tenantId: currentTenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'DAILY_CLOSING_LOCKED',
      entityType: 'DailyClosing',
      entityId: newClosing.id,
      details: `Day ${today} closed and locked. Sales: ₹${totalSalesAmount}, Collections: ₹${totalCollections}, Net: ₹${totalCollections - totalExpensesAmount}`,
      timestamp: new Date().toISOString()
    }, ...prev]);

    return {
      success: true,
      message: `Business Day ${today} closed & locked successfully. Total Collections: ₹${totalCollections}`
    };
  };

  // Offline Sync simulation (PRD Section 39)
  const syncOfflineData = () => {
    setDeliveries(prev => prev.map(d => d.syncStatus === 'pending' ? { ...d, syncStatus: 'synced' } : d));
    setOfflineQueue([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const upgradePlan = (plan: SubscriptionPlan) => {
    setTenants(prev => prev.map(t => t.id === currentTenantId ? {
      ...t,
      plan,
      subscriptionStatus: 'ACTIVE',
      trialDaysLeft: 0
    } : t));
  };

  const renewSubscription = (
    plan: SubscriptionPlan,
    duration: SubscriptionDuration,
    paymentMethod: PaymentMethod,
    paymentReference?: string
  ) => {
    // Base monthly rate
    const baseRates: Record<SubscriptionPlan, number> = {
      Starter: 1499,
      Growth: 3499,
      Business: 7999,
      Enterprise: 14999
    };

    const monthlyRate = baseRates[plan] || 3499;
    const baseTotal = monthlyRate * duration;
    
    // Discount: 1 mo = 0%, 6 mo = 15%, 12 mo = 25%
    let discountPct = 0;
    if (duration === 6) discountPct = 0.15;
    if (duration === 12) discountPct = 0.25;

    const discountApplied = Math.round(baseTotal * discountPct);
    const amountPaid = baseTotal - discountApplied;

    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const expDateObj = new Date(now);
    expDateObj.setMonth(expDateObj.getMonth() + duration);
    const expiryDate = expDateObj.toISOString().split('T')[0];

    const invoiceNumber = `INV-SUB-${now.getFullYear()}-${String(subscriptionHistory.length + 1).padStart(4, '0')}`;
    const ref = paymentReference || `PAY-${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const newRecord: SubscriptionRecord = {
      id: `sub_rec_${Date.now()}`,
      tenantId: currentTenantId,
      plan,
      durationMonths: duration,
      amountPaid,
      discountApplied,
      startDate,
      expiryDate,
      paymentMethod,
      paymentReference: ref,
      invoiceNumber,
      status: 'Active',
      createdAt: now.toISOString()
    };

    setSubscriptionHistory(prev => [newRecord, ...prev]);

    // Update tenant profile
    setTenants(prev => prev.map(t => t.id === currentTenantId ? {
      ...t,
      plan,
      subscriptionStatus: 'ACTIVE',
      subscriptionDuration: duration,
      subscriptionExpiryDate: expiryDate,
      trialDaysLeft: 0
    } : t));

    // Also sync with Firestore
    FirestoreTenantService.updateSubscription(currentTenantId, plan, duration, newRecord);

    // Add Audit Log
    setAuditLogs(prev => [{
      id: `audit_${Date.now()}`,
      tenantId: currentTenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'SUBSCRIPTION_RENEWED',
      entityType: 'Subscription',
      entityId: newRecord.id,
      details: `Renewed ${plan} plan for ${duration} Month(s) - Paid ₹${amountPaid} via ${paymentMethod} (${ref})`,
      timestamp: now.toISOString()
    }, ...prev]);

    // Add Notification
    setNotifications(prev => [{
      id: `notif_${Date.now()}`,
      tenantId: currentTenantId,
      title: '🎉 Subscription Active & Renewed!',
      message: `Your ${plan} Plan has been activated for ${duration} Month(s) valid until ${expiryDate}.`,
      type: 'system',
      targetRole: 'owner',
      read: false,
      timestamp: now.toISOString()
    }, ...prev]);

    return { success: true, record: newRecord };
  };

  // Real-time KPI calculations
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.tenantId === currentTenantId && o.scheduledDate === today);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  const todayPayments = payments.filter(p => p.tenantId === currentTenantId && p.paymentDate === today);
  const todayCollections = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const todayExpenses = expenses.filter(e => e.tenantId === currentTenantId && e.date === today).reduce((sum, e) => sum + e.amount, 0);

  const tenantCustomers = customers.filter(c => c.tenantId === currentTenantId);
  const totalOutstanding = tenantCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalBottlesWithCustomers = tenantCustomers.reduce((sum, c) => sum + c.bottleBalance, 0);

  const tenantProducts = products.filter(p => p.tenantId === currentTenantId);
  const totalFilledStock = tenantProducts.reduce((sum, p) => sum + p.stockCount, 0);
  const totalEmptyStock = tenantProducts.reduce((sum, p) => sum + p.emptyBottleCount, 0);

  const tenantDeliveries = deliveries.filter(d => d.tenantId === currentTenantId && d.deliveryDate === today);
  const todayCompletedDeliveries = tenantDeliveries.filter(d => d.status === 'Delivered').length;
  const todayPendingDeliveries = tenantDeliveries.filter(d => d.status === 'Pending' || d.status === 'In Transit').length;
  const todayFailedDeliveries = tenantDeliveries.filter(d => d.status === 'Failed').length;

  const todayProducedJars = productionRecords
    .filter(p => p.tenantId === currentTenantId && p.date === today)
    .reduce((sum, p) => sum + p.netQuantity, 0);

  const metrics = {
    todaySales: todaySales || 24500,
    todayCollections: todayCollections || 19200,
    todayExpenses: todayExpenses || 1200,
    totalOutstanding: totalOutstanding || 124500,
    totalFilledStock: totalFilledStock || 1240,
    totalEmptyStock: totalEmptyStock || 580,
    totalBottlesWithCustomers: totalBottlesWithCustomers || 146,
    totalDamagedBottles: 12,
    todayCompletedDeliveries: todayCompletedDeliveries || 42,
    todayPendingDeliveries: todayPendingDeliveries || 8,
    todayFailedDeliveries: todayFailedDeliveries || 2,
    todayProducedJars: todayProducedJars || 492
  };

  return (
    <AppContext.Provider value={{
      currentTenant,
      currentUser,
      tenants,
      users,
      switchTenant,
      switchRole,
      switchUser,
      updateTenantInfo,

      activeTab,
      setActiveTab,
      isMobileSimulator,
      setIsMobileSimulator,
      isOfflineMode,
      setIsOfflineMode,
      offlineQueueCount: offlineQueue.length,
      syncOfflineData,

      customers: tenantCustomers,
      products: tenantProducts,
      orders: orders.filter(o => o.tenantId === currentTenantId),
      recurringSchedules: recurringSchedules.filter(r => r.tenantId === currentTenantId),
      deliveries: deliveries.filter(d => d.tenantId === currentTenantId),
      bottleLedger: bottleLedger.filter(b => b.tenantId === currentTenantId),
      stockLedger: stockLedger.filter(s => s.tenantId === currentTenantId),
      productionRecords: productionRecords.filter(p => p.tenantId === currentTenantId),
      payments: payments.filter(p => p.tenantId === currentTenantId),
      invoices: invoices.filter(i => i.tenantId === currentTenantId),
      expenses: expenses.filter(e => e.tenantId === currentTenantId),
      dailyClosings: dailyClosings.filter(c => c.tenantId === currentTenantId),
      notifications: notifications.filter(n => n.tenantId === currentTenantId),
      auditLogs: auditLogs.filter(a => a.tenantId === currentTenantId),

      addCustomer,
      updateCustomer,
      deleteCustomer,

      addProduct,
      updateProduct,

      createOrder,
      updateOrderStatus,
      createRecurringSchedule,
      toggleRecurringSchedule,
      generateDailyDeliveriesFromRecurring,

      startDelivery,
      completeDelivery,
      recordFailedDelivery,
      assignDeliveryEmployee,

      addProductionRecord,

      recordBottleAdjustment,
      recordStockAdjustment,

      recordPayment,
      generateInvoiceForOrder,
      addExpense,

      performDailyClosing,
      isTodayClosed,

      markNotificationRead,
      upgradePlan,
      renewSubscription,
      subscriptionHistory: subscriptionHistory.filter(s => s.tenantId === currentTenantId),

      metrics
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
