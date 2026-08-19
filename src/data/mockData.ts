import { 
  Tenant, 
  UserProfile, 
  Product, 
  Customer, 
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
  AuditLog 
} from '../types';

export const initialTenants: Tenant[] = [
  {
    id: 'tenant_apw_001',
    name: 'Abhi Pure Water Pvt Ltd',
    ownerName: 'Abhishek Sharma',
    mobile: '+91 98220 12345',
    email: 'contact@abhipurewater.com',
    businessType: 'Packaged Drinking Water & 20L Jar Plant',
    address: 'Plot 42, MIDC Waluj Industrial Area',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431136',
    gstin: '27AABCA1234F1Z8',
    workingHours: '06:00 AM - 08:00 PM',
    currency: '₹',
    invoicePrefix: 'APW',
    plan: 'Growth',
    subscriptionStatus: 'TRIAL',
    trialDaysLeft: 11,
    createdAt: '2026-08-08T06:00:00.000Z'
  },
  {
    id: 'tenant_kailash_002',
    name: 'Kailash Aqua Springs',
    ownerName: 'Kailash Patil',
    mobile: '+91 94231 99881',
    email: 'kailash@aquasprings.in',
    businessType: '20L Jar Delivery Supplier',
    address: 'Near CBS, Jalna Road',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431001',
    gstin: '27XYZAB9876Q1Z2',
    workingHours: '06:30 AM - 07:00 PM',
    currency: '₹',
    invoicePrefix: 'KAS',
    plan: 'Starter',
    subscriptionStatus: 'ACTIVE',
    trialDaysLeft: 0,
    createdAt: '2026-06-15T06:00:00.000Z'
  }
];

