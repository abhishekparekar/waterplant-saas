import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  RefreshControl, 
  Linking, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDeliveryStore } from '@/store/deliveryStore';
import { useStaffStore } from '@/store/staffStore';
import { useCustomerStore } from '@/store/customerStore';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { ROUTES } from '@/constants/routes';
import { Delivery, DeliveryStatus } from '@/types/delivery';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed';

export default function DeliveriesScreen() {
  const router = useRouter();
  const { deliveries, loading, fetchDeliveries, updateDeliveryStatus } = useDeliveryStore();
  const { staffList, fetchStaff } = useStaffStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drop-off completion modal
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [deliveredQty, setDeliveredQty] = useState(1);
  const [returnedEmpties, setReturnedEmpties] = useState(1);
  const [collectedCash, setCollectedCash] = useState('0');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchDeliveries();
    fetchStaff();
    fetchCustomers();
  }, [fetchDeliveries, fetchStaff, fetchCustomers]);

  // Map customer phone and address from customer store
  const customerMap = useMemo(() => {
    const map = new Map<string, { phone: string; address: string; emptyHeld: number }>();
    customers.forEach((c) => {
      map.set(c.id, {
        phone: c.phone || '',
        address: c.address || '',
        emptyHeld: c.emptyBottlesHeld || 0,
      });
    });
    return map;
  }, [customers]);

  // Filtered deliveries list
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      // Status filter
      if (statusFilter === 'pending' && (d.status === 'completed' || d.status === 'failed')) return false;
      if (statusFilter === 'in_progress' && d.status !== 'in_progress') return false;
      if (statusFilter === 'completed' && d.status !== 'completed') return false;

      // Driver filter
      if (selectedDriverId !== 'all') {
        if (d.helperId !== selectedDriverId && d.helperName !== selectedDriverId) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cName = (d.customerName || '').toLowerCase();
        const hName = (d.helperName || '').toLowerCase();
        const address = (customerMap.get(d.customerId)?.address || '').toLowerCase();
        if (!cName.includes(q) && !hName.includes(q) && !address.includes(q)) return false;
      }

      return true;
    });
  }, [deliveries, statusFilter, selectedDriverId, searchQuery, customerMap]);

  // Summary statistics for active route
  const stats = useMemo(() => {
    let pendingStops = 0;
    let completedStops = 0;
    let jarsToDeliver = 0;

    deliveries.forEach((d) => {
      if (d.status === 'completed') {
        completedStops++;
      } else {
        pendingStops++;
        jarsToDeliver += d.bottlesDelivered || 1;
      }
    });

    return {
      totalStops: deliveries.length,
      pendingStops,
      completedStops,
      jarsToDeliver,
    };
  }, [deliveries]);

  const handleOpenCompleteModal = (delivery: Delivery) => {
    const expectedJars = delivery.bottlesDelivered || 1;
    setSelectedDelivery(delivery);
    setDeliveredQty(expectedJars);
    setReturnedEmpties(expectedJars);
    setCollectedCash('0');
    setCompletionModalVisible(true);
  };

  const handleConfirmCompletion = async () => {
    if (!selectedDelivery) return;
    const cashNum = parseFloat(collectedCash);
    if (isNaN(cashNum) || cashNum < 0) {
      Alert.alert('Validation Error', 'Please enter a valid cash amount (or 0 if unpaid).');
      return;
    }

    setCompleting(true);
    try {
      await updateDeliveryStatus(selectedDelivery.id, 'completed', {
        bottlesDelivered: deliveredQty,
        emptyBottlesReturned: returnedEmpties,
        cashCollected: cashNum,
      });

      setCompletionModalVisible(false);
      setSelectedDelivery(null);
      Alert.alert('Delivery Confirmed', `Drop-off recorded: ${deliveredQty} jars delivered, ${returnedEmpties} empties collected.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update delivery');
    } finally {
      setCompleting(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'No contact number available for this customer.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleOpenMap = (address?: string) => {
    if (!address) {
      Alert.alert('No Address', 'No delivery address specified.');
      return;
    }
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(mapUrl).catch(() => {});
  };

  const renderDeliveryItem = ({ item, index }: { item: Delivery; index: number }) => {
    const custInfo = customerMap.get(item.customerId);
    const isCompleted = item.status === 'completed';
    const address = custInfo?.address || 'Water Drop-off Location';
    const phone = custInfo?.phone;

    return (
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 mb-2.5 shadow-2xs">
        {/* Stop Header & Sequence */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <View className={`w-6 h-6 rounded-lg items-center justify-center ${isCompleted ? 'bg-emerald-500' : 'bg-sky-600'}`}>
              <Text className="text-white text-[10.5px] font-black">#{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14.5px] font-black text-slate-900 dark:text-slate-50 leading-tight" numberOfLines={1}>
                {item.customerName}
              </Text>
              <Text className="text-xs font-semibold text-slate-400 mt-0.5">
                📅 {formatDate(item.scheduledDate)}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className={`px-2.5 py-1 rounded-full ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800' : 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800'}`}>
            <Text className={`text-[10px] font-black uppercase tracking-wider ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}`}>
              {isCompleted ? '✓ Delivered' : 'Pending Drop'}
            </Text>
          </View>
        </View>

        {/* Address Route Row */}
        <View className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-xl mb-2 border border-slate-100 dark:border-slate-800">
          <Ionicons name="location-outline" size={13} color="#0284c7" />
          <Text className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
            {address}
          </Text>
        </View>

        {/* Details Metrics */}
        <View className="flex-row items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-800 mb-2">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="cube-outline" size={14} color="#0284c7" />
            <Text className="text-xs font-black text-slate-800 dark:text-slate-100">
              {item.bottlesDelivered} Jars to Drop
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Ionicons name="bicycle" size={14} color="#0D9488" />
            <Text className="text-xs font-bold text-teal-700 dark:text-teal-400">
              {item.helperName || 'Unassigned'}
            </Text>
          </View>
        </View>

        {/* If completed, show collection log */}
        {isCompleted && (
          <View className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl flex-row justify-between items-center mb-2 border border-emerald-200/60 dark:border-emerald-800/60">
            <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Collected: {formatCurrency(item.cashCollected || 0)}
            </Text>
            <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Empties Returned: {item.emptyBottlesReturned || 0}
            </Text>
          </View>
        )}

        {/* Action Buttons Row */}
        <View className="flex-row gap-2 mt-0.5">
          {/* Direct Call */}
          <TouchableOpacity 
            onPress={() => handleCall(phone)}
            className="flex-1 bg-slate-100 dark:bg-slate-700/60 h-9 rounded-xl flex-row items-center justify-center gap-1 active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={13} color="#0284c7" />
            <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">Call</Text>
          </TouchableOpacity>

          {/* Direct Navigation Map */}
          <TouchableOpacity 
            onPress={() => handleOpenMap(address)}
            className="flex-1 bg-slate-100 dark:bg-slate-700/60 h-9 rounded-xl flex-row items-center justify-center gap-1 active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={13} color="#0d9488" />
            <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">Map</Text>
          </TouchableOpacity>

          {/* Complete Drop-off Button with LinearGradient */}
          {!isCompleted && (
            <TouchableOpacity 
              onPress={() => handleOpenCompleteModal(item)}
              activeOpacity={0.85}
              style={{
                flex: 2,
                borderRadius: 12,
                overflow: 'hidden',
                elevation: 2,
                shadowColor: '#0284C7',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 2
              }}
            >
              <LinearGradient
                colors={['#0284C7', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 36,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  paddingHorizontal: 8,
                }}
              >
                <Ionicons name="checkmark-done" size={15} color="#FFF" />
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>Mark Delivered</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. Header Summary Bar */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3 pt-2 pb-2.5">
        <View className="flex-row gap-2 mb-2.5">
          {/* Active Stops */}
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/60 rounded-xl py-1.5 px-2 items-center">
            <Text className="text-base font-black text-sky-800 dark:text-sky-200">
              {stats.pendingStops}
            </Text>
            <Text className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider mt-0.5">
              Pending Drops
            </Text>
          </View>

          {/* Jars to Drop */}
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 rounded-xl py-1.5 px-2 items-center">
            <Text className="text-base font-black text-emerald-800 dark:text-emerald-200">
              {stats.jarsToDeliver}
            </Text>
            <Text className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
              Jars in Transit
            </Text>
          </View>

          {/* Completed Stops */}
          <View className="flex-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl py-1.5 px-2 items-center">
            <Text className="text-base font-black text-indigo-800 dark:text-indigo-200">
              {stats.completedStops}
            </Text>
            <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-0.5">
              Delivered
            </Text>
          </View>
        </View>

        {/* Search & New Dispatch Button with LinearGradient */}
        <View className="flex-row items-center gap-2 mb-2">
          <View className="flex-1 flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2">
            <Ionicons name="search-outline" size={17} color="#94a3b8" />
            <TextInput
              placeholder="Search by customer, driver, area..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            onPress={() => router.push(ROUTES.ORDER.CREATE)}
            activeOpacity={0.85}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              elevation: 2,
              shadowColor: '#0284C7',
              shadowOffset: { width: 0, height: 1.5 },
              shadowOpacity: 0.25,
              shadowRadius: 2
            }}
          >
            <LinearGradient
              colors={['#0284C7', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: 13,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Ionicons name="add" size={14} color="#FFF" />
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>New Dispatch</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Status Filter Chips */}
        <View className="flex-row gap-1.5 items-center">
          {(['all', 'pending', 'completed'] as StatusFilter[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg ${statusFilter === tab ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-100 dark:bg-slate-900'}`}
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-black uppercase ${statusFilter === tab ? 'text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}>
                {tab === 'all' ? 'All Stops' : tab === 'pending' ? 'Pending' : 'Completed'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Driver Filter Horizontal Scroll */}
          {staffList.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 ml-1">
              <TouchableOpacity
                onPress={() => setSelectedDriverId('all')}
                className={`px-2.5 py-1.5 rounded-lg mr-1.5 ${selectedDriverId === 'all' ? 'bg-sky-600' : 'bg-slate-100 dark:bg-slate-900'}`}
              >
                <Text className={`text-xs font-black ${selectedDriverId === 'all' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  All Drivers
                </Text>
              </TouchableOpacity>
              {staffList.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedDriverId(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg mr-1.5 ${selectedDriverId === s.id ? 'bg-sky-600' : 'bg-slate-100 dark:bg-slate-900'}`}
                >
                  <Text className={`text-xs font-black ${selectedDriverId === s.id ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    🚚 {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* 2. Delivery Stops List */}
      {loading && deliveries.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={filteredDeliveries}
          keyExtractor={(item) => item.id}
          renderItem={renderDeliveryItem}
          contentContainerStyle={{ padding: 8, paddingBottom: 110 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchDeliveries} colors={['#0284c7']} />
          }
          ListEmptyComponent={
            <EmptyState 
              message="No route deliveries match the selected filters." 
              iconName="map-outline" 
            />
          }
        />
      )}

      {/* 3. Mark Delivery Completed Modal */}
      <Modal
        visible={completionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompletionModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-7 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
              <View>
                <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                  Complete Drop-off
                </Text>
                <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {selectedDelivery?.customerName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setCompletionModalVisible(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Stepper 1: Bottles Delivered */}
              <View className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 mb-2 border border-slate-100 dark:border-slate-800">
                <Text className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Filled Jars Delivered
                </Text>
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity 
                    onPress={() => setDeliveredQty(Math.max(1, deliveredQty - 1))}
                    className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center active:opacity-75"
                  >
                    <Ionicons name="remove" size={16} color="#0284c7" />
                  </TouchableOpacity>
                  <Text className="text-lg font-black text-slate-900 dark:text-slate-50">
                    {deliveredQty} Jars
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setDeliveredQty(deliveredQty + 1)}
                    className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center active:opacity-75"
                  >
                    <Ionicons name="add" size={16} color="#0284c7" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stepper 2: Empties Returned */}
              <View className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 mb-2 border border-slate-100 dark:border-slate-800">
                <Text className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Empty Jars Collected Back
                </Text>
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity 
                    onPress={() => setReturnedEmpties(Math.max(0, returnedEmpties - 1))}
                    className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center active:opacity-75"
                  >
                    <Ionicons name="remove" size={16} color="#059669" />
                  </TouchableOpacity>
                  <Text className="text-lg font-black text-slate-900 dark:text-slate-50">
                    {returnedEmpties} Empties
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setReturnedEmpties(returnedEmpties + 1)}
                    className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center active:opacity-75"
                  >
                    <Ionicons name="add" size={16} color="#059669" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cash Collected Field */}
              <View className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 mb-3 border border-slate-100 dark:border-slate-800">
                <Text className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cash Collected (₹)
                </Text>
                <TextInput
                  value={collectedCash}
                  onChangeText={setCollectedCash}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-black text-slate-900 dark:text-slate-100 mb-2"
                />

                {/* Quick Cash Chips */}
                <View className="flex-row gap-1">
                  {['0', '35', '70', '105', '140'].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setCollectedCash(amt)}
                      className={`px-2 py-0.5 rounded-md ${collectedCash === amt ? 'bg-emerald-600' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
                    >
                      <Text className={`text-[9px] font-black ${collectedCash === amt ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        ₹{amt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit Button with LinearGradient */}
              <TouchableOpacity 
                onPress={handleConfirmCompletion}
                disabled={completing}
                activeOpacity={0.85}
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  elevation: 3,
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 46,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                  <Text style={{ color: '#FFF', fontSize: 13.5, fontWeight: '900' }}>
                    {completing ? 'Updating...' : 'Confirm Drop & Update Inventory'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
