import { 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { getTenantCollection } from './firebase';

export interface DaySale {
  day: string;
  dateStr: string;
  revenue: number;
  jars: number;
}

export interface CategoryExpenseStat {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardReportSummary {
  totalRevenue: number;
  totalOrders: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  outstandingBalance: number;
}

export interface DetailedReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  outstandingBalance: number;
  totalOrders: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  fulfillmentRate: number;
  totalJarsDelivered: number;
  totalEmptiesCollected: number;
  jarRecoveryRate: number;
  weeklySales: DaySale[];
  categoryExpenses: CategoryExpenseStat[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Vehicle Fuel': '#0284C7',
  'Plant Electricity': '#10B981',
  'Vehicle Maintenance': '#F59E0B',
  'RO Filters & Chemical': '#6366F1',
  'Wages & Driver Pay': '#EC4899',
  'New Jar Purchase': '#8B5CF6',
  'General': '#64748B',
};

export const reportService = {
  /**
   * Fetch live, dynamic calculations across Orders, Expenses, Deliveries, and Customers from Firestore
   */
  async getDetailedReports(): Promise<DetailedReportData> {
    const [ordersSnap, customersSnap, deliveriesSnap, expensesSnap] = await Promise.all([
      getDocs(getTenantCollection('orders')),
      getDocs(getTenantCollection('customers')),
      getDocs(getTenantCollection('deliveries')),
      getDocs(getTenantCollection('expenses')),
    ]);

    let totalRevenue = 0;
    let totalOrders = 0;
    let completedDeliveries = 0;
    let pendingDeliveries = 0;
    let outstandingBalance = 0;
    let totalExpenses = 0;
    let totalJarsDelivered = 0;
    let totalEmptiesCollected = 0;

    // Daily buckets for the last 7 days
    const daysMap: Record<string, { day: string; dateStr: string; revenue: number; jars: number }> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
      daysMap[isoDate] = {
        day: dayName,
        dateStr: isoDate,
        revenue: 0,
        jars: 0,
      };
    }

    // 1. Process Orders
    ordersSnap.forEach((doc) => {
      const data = doc.data();
      totalOrders++;
      const orderAmount = data.totalAmount || 0;
      const amountPaid = data.amountPaid || (data.paymentStatus === 'paid' ? orderAmount : 0);
      
      totalRevenue += amountPaid;

      // Extract jar count
      let jarCount = 0;
      if (data.items && Array.isArray(data.items)) {
        jarCount = data.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      }

      // Map to 7-day trend
      const dateKey = (data.deliveryDate || data.createdAt || '').split('T')[0];
      if (daysMap[dateKey]) {
        daysMap[dateKey].revenue += amountPaid;
        daysMap[dateKey].jars += jarCount;
      }
    });

    // 2. Process Deliveries
    deliveriesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'completed') {
        completedDeliveries++;
        totalJarsDelivered += data.bottlesDelivered || 0;
        totalEmptiesCollected += data.emptyBottlesReturned || 0;
      } else if (data.status === 'pending' || data.status === 'in_progress') {
        pendingDeliveries++;
        totalJarsDelivered += data.bottlesDelivered || 0;
      }
    });

    // 3. Process Customer Dues
    customersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.balance && data.balance > 0) {
        outstandingBalance += data.balance;
      }
    });

    // 4. Process Expenses & Category Breakdown
    const expenseCategoryTotals: Record<string, number> = {};
    expensesSnap.forEach((doc) => {
      const data = doc.data();
      const amt = Number(data.amount) || 0;
      totalExpenses += amt;
      const cat = data.category || 'General';
      expenseCategoryTotals[cat] = (expenseCategoryTotals[cat] || 0) + amt;
    });

    // Compute category percentages
    const categoryExpenses: CategoryExpenseStat[] = Object.entries(expenseCategoryTotals)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
        color: CATEGORY_COLORS[cat] || '#0284C7',
      }))
      .sort((a, b) => b.amount - a.amount);

    // If no expenses logged yet, provide clean empty state
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    const totalDeliveries = completedDeliveries + pendingDeliveries;
    const fulfillmentRate = totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : (completedDeliveries > 0 ? 100 : 0);
    const jarRecoveryRate = totalJarsDelivered > 0 ? Math.min(100, Math.round((totalEmptiesCollected / totalJarsDelivered) * 100)) : 0;

    const weeklySales = Object.values(daysMap);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      outstandingBalance,
      totalOrders,
      completedDeliveries,
      pendingDeliveries,
      fulfillmentRate,
      totalJarsDelivered,
      totalEmptiesCollected,
      jarRecoveryRate,
      weeklySales,
      categoryExpenses,
    };
  },

  // Backward compatibility method
  async getDashboardSummary() {
    const data = await this.getDetailedReports();
    return {
      totalRevenue: data.totalRevenue,
      totalOrders: data.totalOrders,
      completedDeliveries: data.completedDeliveries,
      pendingDeliveries: data.pendingDeliveries,
      outstandingBalance: data.outstandingBalance,
    };
  }
};