export const initialUsers: UserProfile[] = [
  {
    id: 'user_owner_01',
    tenantId: 'tenant_apw_001',
    name: 'Abhishek Sharma (Owner)',
    email: 'abhishek@abhipurewater.com',
    mobile: '+91 98220 12345',
    role: 'owner',
    active: true,
    joiningDate: '2025-01-01',
    performance: {
      totalDeliveries: 0,
      completedDeliveries: 0,
      failedDeliveries: 0,
      totalCollected: 0,
      bottlesCollected: 0
    }
  },
  {
    id: 'user_manager_01',
    tenantId: 'tenant_apw_001',
    name: 'Suresh Verma (Manager)',
    email: 'suresh@abhipurewater.com',
    mobile: '+91 98901 22334',
    role: 'manager',
    active: true,
    joiningDate: '2025-03-15',
    performance: {
      totalDeliveries: 0,
      completedDeliveries: 0,
      failedDeliveries: 0,
      totalCollected: 0,
      bottlesCollected: 0
    }
  },
  {
    id: 'user_delivery_01',
    tenantId: 'tenant_apw_001',
    name: 'Rahul Pawar',
    email: 'rahul.delivery@abhipurewater.com',
    mobile: '+91 97654 88771',
    role: 'delivery',
    active: true,
    assignedRoute: 'Zone 1: CIDCO & HUDCO Sector',
    joiningDate: '2025-06-01',
    performance: {
      totalDeliveries: 42,
      completedDeliveries: 40,
      failedDeliveries: 2,
      totalCollected: 18500,
      bottlesCollected: 125
    }
  },
  {
    id: 'user_delivery_02',
    tenantId: 'tenant_apw_001',
    name: 'Vikas Shinde',
    email: 'vikas.delivery@abhipurewater.com',
    mobile: '+91 91234 55677',
    role: 'delivery',
    active: true,
    assignedRoute: 'Zone 2: Waluj & Station Road',
    joiningDate: '2025-07-10',
    performance: {
      totalDeliveries: 38,
      completedDeliveries: 36,
      failedDeliveries: 2,
      totalCollected: 14200,
      bottlesCollected: 98
    }
  },
  {
    id: 'user_office_01',
    tenantId: 'tenant_apw_001',
    name: 'Pooja Kulkarni (Accounts & Sales)',
    email: 'pooja@abhipurewater.com',
    mobile: '+91 94222 66554',
    role: 'office',
    active: true,
    joiningDate: '2025-04-10'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod_20l_jar',
    tenantId: 'tenant_apw_001',
    name: '20L Packaged Drinking Water Jar',
    sku: 'APW-20L-JAR',
    category: '20L Jar',
    unit: 'Jar',
    sellingPrice: 35,
    purchasePrice: 12,
    bottleDeposit: 150,
    taxRate: 18,
    active: true,
    stockCount: 1240,
    emptyBottleCount: 460,
    createdAt: '2026-01-01'
  },
  {
    id: 'prod_10l_jar',
    tenantId: 'tenant_apw_001',
    name: '10L Handle Jar',
    sku: 'APW-10L-JAR',
    category: '10L Jar',
    unit: 'Jar',
    sellingPrice: 25,
    purchasePrice: 9,
    bottleDeposit: 100,
    taxRate: 18,
    active: true,
    stockCount: 310,
    emptyBottleCount: 120,
    createdAt: '2026-01-01'
  },
  {
    id: 'prod_1l_box',
    tenantId: 'tenant_apw_001',
    name: '1 Litre Bottles (Box of 12)',
    sku: 'APW-1L-BOX12',
    category: 'Bottled Water',
    unit: 'Box',
    sellingPrice: 140,
    purchasePrice: 85,
    bottleDeposit: 0,
    taxRate: 18,
    active: true,
    stockCount: 520,
    emptyBottleCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'prod_500ml_box',
    tenantId: 'tenant_apw_001',
    name: '500ml Bottles (Box of 24)',
    sku: 'APW-500M-BOX24',
    category: 'Bottled Water',
    unit: 'Box',
    sellingPrice: 160,
    purchasePrice: 95,
    bottleDeposit: 0,
    taxRate: 18,
    active: true,
    stockCount: 410,
    emptyBottleCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'prod_dispenser_stand',
    tenantId: 'tenant_apw_001',
    name: 'Heavy Duty Metal Jar Stand + Tap',
    sku: 'APW-ACC-STAND',
    category: 'Dispenser',
    unit: 'Piece',
    sellingPrice: 280,
    purchasePrice: 180,
    bottleDeposit: 0,
    taxRate: 18,
    active: true,
    stockCount: 85,
    emptyBottleCount: 0,
    createdAt: '2026-01-01'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust_001',
    tenantId: 'tenant_apw_001',
    name: 'ABC Software Hub & BPO',
    mobile: '+91 98221 00112',
    alternateMobile: '+91 98221 00113',
    email: 'admin@abcsoftware.com',
    customerType: 'Office',
    address: '4th Floor, IT Park, Chikalthana MIDC',
    city: 'Chhatrapati Sambhajinagar',
    pincode: '431006',
    defaultProductId: 'prod_20l_jar',
    defaultPrice: 35,
    bottleDeposit: 1500, // 10 jars deposit
    creditLimit: 15000,
    paymentTerms: 'Monthly Billing (1st-5th)',
    bottleBalance: 22, // 22 jars currently held
    outstandingBalance: 4200,
    totalSalesAmount: 38500,
    totalPaidAmount: 34300,
    status: 'Active',
    createdAt: '2026-02-01',
    updatedAt: '2026-08-19'
  },
  {
    id: 'cust_002',
    tenantId: 'tenant_apw_001',
    name: 'Hotel Grand Heritage',
    mobile: '+91 94231 44556',
    email: 'purchases@grandheritage.in',
    customerType: 'Hotel',
    address: 'Opp. Railway Station, Samarth Nagar',
    city: 'Chhatrapati Sambhajinagar',
    pincode: '431001',
    defaultProductId: 'prod_20l_jar',
    defaultPrice: 32,
    bottleDeposit: 3000,
    creditLimit: 25000,
    paymentTerms: '15 Days Credit',
    bottleBalance: 35,
    outstandingBalance: 12800,
    totalSalesAmount: 64000,
    totalPaidAmount: 51200,
    status: 'Active',
    createdAt: '2026-02-10',
    updatedAt: '2026-08-19'
  },
  {
    id: 'cust_003',
    tenantId: 'tenant_apw_001',
    name: 'Dr. Deshmukh Memorial Hospital',
    mobile: '+91 98900 77112',
    customerType: 'Hospital',
    address: 'Near Jalna Road Flyover, N-3 CIDCO',
    city: 'Chhatrapati Sambhajinagar',
    pincode: '431003',
    defaultProductId: 'prod_20l_jar',
    defaultPrice: 35,
    bottleDeposit: 2250,
    creditLimit: 20000,
    paymentTerms: 'Weekly Settlement',
    bottleBalance: 28,
    outstandingBalance: 6500,
    totalSalesAmount: 48000,
    totalPaidAmount: 41500,
    status: 'Active',
    createdAt: '2026-03-01',
    updatedAt: '2026-08-19'
  },
  {
    id: 'cust_004',
    tenantId: 'tenant_apw_001',
    name: 'Anand Residency Apt 402 (Sharma Family)',
    mobile: '+91 97654 33221',
    customerType: 'Home',
    address: 'Flat 402, Anand Residency, Ulkanagari',
    city: 'Chhatrapati Sambhajinagar',
    pincode: '431005',
    defaultProductId: 'prod_20l_jar',
    defaultPrice: 40,
    bottleDeposit: 300,
    creditLimit: 1000,
    paymentTerms: 'Cash / UPI on Delivery',
    bottleBalance: 2,
    outstandingBalance: 0,
    totalSalesAmount: 3200,
    totalPaidAmount: 3200,
    status: 'Active',
    createdAt: '2026-04-15',
    updatedAt: '2026-08-19'
  },
  {
    id: 'cust_005',
    tenantId: 'tenant_apw_001',
    name: 'Dnyandeep High School & Junior College',
    mobile: '+91 94227 11223',
    customerType: 'School',
    address: 'Sector 5, TV Centre, HUDCO',
    city: 'Chhatrapati Sambhajinagar',
    pincode: '431003',
    defaultProductId: 'prod_20l_jar',
    defaultPrice: 30,
    bottleDeposit: 4500,
    creditLimit: 30000,
    paymentTerms: 'Monthly Cheque',
    bottleBalance: 45,
    outstandingBalance: 18500,
    totalSalesAmount: 72000,
    totalPaidAmount: 53500,
    status: 'Active',
    createdAt: '2026-01-20',
    updatedAt: '2026-08-19'
  },
  {
    id: 'cust_006',
    tenantId: 'tenant_apw_001',
    name: 'Spicy Treats Restaurant & Caterers',
    mobile: '+91 98230 44991',
    customerType: 'Restaurant',
    address: 'Shop 12-14, Cannaught Place, CIDCO',
    city: 'Chhatrapati Sambhajinagar',
    pincode: '431003',
    defaultProductId: 'prod_20l_jar',
    defaultPrice: 32,
    bottleDeposit: 1500,
    creditLimit: 10000,
    paymentTerms: 'Weekly Settlement',
    bottleBalance: 14,
    outstandingBalance: 3200,
    totalSalesAmount: 26000,
    totalPaidAmount: 22800,
    status: 'Active',
    createdAt: '2026-03-25',
    updatedAt: '2026-08-19'
  }
];

