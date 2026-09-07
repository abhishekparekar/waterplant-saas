export const ROUTES = {
  // Auth
  LOGIN: '/(auth)/login' as const,
  REGISTER: '/(auth)/register' as const,
  
  // Owner Routes
  OWNER: {
    DASHBOARD: '/(owner)/dashboard' as const,
    CUSTOMERS: '/(owner)/customers' as const,
    ORDERS: '/(owner)/orders' as const,
    DELIVERIES: '/(owner)/deliveries' as const,
    BILLING: '/(owner)/billing' as const,
    INVENTORY: '/(owner)/inventory' as const,
    EXPENSES: '/(owner)/expenses' as const,
    REPORTS: '/(owner)/reports' as const,
    LOAD_UNLOAD: '/(owner)/load-unload' as const,
    MONTHLY_CARDS: '/(owner)/monthly-cards' as const,
    EVENT_ORDERS: '/(owner)/event-orders' as const,
    TRANSACTIONS: '/(owner)/transactions' as const,
    PRODUCTS_IN_USE: '/(owner)/products-in-use' as const,
    STAFF: '/(owner)/add-helper' as const,
    LOCATE: '/(owner)/locate-live' as const,
    RECHARGE: '/(owner)/recharge' as const,
    TUTORIALS: '/(owner)/tutorials' as const,
    PLANT_SETTINGS: '/(owner)/plant-settings' as const,
    PROFILE: '/(owner)/profile' as const,
  },

  // Helper Routes
  HELPER: {
    DASHBOARD: '/(helper)/dashboard' as const,
    DELIVERIES: '/(helper)/deliveries' as const,
    ADD_CUSTOMER: '/(helper)/add-customer' as const,
    PROFILE: '/(helper)/profile' as const,
  },

  // Customer Routes
  CUSTOMER: {
    DASHBOARD: '/(customer)/dashboard' as const,
    HISTORY: '/(customer)/history' as const,
  },

  // Super Admin SaaS Platform Routes
  ADMIN: {
    DASHBOARD: '/(admin)/dashboard' as const,
    PLANS: '/(admin)/plans' as const,
    REPORTS: '/(admin)/reports' as const,
    ANALYTICS: '/(admin)/analytics' as const,
    PROFILE: '/(admin)/profile' as const,
    TENANTS: '/(admin)/tenants' as const,
  },

  // Order Details / Edit
  ORDER: {
    CREATE: '/order/create' as const,
    DETAIL: (id: string) => `/order/${id}` as const,
  }
};

