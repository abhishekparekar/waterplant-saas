import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/constants/routes';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { useStaffStore } from '@/store/staffStore';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, loading, refresh } = useDashboard();
  const { customers, fetchCustomers } = useCustomerStore();
  const { staffList, fetchStaff } = useStaffStore();

  // Segmented Tab Switch: 'menu' | 'dashboard'
  const [activeTab, setActiveTab] = useState<'menu' | 'dashboard'>('menu');

  useEffect(() => {
    fetchCustomers();
    fetchStaff();
  }, [fetchCustomers, fetchStaff]);

  // Live Date State for Dashboard
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Calculate live statistics
  const revenueDisplay = data?.totalRevenue || 0;
  const duesDisplay = data?.outstandingBalance || 0;
  const ordersCount = data?.totalOrders || 0;
  const activeRunsCount = data?.pendingDeliveries || 0;
  const completedRunsCount = data?.completedDeliveries || 0;

  // Real calculation of jars in field from customer records
  const totalFieldJars = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.emptyBottlesHeld || 0), 0);
  }, [customers]);

  const totalDepositsHeld = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.depositPaid || 0), 0);
  }, [customers]);

  const activeStaffCount = staffList.filter(s => s.status === 'active').length;

  // 18 Interactive Business Modules for [Menu] View
  const menuModules = [
    {
      id: 'customers',
      title: 'Customers',
      icon: 'people',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.CUSTOMERS)
    },
    {
      id: 'routes',
      title: 'Delivery Routes',
      icon: 'map',
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: () => router.push(ROUTES.OWNER.DELIVERIES)
    },
    {
      id: 'delivery_entry',
      title: 'Delivery Entry',
      icon: 'cart',
      color: '#E11D48',
      bg: '#FFE4E6',
      onPress: () => router.push(ROUTES.ORDER.CREATE)
    },
    {
      id: 'my_products',
      title: 'My Products',
      icon: 'cube',
      color: '#2563EB',
      bg: '#DBEAFE',
      onPress: () => router.push(ROUTES.OWNER.INVENTORY)
    },
    {
      id: 'products_in_use',
      title: 'Products in Use',
      icon: 'clipboard',
      color: '#D97706',
      bg: '#FEF3C7',
      onPress: () => router.push(ROUTES.OWNER.PRODUCTS_IN_USE)
    },
    {
      id: 'entry_statement',
      title: 'Entry Statement',
      icon: 'list',
      color: '#059669',
      bg: '#D1FAE5',
      onPress: () => router.push(ROUTES.OWNER.ORDERS)
    },
    {
      id: 'load_unload',
      title: 'Load / Unload',
      icon: 'bus',
      color: '#EA580C',
      bg: '#FFEDD5',
      onPress: () => router.push(ROUTES.OWNER.LOAD_UNLOAD)
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: 'receipt',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.BILLING)
    },
    {
      id: 'monthly_card',
      title: 'Monthly Card',
      icon: 'calendar',
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: () => router.push(ROUTES.OWNER.MONTHLY_CARDS)
    },
    {
      id: 'events_orders',
      title: 'Event Orders',
      icon: 'calendar-number',
      color: '#E11D48',
      bg: '#FFE4E6',
      onPress: () => router.push(ROUTES.OWNER.EVENT_ORDERS)
    },
    {
      id: 'transactions',
      title: 'Transactions',
      icon: 'calculator',
      color: '#059669',
      bg: '#D1FAE5',
      onPress: () => router.push(ROUTES.OWNER.TRANSACTIONS)
    },
    {
      id: 'payment_entry',
      title: 'Payment Entry',
      icon: 'cash',
      color: '#D97706',
      bg: '#FEF3C7',
      onPress: () => router.push(ROUTES.OWNER.EXPENSES)
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'stats-chart',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.REPORTS)
    },
    {
      id: 'staff',
      title: 'Staff',
      icon: 'construct',
      color: '#2563EB',
      bg: '#DBEAFE',
      onPress: () => router.push(ROUTES.OWNER.STAFF)
    },
    {
      id: 'locate',
      title: 'Locate Live',
      icon: 'navigate-circle',
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: () => router.push(ROUTES.OWNER.LOCATE)
    },
    {
      id: 'recharge',
      title: 'Recharge',
      icon: 'card',
      color: '#059669',
      bg: '#D1FAE5',
      onPress: () => router.push(ROUTES.OWNER.RECHARGE)
    },
    {
      id: 'tutorials',
      title: 'Help Tutorials',
      icon: 'play-circle',
      color: '#EA580C',
      bg: '#FFEDD5',
      onPress: () => router.push(ROUTES.OWNER.TUTORIALS)
    },
    {
      id: 'personal_app',
      title: 'Plant Settings',
      icon: 'settings-outline',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.PLANT_SETTINGS)
    },
  ];

  if (loading && !data) {
    return <Loader />;
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP SEGMENTED CONTROLLER ([ Menu ] | [ Live Dashboard ]) */}
      <View className="bg-sky-600 px-3.5 pt-1 pb-2">
        <View className="flex-row bg-slate-200/90 dark:bg-slate-800/90 p-1 rounded-xl">
          <TouchableOpacity
            className={`flex-1 py-1.5 rounded-lg items-center justify-center ${activeTab === 'menu' ? 'bg-white dark:bg-slate-700 shadow-2xs' : 'bg-transparent'}`}
            onPress={() => setActiveTab('menu')}
            activeOpacity={0.8}
          >
            <Text className={`text-[12px] font-extrabold ${activeTab === 'menu' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
              Menu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-1.5 rounded-lg items-center justify-center ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-2xs' : 'bg-transparent'}`}
            onPress={() => setActiveTab('dashboard')}
            activeOpacity={0.8}
          >
            <Text className={`text-[12px] font-extrabold ${activeTab === 'dashboard' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
              Live Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView
        className="flex-1 px-3 py-2.5"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#0284c7']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: [ MENU ] — 3-COLUMN GRID OF ALL 18 BUSINESS MODULES */}
        {/* ========================================================================= */}
        {activeTab === 'menu' && (
          <View className="gap-2">
            {/* Quick Action Shortcut Strip */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.ORDER.CREATE)}
                style={{
                  flex: 1,
                  backgroundColor: '#E11D48',
                  height: 38,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  elevation: 3,
                  shadowColor: '#E11D48',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="cart" size={14} color="#FFF" />
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>+ Delivery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.OWNER.CUSTOMERS)}
                style={{
                  flex: 1,
                  backgroundColor: '#0284C7',
                  height: 38,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  elevation: 3,
                  shadowColor: '#0284C7',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add" size={14} color="#FFF" />
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>+ Client</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.OWNER.LOAD_UNLOAD)}
                style={{
                  flex: 1,
                  backgroundColor: '#D97706',
                  height: 38,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  elevation: 3,
                  shadowColor: '#D97706',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="bus" size={14} color="#FFF" />
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>Load Truck</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.OWNER.EXPENSES)}
                style={{
                  flex: 1,
                  backgroundColor: '#059669',
                  height: 38,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  elevation: 3,
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="cash" size={14} color="#FFF" />
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>+ Expense</Text>
              </TouchableOpacity>
            </View>

            {/* 3-Column Grid of 18 Modules */}
            <View className="flex-row flex-wrap justify-between gap-y-2">
              {menuModules.map((mod) => (
                <TouchableOpacity
                  key={mod.id}
                  onPress={mod.onPress}
                  className="w-[31.8%] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-xl py-2 px-1 items-center justify-center shadow-2xs active:opacity-75 min-h-[86px]"
                  activeOpacity={0.7}
                >
                  <View
                    className="w-8 h-8 rounded-xl justify-center items-center mb-1"
                    style={{ backgroundColor: mod.bg }}
                  >
                    <Ionicons name={mod.icon as any} size={17} color={mod.color} />
                  </View>
                  <Text
                    className="text-[10.5px] font-bold text-slate-800 dark:text-slate-100 text-center leading-tight px-0.5"
                    numberOfLines={2}
                  >
                    {mod.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: [ DASHBOARD ] — LIVE BILLING & DELIVERY LOGISTICS */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <View className="gap-2.5">
            {/* Date Selector Row */}
            <View className="flex-row items-center gap-2">
              <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-2 flex-row items-center gap-2 shadow-2xs">
                <Ionicons name="calendar-outline" size={16} color="#0284C7" />
                <Text className="text-[11.5px] font-bold text-slate-700 dark:text-slate-200">
                  Date: {todayStr}
                </Text>
              </View>

              <TouchableOpacity
                className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-1.5 items-center justify-center shadow-2xs active:opacity-75"
                onPress={() => router.push(ROUTES.OWNER.REPORTS)}
                activeOpacity={0.7}
              >
                <Ionicons name="stats-chart" size={14} color="#0284C7" />
                <Text className="text-[9.5px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  Full Analytics
                </Text>
              </TouchableOpacity>
            </View>

            {/* Total Billing Box */}
            <View>
              <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 mb-1 pl-0.5 uppercase tracking-wide">
                Billing Summary
              </Text>
              <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 rounded-xl p-3 shadow-2xs">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-[15px] font-black text-sky-600 dark:text-sky-400">
                      {formatCurrency(revenueDisplay + duesDisplay)}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Total Billed
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-[15px] font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(revenueDisplay)}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Collected
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-[15px] font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(duesDisplay)}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Outstanding
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Total Delivery Box */}
            <View>
              <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 mb-1 pl-0.5 uppercase tracking-wide">
                Delivery Logistics (Jars)
              </Text>
              <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 rounded-xl p-3 shadow-2xs">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-[16px] font-black text-amber-500">
                      {completedRunsCount * 2 + activeRunsCount}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Dispatched
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-[16px] font-black text-sky-600 dark:text-sky-400">
                      {completedRunsCount * 2}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Delivered
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-[16px] font-black text-teal-600 dark:text-teal-400">
                      {totalFieldJars}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      In Field
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Navigation Cards */}
            <View className="gap-2 pt-1">
              <TouchableOpacity
                onPress={() => router.push(ROUTES.OWNER.CUSTOMERS)}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 rounded-xl p-3 flex-row items-center justify-between shadow-2xs active:opacity-75"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 items-center justify-center">
                    <Ionicons name="people-outline" size={15} color="#0284C7" />
                  </View>
                  <Text className="text-[12px] font-bold text-slate-800 dark:text-slate-100">
                    1. Customer Directory & Balance Ledgers ({customers.length})
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.OWNER.DELIVERIES)}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 rounded-xl p-3 flex-row items-center justify-between shadow-2xs active:opacity-75"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 items-center justify-center">
                    <Ionicons name="map-outline" size={15} color="#0D9488" />
                  </View>
                  <Text className="text-[12px] font-bold text-slate-800 dark:text-slate-100">
                    2. Delivery Routes & Order Dispatches
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.OWNER.STAFF)}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 rounded-xl p-3 flex-row items-center justify-between shadow-2xs active:opacity-75"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 items-center justify-center">
                    <Ionicons name="construct-outline" size={15} color="#2563EB" />
                  </View>
                  <Text className="text-[12px] font-bold text-slate-800 dark:text-slate-100">
                    3. Delivery Staff & Fleet Drivers ({staffList.length})
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.OWNER.BILLING)}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 rounded-xl p-3 flex-row items-center justify-between shadow-2xs active:opacity-75"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 items-center justify-center">
                    <Ionicons name="receipt-outline" size={15} color="#059669" />
                  </View>
                  <Text className="text-[12px] font-bold text-slate-800 dark:text-slate-100">
                    4. Ledger Invoices & Payments (₹{duesDisplay} Due)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