export const initialRecurringSchedules: RecurringSchedule[] = [
  {
    id: 'rec_001',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_001',
    customerName: 'ABC Software Hub & BPO',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    quantity: 10,
    frequency: 'Weekdays',
    selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    preferredTimeSlot: '08:30 AM - 10:00 AM',
    startDate: '2026-02-01',
    active: true,
    nextRunDate: '2026-08-20',
    notes: 'Drop at 4th floor reception pantry'
  },
  {
    id: 'rec_002',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_002',
    customerName: 'Hotel Grand Heritage',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    quantity: 15,
    frequency: 'Daily',
    preferredTimeSlot: '07:00 AM - 08:30 AM',
    startDate: '2026-02-10',
    active: true,
    nextRunDate: '2026-08-20',
    notes: 'Kitchen backdoor delivery'
  },
  {
    id: 'rec_003',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_004',
    customerName: 'Anand Residency Apt 402 (Sharma Family)',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    quantity: 1,
    frequency: 'Alternate Days',
    preferredTimeSlot: '09:00 AM - 11:00 AM',
    startDate: '2026-04-15',
    active: true,
    nextRunDate: '2026-08-21',
    notes: 'Ring the doorbell twice'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord_001',
    tenantId: 'tenant_apw_001',
    orderNumber: 'ORD-20260819-01',
    customerId: 'cust_001',
    customerName: 'ABC Software Hub & BPO',
    customerMobile: '+91 98221 00112',
    customerAddress: '4th Floor, IT Park, Chikalthana MIDC',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 10,
        deliveredQuantity: 10,
        unitPrice: 35,
        bottleDeposit: 0,
        taxRate: 18,
        total: 350
      }
    ],
    totalAmount: 350,
    bottleDepositAmount: 0,
    grandTotal: 350,
    paidAmount: 350,
    status: 'Delivered',
    orderType: 'Recurring',
    recurringId: 'rec_001',
    assignedEmployeeId: 'user_delivery_01',
    assignedEmployeeName: 'Rahul Pawar',
    scheduledDate: '2026-08-19',
    deliveredDate: '2026-08-19T09:15:00.000Z',
    createdAt: '2026-08-19T06:00:00.000Z'
  },
  {
    id: 'ord_002',
    tenantId: 'tenant_apw_001',
    orderNumber: 'ORD-20260819-02',
    customerId: 'cust_002',
    customerName: 'Hotel Grand Heritage',
    customerMobile: '+91 94231 44556',
    customerAddress: 'Opp. Railway Station, Samarth Nagar',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 15,
        deliveredQuantity: 15,
        unitPrice: 32,
        bottleDeposit: 0,
        taxRate: 18,
        total: 480
      },
      {
        productId: 'prod_1l_box',
        productName: '1 Litre Bottles (Box of 12)',
        quantity: 2,
        deliveredQuantity: 2,
        unitPrice: 140,
        bottleDeposit: 0,
        taxRate: 18,
        total: 280
      }
    ],
    totalAmount: 760,
    bottleDepositAmount: 0,
    grandTotal: 760,
    paidAmount: 760,
    status: 'Delivered',
    orderType: 'Recurring',
    recurringId: 'rec_002',
    assignedEmployeeId: 'user_delivery_01',
    assignedEmployeeName: 'Rahul Pawar',
    scheduledDate: '2026-08-19',
    deliveredDate: '2026-08-19T08:10:00.000Z',
    createdAt: '2026-08-19T06:00:00.000Z'
  },
  {
    id: 'ord_003',
    tenantId: 'tenant_apw_001',
    orderNumber: 'ORD-20260819-03',
    customerId: 'cust_003',
    customerName: 'Dr. Deshmukh Memorial Hospital',
    customerMobile: '+91 98900 77112',
    customerAddress: 'Near Jalna Road Flyover, N-3 CIDCO',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 8,
        deliveredQuantity: 0,
        unitPrice: 35,
        bottleDeposit: 0,
        taxRate: 18,
        total: 280
      }
    ],
    totalAmount: 280,
    bottleDepositAmount: 0,
    grandTotal: 280,
    paidAmount: 0,
    status: 'Out for Delivery',
    orderType: 'One-Time',
    assignedEmployeeId: 'user_delivery_01',
    assignedEmployeeName: 'Rahul Pawar',
    scheduledDate: '2026-08-19',
    createdAt: '2026-08-19T07:30:00.000Z'
  },
  {
    id: 'ord_004',
    tenantId: 'tenant_apw_001',
    orderNumber: 'ORD-20260819-04',
    customerId: 'cust_006',
    customerName: 'Spicy Treats Restaurant & Caterers',
    customerMobile: '+91 98230 44991',
    customerAddress: 'Shop 12-14, Cannaught Place, CIDCO',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 6,
        deliveredQuantity: 0,
        unitPrice: 32,
        bottleDeposit: 0,
        taxRate: 18,
        total: 192
      }
    ],
    totalAmount: 192,
    bottleDepositAmount: 0,
    grandTotal: 192,
    paidAmount: 0,
    status: 'Pending',
    orderType: 'One-Time',
    assignedEmployeeId: 'user_delivery_02',
    assignedEmployeeName: 'Vikas Shinde',
    scheduledDate: '2026-08-19',
    createdAt: '2026-08-19T08:00:00.000Z'
  }
];

