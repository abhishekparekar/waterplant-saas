import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Linking, 
  ActivityIndicator, 
  useColorScheme 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { useDeliveryStore } from '@/store/deliveryStore';
import { orderService } from '@/services/orderService';
import { Order } from '@/types/order';
import { Delivery } from '@/types/delivery';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ROUTES } from '@/constants/routes';

export default function CustomerHistoryScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { user } = useAuthStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { deliveries, fetchDeliveries } = useDeliveryStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'delivered' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchDeliveries();
  }, []);

  const customerData = useMemo(() => {
    if (!user) return null;
    return customers.find(
      (c) => c.id === user.customerId || c.id === user.uid || (c.phone && user.phoneNumber && c.phone.replace(/[^0-9]/g, '') === user.phoneNumber.replace(/[^0-9]/g, ''))
    ) || null;
  }, [user, customers]);

  const plantName = user?.businessName || customerData?.businessName || 'Abhiraj Water Plant';

  const loadHistory = async () => {
    const custId = customerData?.id || user?.customerId || user?.uid;
    if (!custId) return;
    setLoading(true);
    try {
      const fetchedOrders = await orderService.getByCustomer(custId);
      setOrders(fetchedOrders);
    } catch (e) {
      console.warn('Customer history load warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [customerData, user]);

  // Combined deliveries and orders for customer
  const customerDeliveries = useMemo(() => {
    const custId = customerData?.id || user?.customerId || user?.uid;
    if (!custId) return [];
    return deliveries.filter(d => d.customerId === custId);
  }, [deliveries, customerData, user]);

  // Unified history items
  interface HistoryItem {
    id: string;
    date: string;
    title: string;
    jarsCount: number;
    emptyReturned: number;
    amount: number;
    status: 'delivered' | 'pending' | 'in_progress';
    paymentMethod: string;
    driverName?: string;
  }

  const unifiedList = useMemo(() => {
    const list: HistoryItem[] = [];

    // Add orders
    orders.forEach(o => {
      const qty = o.items ? o.items.reduce((s, i) => s + i.quantity, 0) : 1;
      list.push({
        id: o.id,
        date: o.createdAt,
        title: `${qty} Jars (20L RO)`,
        jarsCount: qty,
        emptyReturned: 0,
        amount: o.totalAmount,
        status: o.status === 'delivered' ? 'delivered' : 'pending',
        paymentMethod: o.paymentMethod || 'Cash on Delivery',
        driverName: o.assignedHelperName,
      });
    });

    // Add delivery drops that might not be in orders
    customerDeliveries.forEach(d => {
      if (!list.some(item => item.id === d.id || item.id === d.orderId)) {
        list.push({
          id: d.id,
          date: d.scheduledDate || d.createdAt,
          title: `${d.bottlesDelivered} Jars Dropped`,
          jarsCount: d.bottlesDelivered,
          emptyReturned: d.emptyBottlesReturned || 0,
          amount: d.cashCollected || 0,
          status: d.status === 'completed' ? 'delivered' : 'pending',
          paymentMethod: d.paymentMethod || 'Cash',
          driverName: d.helperName,
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, customerDeliveries]);

  // Filtered list
  const filteredList = useMemo(() => {
    return unifiedList.filter(item => {
      if (filterTab === 'delivered' && item.status !== 'delivered') return false;
      if (filterTab === 'pending' && item.status !== 'pending') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = item.id.toLowerCase().includes(q) ||
                      item.title.toLowerCase().includes(q) ||
                      (item.driverName && item.driverName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [unifiedList, filterTab, searchQuery]);

  // Totals
  const totalJarsDelivered = unifiedList.reduce((s, i) => s + i.jarsCount, 0);
  const totalEmptyHanded = unifiedList.reduce((s, i) => s + i.emptyReturned, 0);
  const totalSpent = unifiedList.reduce((s, i) => s + i.amount, 0);

  const shareReceiptWhatsApp = (item: HistoryItem) => {
    const text = `Water Delivery Slip from ${plantName}%0A%0AOrder ID: ${item.id.slice(-6).toUpperCase()}%0ADate: ${formatDate(item.date)}%0AJars: ${item.jarsCount} (20L RO)%0AAmount: Rs.${item.amount}%0AStatus: ${item.status.toUpperCase()}`;
    Linking.openURL(`https://wa.me/?text=${text}`).catch(() => {});
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. Top Metrics Hero Card with LinearGradient */}
      <View className="px-3.5 pt-2.5 pb-1">
        <LinearGradient
          colors={['#0284C7', '#0369A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 14,
            elevation: 3,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          <View className="flex-row justify-between items-center mb-2.5">
            <View>
              <Text className="text-[10px] font-black text-sky-200 uppercase tracking-widest">
                {plantName}
              </Text>
              <Text className="text-base font-black text-white mt-0.5">
                My Delivery History & Ledger
              </Text>
            </View>

            <View className="px-2.5 py-1 rounded-md bg-white/20 border border-white/30">
              <Text className="text-[9.5px] font-black text-white uppercase">
                {unifiedList.length} Records
              </Text>
            </View>
          </View>

          {/* 3 Metrics Cards inside Hero */}
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-white">{totalJarsDelivered}</Text>
              <Text className="text-[9px] font-extrabold text-sky-100 uppercase mt-0.5">Jars Taken</Text>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-emerald-200">{totalEmptyHanded}</Text>
              <Text className="text-[9px] font-extrabold text-sky-100 uppercase mt-0.5">Empties Returned</Text>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-amber-200">₹{totalSpent}</Text>
              <Text className="text-[9px] font-extrabold text-sky-100 uppercase mt-0.5">Total Paid</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* 2. Filter & Search Controls */}
      <View className="px-3.5 pt-1 pb-1">
        {/* Search Bar */}
        <View className="flex-row items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-xl mb-2 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <Ionicons name="search" size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search by order ID or driver..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View className="flex-row gap-1.5 mb-1.5">
          {[
            { key: 'all', label: `All Drops (${unifiedList.length})` },
            { key: 'delivered', label: 'Delivered' },
            { key: 'pending', label: 'In Transit / Pending' },
          ].map((tab) => {
            const isSel = filterTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilterTab(tab.key as any)}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 7,
                  backgroundColor: isSel ? '#0284C7' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isSel ? '#0284C7' : '#E2E8F0',
                }}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: isSel ? '#FFFFFF' : '#64748B' }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Deliveries History List */}
      <View className="flex-1 px-3.5">
        {loading && unifiedList.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#0284C7" />
            <Text className="text-xs font-bold text-slate-400 mt-2">Loading your order history...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 85, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 mb-2.5 shadow-2xs">
                {/* Header Row: Date & Status Badge */}
                <View className="flex-row justify-between items-center mb-1.5">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="calendar-outline" size={13} color="#0284C7" />
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {formatDate(item.date)}
                    </Text>
                  </View>

                  <View className={`px-2 py-0.5 rounded-md border ${item.status === 'delivered' ? 'bg-emerald-50 border-emerald-200' : 'bg-sky-50 border-sky-200'}`}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: item.status === 'delivered' ? '#047857' : '#0369A1', textTransform: 'uppercase' }}>
                      {item.status === 'delivered' ? 'Delivered' : 'Pending Drop'}
                    </Text>
                  </View>
                </View>

                {/* Items & Amount Box */}
                <View className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg flex-row justify-between items-center border border-slate-100 dark:border-slate-800 mb-2">
                  <View>
                    <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {item.title}
                    </Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">
                      Order #{item.id.slice(-6).toUpperCase()} • {item.paymentMethod}
                    </Text>
                  </View>

                  <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.amount)}
                  </Text>
                </View>

                {/* Footer: Driver Details & WhatsApp Slip */}
                <View className="flex-row justify-between items-center pt-1">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="bicycle" size={13} color="#64748B" />
                    <Text className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.driverName ? `Delivered by: ${item.driverName}` : 'Handled by Plant Logistics'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => shareReceiptWhatsApp(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor: '#F0FDF4',
                      borderWidth: 1,
                      borderColor: '#BBF7D0',
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="logo-whatsapp" size={12} color="#16A34A" />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#15803D' }}>
                      Receipt
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center py-10 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 my-2 shadow-sm">
                <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
                <Text className="text-sm font-black text-slate-900 dark:text-slate-100 mt-2">
                  No Delivery History Yet
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 mb-3">
                  When {plantName} drops jars or completes your orders, your delivery history and ledger will appear here.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(ROUTES.CUSTOMER.DASHBOARD)}
                  style={{
                    backgroundColor: '#0284C7',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>
                    Order Fresh Water Jars
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
