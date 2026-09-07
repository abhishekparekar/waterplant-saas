import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOrderStore } from '@/store/orderStore';
import { useStaffStore } from '@/store/staffStore';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { formatCurrency, getOrderSummaryText } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Order } from '@/types/order';

type FilterTab = 'all' | 'pending' | 'assigned' | 'delivered' | 'cancelled';

export default function OrdersScreen() {
  const { orders, loading, fetchOrders } = useOrderStore();
  const { staffList, fetchStaff } = useStaffStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Batch Multi-Select State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, [fetchOrders, fetchStaff]);

  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter((o) => {
      if (!o) return false;
      const matchesTab = activeTab === 'all' || o.status === activeTab;
      const cName = (o.customerName || '').toLowerCase();
      const oId = (o.id || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || cName.includes(q) || oId.includes(q);
      return matchesTab && matchesQuery;
    });
  }, [orders, activeTab, searchQuery]);

  const pendingOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter(o => o && o.status === 'pending');
  }, [orders]);

  const toggleSelectOrder = (orderId: string) => {
    if (!orderId) return;
    setSelectedOrderIds((prev) => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleNavigateToOrder = (orderId?: string) => {
    if (!orderId) return;
    try {
      router.push(`/order/${orderId}` as any);
    } catch (e) {}
  };

  const handleNavigateToCreate = () => {
    try {
      router.push('/order/create' as any);
    } catch (e) {}
  };

  const handleNavigateToAddHelper = () => {
    setAssignModalVisible(false);
    try {
      router.push('/(owner)/add-helper' as any);
    } catch (e) {}
  };

  const handleSelectAllPending = () => {
    if (selectedOrderIds.length === pendingOrders.length && pendingOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(pendingOrders.map(o => o.id).filter(Boolean));
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'delivered':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400', label: 'Delivered' };
      case 'cancelled':
        return { bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-600 dark:text-rose-400', label: 'Cancelled' };
      case 'assigned':
        return { bg: 'bg-sky-50 dark:bg-sky-950', text: 'text-sky-600 dark:text-sky-400', label: 'In Transit' };
      default:
        return { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400', label: 'Pending' };
    }
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'paid':
        return { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', label: 'Paid' };
      case 'partial':
        return { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-300', label: 'Partial' };
      default:
        return { bg: 'bg-rose-100 dark:bg-rose-900', text: 'text-rose-700 dark:text-rose-300', label: 'Unpaid' };
    }
  };

  // 1-Click Multi-Order Batch Assignment to Driver
  const handleBatchAssignToDriver = async (driver: { id: string; name: string }) => {
    if (selectedOrderIds.length === 0) return;
    setAssigning(true);

    try {
      const { orderService } = await import('@/services/orderService');
      const { deliveryService } = await import('@/services/deliveryService');

      const targetOrders = (orders || []).filter(o => o && selectedOrderIds.includes(o.id));

      await Promise.all(
        targetOrders.map(async (order) => {
          if (!order || !order.id) return;
          await orderService.assignHelper(order.id, driver.id, driver.name);

          try {
            const bottleQty = order.items ? order.items.reduce((sum, it) => sum + (it?.quantity || 1), 0) : 1;
            await deliveryService.create({
              orderId: order.id,
              helperId: driver.id,
              helperName: driver.name,
              customerId: order.customerId || '',
              customerName: order.customerName || 'Customer',
              status: 'pending',
              scheduledDate: order.deliveryDate || new Date().toISOString(),
              bottlesDelivered: bottleQty,
              emptyBottlesReturned: 0,
              cashCollected: 0,
            });
          } catch (e) {}
        })
      );

      Alert.alert(
        'Assignment Successful! 🚚',
        `${selectedOrderIds.length} delivery orders successfully assigned to ${driver.name}! They will now appear on their driver dashboard.`
      );

      setSelectedOrderIds([]);
      setAssignModalVisible(false);
      fetchOrders();
    } catch (err: any) {
      Alert.alert('Assignment Error', err.message || 'Failed to assign orders to driver.');
    } finally {
      setAssigning(false);
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Search and Tab Filters */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search orders by customer or ID..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Chips & Select All Action */}
        <View className="flex-row justify-between items-center mb-1">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={tabs}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => {
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  onPress={() => setActiveTab(item.key)}
                  className={`mr-2 px-3.5 py-1.5 rounded-full border ${
                    isActive 
                      ? 'bg-sky-600 border-sky-600' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text 
                    className={`text-xs font-bold ${
                      isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 4 }}
          />

          {pendingOrders.length > 0 && (
            <TouchableOpacity 
              onPress={handleSelectAllPending}
              className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 rounded-lg flex-row items-center gap-1"
              activeOpacity={0.7}
            >
              <Ionicons 
                name={selectedOrderIds.length === pendingOrders.length ? "checkbox" : "square-outline"} 
                size={14} 
                color="#0284C7" 
              />
              <Text className="text-[11px] font-black text-sky-700 dark:text-sky-300">
                {selectedOrderIds.length === pendingOrders.length ? 'Unselect' : `Select All (${pendingOrders.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Orders List */}
      {loading && (!orders || orders.length === 0) ? (
        <Loader />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) => item?.id || `order-idx-${index}`}
          contentContainerStyle={{ padding: 16, paddingBottom: selectedOrderIds.length > 0 ? 140 : 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (!item) return null;
            const status = getStatusBadge(item.status);
            const payment = getPaymentBadge(item.paymentStatus);
            const isSelected = selectedOrderIds.includes(item.id);
            const canSelect = item.status !== 'delivered' && item.status !== 'cancelled';

            return (
              <View 
                className={`bg-white dark:bg-slate-800 border-2 ${
                  isSelected 
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950' 
                    : 'border-slate-100 dark:border-slate-700'
                } rounded-2xl p-4 mb-3`}
              >
                {/* Header Row with Checkbox */}
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    {canSelect && (
                      <TouchableOpacity 
                        onPress={() => toggleSelectOrder(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={isSelected ? "checkbox" : "square-outline"} 
                          size={22} 
                          color={isSelected ? "#0284C7" : "#94A3B8"} 
                        />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      onPress={() => handleNavigateToOrder(item.id)}
                      className="flex-1"
                    >
                      <Text className="text-base font-extrabold text-slate-900 dark:text-slate-50">
                        {item.customerName || 'Customer'}
                      </Text>
                      <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        📅 {item.deliveryDate ? formatDate(item.deliveryDate) : 'Today'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="items-end gap-1">
                    <View className={`px-2.5 py-0.5 rounded-full ${status.bg}`}>
                      <Text className={`text-[10.5px] font-black uppercase tracking-wider ${status.text}`}>
                        {status.label}
                      </Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded-md ${payment.bg}`}>
                      <Text className={`text-[10.5px] font-bold ${payment.text}`}>
                        {payment.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Items Box */}
                <View className="bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl my-2 flex-row items-center gap-2">
                  <Ionicons name="cube-outline" size={14} color="#0284c7" />
                  <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
                    {getOrderSummaryText(item)}
                  </Text>
                </View>

                {item.assignedHelperName ? (
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <Ionicons name="bicycle" size={13} color="#0D9488" />
                    <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Assigned Driver: <Text className="font-bold text-teal-600 dark:text-teal-400">{item.assignedHelperName}</Text>
                    </Text>
                  </View>
                ) : null}

                <View className="flex-row justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-700">
                  <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Amount
                  </Text>
                  <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                    {formatCurrency(item.totalAmount || 0)}
                  </Text>
                </View>

                {/* Individual 1-Tap Assign Button with LinearGradient */}
                {canSelect && !isSelected ? (
                  <View className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedOrderIds([item.id]);
                        setAssignModalVisible(true);
                      }}
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        overflow: 'hidden',
                        elevation: 2,
                        shadowColor: '#0D9488',
                        shadowOffset: { width: 0, height: 1.5 },
                        shadowOpacity: 0.25,
                        shadowRadius: 2.5
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#0D9488', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          height: 38,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Ionicons name="bicycle" size={15} color="#FFF" />
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                          {item.assignedHelperName ? 'Re-assign Driver' : 'Assign to Delivery Staff'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState 
              message={searchQuery ? `No orders matching "${searchQuery}"` : "No orders found in this category. Click + to create a new delivery order."} 
              iconName="receipt-outline" 
            />
          }
        />
      )}

      {/* STICKY BOTTOM BATCH ASSIGN ACTION BAR (When Multiple Orders Selected) */}
      {selectedOrderIds.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 16,
          left: 14,
          right: 14,
          backgroundColor: '#0F172A',
          padding: 14,
          borderRadius: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
          borderWidth: 1,
          borderColor: '#334155'
        }}>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8' }}>
              Selected Orders
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
              {selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'Order' : 'Orders'} Selected
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setSelectedOrderIds([])}
              style={{
                backgroundColor: '#1E293B',
                paddingHorizontal: 12,
                height: 38,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#475569',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#CBD5E1' }}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAssignModalVisible(true)}
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                elevation: 3,
                shadowColor: '#0284C7',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#0284C7', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 14,
                  height: 38,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="bicycle" size={15} color="#FFF" />
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>Assign Selected</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ASSIGN DRIVER MODAL (1-CLICK WORK DISPATCH) */}
      <Modal
        visible={assignModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Assign {selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'Order' : 'Orders'} to Staff
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Pick an active delivery driver for instant dispatch
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Active Delivery Drivers
              </Text>

              {(!staffList || staffList.filter(s => s && s.status === 'active').length === 0) ? (
                <View className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl items-center my-2">
                  <Ionicons name="people-outline" size={32} color="#94A3B8" />
                  <Text className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2 text-center">
                    No active delivery staff found.
                  </Text>
                  <TouchableOpacity 
                    onPress={handleNavigateToAddHelper}
                    className="mt-3 bg-sky-600 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-xs font-black text-white">+ Add Staff Driver</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                staffList.filter(s => s && s.status === 'active').map((staff) => (
                  <TouchableOpacity
                    key={staff.id}
                    onPress={() => handleBatchAssignToDriver(staff)}
                    disabled={assigning}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl mb-2.5 flex-row justify-between items-center active:opacity-75"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 justify-center items-center">
                        <Ionicons name="bicycle" size={20} color="#0D9488" />
                      </View>
                      <View>
                        <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                          {staff.name || 'Driver'}
                        </Text>
                        <Text className="text-xs font-semibold text-slate-500 mt-0.5">
                          📞 {staff.phone || ''} {staff.vehicleNumber ? `• 🚚 ${staff.vehicleNumber}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={{ borderRadius: 10, overflow: 'hidden' }}>
                      <LinearGradient
                        colors={['#0D9488', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
                      >
                        <Text className="text-xs font-black text-white">
                          {assigning ? 'Assigning...' : `Assign (${selectedOrderIds.length})`}
                        </Text>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button for Create Order (When no batch selection active) */}
      {selectedOrderIds.length === 0 && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            bottom: 24,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            overflow: 'hidden',
            elevation: 8,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
          }}
          onPress={handleNavigateToCreate}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#0284C7', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}