export const initialDeliveries: Delivery[] = [
  {
    id: 'del_001',
    tenantId: 'tenant_apw_001',
    orderId: 'ord_001',
    orderNumber: 'ORD-20260819-01',
    customerId: 'cust_001',
    customerName: 'ABC Software Hub & BPO',
    customerMobile: '+91 98221 00112',
    customerAddress: '4th Floor, IT Park, Chikalthana MIDC',
    assignedEmployeeId: 'user_delivery_01',
    assignedEmployeeName: 'Rahul Pawar',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 10,
        deliveredQuantity: 10,
        unitPrice: 35,
        bottleDeposit: 0,
        taxRate: 18,
        total: 350
      }
    ],
    orderedQuantity: 10,
    deliveredQuantity: 10,
    expectedEmptyBottles: 8,
    collectedEmptyBottles: 8,
    amountToCollect: 350,
    collectedAmount: 350,
    paymentMethod: 'UPI',
    paymentReference: 'UPI-REF-998822',
    status: 'Delivered',
    deliveryDate: '2026-08-19',
    startedAt: '2026-08-19T08:45:00.000Z',
    completedAt: '2026-08-19T09:15:00.000Z',
    syncStatus: 'synced',
    deliveryNotes: 'Received by Pantry supervisor Mr. Amit'
  },
  {
    id: 'del_002',
    tenantId: 'tenant_apw_001',
    orderId: 'ord_002',
    orderNumber: 'ORD-20260819-02',
    customerId: 'cust_002',
    customerName: 'Hotel Grand Heritage',
    customerMobile: '+91 94231 44556',
    customerAddress: 'Opp. Railway Station, Samarth Nagar',
    assignedEmployeeId: 'user_delivery_01',
    assignedEmployeeName: 'Rahul Pawar',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 15,
        deliveredQuantity: 15,
        unitPrice: 32,
        bottleDeposit: 0,
        taxRate: 18,
        total: 480
      }
    ],
    orderedQuantity: 15,
    deliveredQuantity: 15,
    expectedEmptyBottles: 15,
    collectedEmptyBottles: 15,
    amountToCollect: 760,
    collectedAmount: 760,
    paymentMethod: 'Cash',
    status: 'Delivered',
    deliveryDate: '2026-08-19',
    startedAt: '2026-08-19T07:45:00.000Z',
    completedAt: '2026-08-19T08:10:00.000Z',
    syncStatus: 'synced',
    deliveryNotes: 'Cash handed by head chef'
  },
  {
    id: 'del_003',
    tenantId: 'tenant_apw_001',
    orderId: 'ord_003',
    orderNumber: 'ORD-20260819-03',
    customerId: 'cust_003',
    customerName: 'Dr. Deshmukh Memorial Hospital',
    customerMobile: '+91 98900 77112',
    customerAddress: 'Near Jalna Road Flyover, N-3 CIDCO',
    assignedEmployeeId: 'user_delivery_01',
    assignedEmployeeName: 'Rahul Pawar',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 8,
        unitPrice: 35,
        bottleDeposit: 0,
        taxRate: 18,
        total: 280
      }
    ],
    orderedQuantity: 8,
    deliveredQuantity: 0,
    expectedEmptyBottles: 8,
    collectedEmptyBottles: 0,
    amountToCollect: 280,
    collectedAmount: 0,
    status: 'In Transit',
    deliveryDate: '2026-08-19',
    startedAt: '2026-08-19T10:00:00.000Z',
    syncStatus: 'synced'
  },
  {
    id: 'del_004',
    tenantId: 'tenant_apw_001',
    orderId: 'ord_004',
    orderNumber: 'ORD-20260819-04',
    customerId: 'cust_006',
    customerName: 'Spicy Treats Restaurant & Caterers',
    customerMobile: '+91 98230 44991',
    customerAddress: 'Shop 12-14, Cannaught Place, CIDCO',
    assignedEmployeeId: 'user_delivery_02',
    assignedEmployeeName: 'Vikas Shinde',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 6,
        unitPrice: 32,
        bottleDeposit: 0,
        taxRate: 18,
        total: 192
      }
    ],
    orderedQuantity: 6,
    deliveredQuantity: 0,
    expectedEmptyBottles: 6,
    collectedEmptyBottles: 0,
    amountToCollect: 192,
    collectedAmount: 0,
    status: 'Pending',
    deliveryDate: '2026-08-19',
    syncStatus: 'synced'
  }
];

export const initialBottleLedger: BottleLedger[] = [
  {
    id: 'bot_led_001',
    tenantId: 'tenant_apw_001',
    movementType: 'Plant Produced',
    quantity: 500,
    previousBalance: 740,
    newBalance: 1240,
    balanceCategory: 'At Plant Filled',
    notes: 'Morning shift batch #BAT-20260819-01 bottling',
    timestamp: '2026-08-19T07:00:00.000Z'
  },
  {
    id: 'bot_led_002',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_001',
    customerName: 'ABC Software Hub & BPO',
    employeeId: 'user_delivery_01',
    employeeName: 'Rahul Pawar',
    deliveryId: 'del_001',
    movementType: 'Delivered to Customer',
    quantity: 10,
    previousBalance: 20,
    newBalance: 30,
    balanceCategory: 'With Customer',
    notes: 'Delivered 10 filled 20L jars',
    timestamp: '2026-08-19T09:15:00.000Z'
  },
  {
    id: 'bot_led_003',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_001',
    customerName: 'ABC Software Hub & BPO',
    employeeId: 'user_delivery_01',
    employeeName: 'Rahul Pawar',
    deliveryId: 'del_001',
    movementType: 'Empty Returned from Customer',
    quantity: -8,
    previousBalance: 30,
    newBalance: 22,
    balanceCategory: 'With Customer',
    notes: 'Collected 8 empty 20L jars',
    timestamp: '2026-08-19T09:15:00.000Z'
  },
  {
    id: 'bot_led_004',
    tenantId: 'tenant_apw_001',
    movementType: 'Damaged at Plant',
    quantity: -8,
    previousBalance: 468,
    newBalance: 460,
    balanceCategory: 'Damaged',
    notes: 'Cracked rim during pressure wash',
    timestamp: '2026-08-19T06:30:00.000Z'
  }
];

export const initialStockLedger: StockLedger[] = [
  {
    id: 'stk_led_001',
    tenantId: 'tenant_apw_001',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    category: 'Filled Bottles',
    transactionType: 'Opening',
    quantityChange: 748,
    previousStock: 0,
    newStock: 748,
    reason: 'Day start physical count',
    operator: 'Suresh Verma',
    timestamp: '2026-08-19T06:00:00.000Z'
  },
  {
    id: 'stk_led_002',
    tenantId: 'tenant_apw_001',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    category: 'Filled Bottles',
    transactionType: 'Production',
    quantityChange: 492,
    previousStock: 748,
    newStock: 1240,
    referenceId: 'prod_rec_001',
    reason: 'Morning Shift RO Output Batch BAT-01',
    operator: 'Ramesh Operator',
    timestamp: '2026-08-19T07:15:00.000Z'
  },
  {
    id: 'stk_led_003',
    tenantId: 'tenant_apw_001',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    category: 'Filled Bottles',
    transactionType: 'Delivery Dispatch',
    quantityChange: -25,
    previousStock: 1265,
    newStock: 1240,
    referenceId: 'del_001, del_002',
    reason: 'Route 1 Dispatched orders',
    operator: 'Rahul Pawar',
    timestamp: '2026-08-19T07:45:00.000Z'
  }
];

export const initialProduction: ProductionRecord[] = [
  {
    id: 'prod_rec_001',
    tenantId: 'tenant_apw_001',
    batchNumber: 'BAT-20260819-01',
    date: '2026-08-19',
    shift: 'Morning',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    quantityProduced: 500,
    damagedQuantity: 8,
    netQuantity: 492,
    waterSourceTDS: 680,
    purifiedTDS: 85,
    operator: 'Ramesh G. (Plant Op)',
    notes: 'All filters sanitized, UV & Ozone chamber operating optimal',
    createdAt: '2026-08-19T07:15:00.000Z'
  },
  {
    id: 'prod_rec_002',
    tenantId: 'tenant_apw_001',
    batchNumber: 'BAT-20260818-02',
    date: '2026-08-18',
    shift: 'Afternoon',
    productId: 'prod_20l_jar',
    productName: '20L Packaged Drinking Water Jar',
    quantityProduced: 350,
    damagedQuantity: 4,
    netQuantity: 346,
    waterSourceTDS: 690,
    purifiedTDS: 82,
    operator: 'Anil K.',
    notes: 'Secondary line maintenance completed',
    createdAt: '2026-08-18T16:00:00.000Z'
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay_001',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_001',
    customerName: 'ABC Software Hub & BPO',
    invoiceId: 'inv_001',
    orderId: 'ord_001',
    amount: 350,
    paymentMethod: 'UPI',
    referenceNumber: 'UPI-REF-998822',
    collectedBy: 'Rahul Pawar',
    paymentDate: '2026-08-19',
    status: 'Completed',
    notes: 'Daily delivery payment collected',
    createdAt: '2026-08-19T09:15:00.000Z'
  },
  {
    id: 'pay_002',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_002',
    customerName: 'Hotel Grand Heritage',
    invoiceId: 'inv_002',
    orderId: 'ord_002',
    amount: 760,
    paymentMethod: 'Cash',
    collectedBy: 'Rahul Pawar',
    paymentDate: '2026-08-19',
    status: 'Completed',
    notes: 'Cash collected by driver',
    createdAt: '2026-08-19T08:10:00.000Z'
  },
  {
    id: 'pay_003',
    tenantId: 'tenant_apw_001',
    customerId: 'cust_005',
    customerName: 'Dnyandeep High School & Junior College',
    amount: 15000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'NEFT-SBI-443900',
    collectedBy: 'Pooja Kulkarni',
    paymentDate: '2026-08-18',
    status: 'Completed',
    notes: 'Part payment against July invoice',
    createdAt: '2026-08-18T14:30:00.000Z'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv_001',
    tenantId: 'tenant_apw_001',
    invoiceNumber: 'APW-2026-0842',
    orderId: 'ord_001',
    customerId: 'cust_001',
    customerName: 'ABC Software Hub & BPO',
    customerMobile: '+91 98221 00112',
    customerAddress: '4th Floor, IT Park, Chikalthana MIDC',
    customerGst: '27AABCS1234F1Z0',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 10,
        unitPrice: 35,
        bottleDeposit: 0,
        taxRate: 18,
        total: 350
      }
    ],
    subtotal: 296.61,
    taxAmount: 53.39,
    discount: 0,
    depositAmount: 0,
    total: 350,
    paidAmount: 350,
    balanceAmount: 0,
    status: 'Paid',
    dueDate: '2026-08-19',
    invoiceDate: '2026-08-19',
    createdAt: '2026-08-19T09:15:00.000Z'
  },
  {
    id: 'inv_002',
    tenantId: 'tenant_apw_001',
    invoiceNumber: 'APW-2026-0841',
    orderId: 'ord_002',
    customerId: 'cust_002',
    customerName: 'Hotel Grand Heritage',
    customerMobile: '+91 94231 44556',
    customerAddress: 'Opp. Railway Station, Samarth Nagar',
    customerGst: '27HGHAB8899K1Z5',
    items: [
      {
        productId: 'prod_20l_jar',
        productName: '20L Packaged Drinking Water Jar',
        quantity: 15,
        unitPrice: 32,
        bottleDeposit: 0,
        taxRate: 18,
        total: 480
      },
      {
        productId: 'prod_1l_box',
        productName: '1 Litre Bottles (Box of 12)',
        quantity: 2,
        unitPrice: 140,
        bottleDeposit: 0,
        taxRate: 18,
        total: 280
      }
    ],
    subtotal: 644.07,
    taxAmount: 115.93,
    discount: 0,
    depositAmount: 0,
    total: 760,
    paidAmount: 760,
    balanceAmount: 0,
    status: 'Paid',
    dueDate: '2026-08-19',
    invoiceDate: '2026-08-19',
    createdAt: '2026-08-19T08:10:00.000Z'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp_001',
    tenantId: 'tenant_apw_001',
    category: 'Fuel',
    amount: 1200,
    date: '2026-08-19',
    description: 'Diesel for Delivery Van MH-20-DE-4412 (Zone 1)',
    paidBy: 'Rahul Pawar',
    paymentMethod: 'UPI',
    createdAt: '2026-08-19T07:30:00.000Z'
  },
  {
    id: 'exp_002',
    tenantId: 'tenant_apw_001',
    category: 'Packaging & Caps',
    amount: 3400,
    date: '2026-08-18',
    description: 'Purchase of 5,000 blue jar seal caps & tamper sleeves',
    paidBy: 'Abhishek Sharma',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-08-18T15:00:00.000Z'
  },
  {
    id: 'exp_003',
    tenantId: 'tenant_apw_001',
    category: 'Repair & Maintenance',
    amount: 850,
    date: '2026-08-17',
    description: 'RO high pressure booster pump seal replacement',
    paidBy: 'Suresh Verma',
    paymentMethod: 'Cash',
    createdAt: '2026-08-17T11:00:00.000Z'
  }
];

export const initialDailyClosings: DailyClosing[] = [
  {
    id: 'close_20260818',
    tenantId: 'tenant_apw_001',
    date: '2026-08-18',
    closedBy: 'Abhishek Sharma',
    totalSales: 24500,
    totalCollections: 21800,
    totalExpenses: 4250,
    netCashFlow: 17550,
    deliveriesCount: 48,
    completedDeliveries: 46,
    failedDeliveries: 2,
    producedBottles: 850,
    returnedBottles: 420,
    damagedBottles: 4,
    lostBottles: 1,
    cashInHand: 6800,
    upiCollections: 15000,
    bankCollections: 0,
    status: 'Closed',
    auditNotes: 'End of day reconciled by Suresh Verma & verified by Owner.',
    closedAt: '2026-08-18T20:30:00.000Z'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_001',
    tenantId: 'tenant_apw_001',
    title: '⚠️ Bottle Overdue Alert',
    message: '35 bottles with Dnyandeep High School are overdue for collection (> 14 days).',
    type: 'bottle',
    targetRole: 'owner',
    read: false,
    timestamp: '2026-08-19T06:30:00.000Z'
  },
  {
    id: 'notif_002',
    tenantId: 'tenant_apw_001',
    title: '🚚 Deliveries Assigned',
    message: '42 deliveries allocated to Rahul Pawar & Vikas Shinde for today.',
    type: 'delivery',
    targetRole: 'delivery',
    read: false,
    timestamp: '2026-08-19T07:00:00.000Z'
  },
  {
    id: 'notif_003',
    tenantId: 'tenant_apw_001',
    title: '💰 Payment Received',
    message: '₹15,000 received from Dnyandeep High School via Bank Transfer.',
    type: 'payment',
    targetRole: 'owner',
    read: true,
    timestamp: '2026-08-18T14:35:00.000Z'
  },
  {
    id: 'notif_004',
    tenantId: 'tenant_apw_001',
    title: '⏳ Trial Status',
    message: '11 days remaining in your Growth Plan trial. Enjoy unlimited operations!',
    type: 'system',
    targetRole: 'owner',
    read: false,
    timestamp: '2026-08-19T06:00:00.000Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit_001',
    tenantId: 'tenant_apw_001',
    userId: 'user_owner_01',
    userName: 'Abhishek Sharma',
    action: 'DAILY_CLOSING_LOCKED',
    entityType: 'DailyClosing',
    entityId: 'close_20260818',
    details: 'Locked day 2026-08-18 with total collections ₹21,800',
    timestamp: '2026-08-18T20:30:00.000Z'
  },
  {
    id: 'audit_002',
    tenantId: 'tenant_apw_001',
    userId: 'user_manager_01',
    userName: 'Suresh Verma',
    action: 'PRODUCTION_BATCH_RECORDED',
    entityType: 'ProductionRecord',
    entityId: 'prod_rec_001',
    details: 'Created batch BAT-20260819-01 producing 492 net 20L jars',
    timestamp: '2026-08-19T07:15:00.000Z'
  }
];
