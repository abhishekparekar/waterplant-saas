import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Modal, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform, 
  ScrollView, 
  Alert,
  Linking,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useDeliveryStore } from '@/store/deliveryStore';
import { useCustomerStore } from '@/store/customerStore';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/constants/routes';
import { Delivery } from '@/types/delivery';
import { Customer } from '@/types/customer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelperDashboard() {
  const { user } = useAuthStore();
  const { deliveries, loading, fetchHelperDeliveries, updateDeliveryStatus, createDelivery } = useDeliveryStore();
  const { customers, fetchCustomers, updateCustomer } = useCustomerStore();
  const router = useRouter();

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [emptyReturned, setEmptyReturned] = useState(0);
  const [cashCollected, setCashCollected] = useState('0');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'credit'>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState<Delivery[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Direct Drop State
  const [directDropModal, setDirectDropModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [directJarsDelivered, setDirectJarsDelivered] = useState(1);
  const [directEmptyReturned, setDirectEmptyReturned] = useState(1);
  const [directPaymentMode, setDirectPaymentMode] = useState<'cash' | 'upi' | 'credit'>('cash');
  const [directCash, setDirectCash] = useState('35');
  const [directSubmitting, setDirectSubmitting] = useState(false);

  const loadDriverRuns = async () => {
    if (user?.uid) {
      await fetchHelperDeliveries(user.uid);
    }
    await fetchCustomers();

    // Also fetch assigned orders directly from Firestore
    try {
      const { getTenantCollection } = await import('@/services/firebase');
      const { getDocs, query, where } = await import('firebase/firestore');
      const snap = await getDocs(query(getTenantCollection('orders'), where('status', '==', 'assigned')));
      const runs: Delivery[] = [];
      snap.forEach((d) => {
        const o = d.data();
        const bottleQty = o.items ? o.items.reduce((s: number, i: any) => s + i.quantity, 0) : 1;
        runs.push({
          id: d.id,
          orderId: d.id,
          helperId: o.assignedHelperId || user?.uid || '',
          helperName: o.assignedHelperName || user?.displayName || 'Driver',
          customerId: o.customerId || '',
          customerName: o.customerName || 'Customer',
          customerPhone: o.customerPhone || o.phone || '',
          customerAddress: o.deliveryAddress || o.customerAddress || o.address || 'Standard Route Area',
          bottlesDelivered: bottleQty,
          emptyBottlesReturned: 0,
          cashCollected: 0,
          paymentMethod: o.paymentMethod || 'cash',
          status: 'in_progress',
          scheduledDate: o.deliveryDate || new Date().toISOString(),
          createdAt: o.createdAt || new Date().toISOString(),
          updatedAt: o.updatedAt || new Date().toISOString()
        });
      });
      setAssignedOrders(runs);
    } catch (e) {}
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadDriverRuns();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDriverRuns();
  }, [user]);

  const openCompletionModal = (item: Delivery) => {
    setSelectedDelivery(item);
    setEmptyReturned(item.bottlesDelivered || 1);
    setCashCollected('0');
    setPaymentMode('cash');
    setModalVisible(true);
  };

  const handleCompleteDelivery = async () => {
    if (!selectedDelivery) return;

    const cash = paymentMode === 'cash' ? parseFloat(cashCollected) || 0 : 0;
    if (paymentMode === 'cash' && (isNaN(cash) || cash < 0)) {
      Alert.alert('Validation Error', 'Please enter a valid cash amount collected.');
      return;
    }

    setSubmitting(true);
    try {
      await updateDeliveryStatus(selectedDelivery.id, 'completed', {
        emptyBottlesReturned: emptyReturned,
        cashCollected: cash,
      });

      // Also update matching order in Firestore
      try {
        const { getTenantCollection } = await import('@/services/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        const orderDocRef = doc(getTenantCollection('orders'), selectedDelivery.orderId || selectedDelivery.id);
        await updateDoc(orderDocRef, {
          status: 'delivered',
          paymentStatus: cash > 0 || paymentMode === 'upi' ? 'paid' : 'pending',
          paymentMethod: paymentMode,
          amountPaid: cash,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {}
      
      Alert.alert('Drop-off Completed 🎉', `✓ Empty Jars: ${emptyReturned}\n✓ Payment: ${paymentMode.toUpperCase()} (₹${cash})`);
      setModalVisible(false);
      setSelectedDelivery(null);
      loadDriverRuns();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update delivery status');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Direct Drop on Route Handler
  const openDirectDropSheet = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setDirectJarsDelivered(1);
    setDirectEmptyReturned(1);
    setDirectPaymentMode('cash');
    setDirectCash('35');
    setDirectDropModal(true);
  };

  const handleCustomerPick = (c: Customer) => {
    setSelectedCustomer(c);
    const rate = c.pricePerJar || 35;
    setDirectCash((directJarsDelivered * rate).toString());
  };

  const handleDirectJarsChange = (delta: number) => {
    const nextVal = Math.max(1, directJarsDelivered + delta);
    setDirectJarsDelivered(nextVal);
    const rate = selectedCustomer?.pricePerJar || 35;
    setDirectCash((nextVal * rate).toString());
  };

  const handleConfirmDirectDrop = async () => {
    if (!selectedCustomer) {
      Alert.alert('Select Client', 'Please select a client from the list.');
      return;
    }

    const cash = directPaymentMode === 'cash' ? parseFloat(directCash) || 0 : 0;
    setDirectSubmitting(true);
    try {
      await createDelivery({
        orderId: `DROP-${Date.now()}`,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address,
        helperId: user?.uid || 'staff',
        helperName: user?.displayName || 'Driver Staff',
        bottlesDelivered: directJarsDelivered,
        emptyBottlesReturned: directEmptyReturned,
        cashCollected: cash,
        paymentMethod: directPaymentMode,
        status: 'completed',
        scheduledDate: new Date().toISOString(),
        notes: `Route direct drop by ${user?.displayName || 'Staff'}`
      });

      // Update customer bottles held in store
      try {
        const currentHeld = selectedCustomer.emptyBottlesHeld || 0;
        const newHeld = Math.max(0, currentHeld + directJarsDelivered - directEmptyReturned);
        await updateCustomer(selectedCustomer.id, {
          emptyBottlesHeld: newHeld
        });
      } catch (cErr) {
        console.warn('Customer bottle update warning:', cErr);
      }

      Alert.alert(
        'Drop Logged Successfully! 💧',
        `${directJarsDelivered} Jars delivered to ${selectedCustomer.name}.\nCollected ₹${cash} (${directPaymentMode.toUpperCase()}).`
      );
      setDirectDropModal(false);
      loadDriverRuns();
    } catch (err: any) {
      Alert.alert('Drop Error', err.message || 'Could not log drop.');
    } finally {
      setDirectSubmitting(false);
    }
  };

  const allActiveRuns = useMemo(() => {
    const list = [...deliveries.filter((d) => d.status !== 'completed' && d.status !== 'failed')];
    assignedOrders.forEach((ao) => {
      if (!list.some((existing) => existing.id === ao.id || existing.orderId === ao.orderId)) {
        list.push(ao);
      }
    });
    return list;
  }, [deliveries, assignedOrders]);

  const completedDeliveries = deliveries.filter((d) => d.status === 'completed');
  const completedCount = completedDeliveries.length;
  const totalEmptyReturned = completedDeliveries.reduce((sum, d) => sum + (d.emptyBottlesReturned || 0), 0);
  const totalCashCollected = completedDeliveries.reduce((sum, d) => sum + (d.cashCollected || 0), 0);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 10);
    const q = customerSearch.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [customers, customerSearch]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Top Driver Hero Section with LinearGradient */}
      <View className="px-3 pt-2 pb-1">
        <LinearGradient
          colors={['#0D9488', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            padding: 13,
            elevation: 3,
            shadowColor: '#0D9488',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          {/* Top Row: Driver Profile & Shift Badge */}
          <View className="flex-row justify-between items-start mb-2.5">
            <View className="flex-row items-center gap-2.5 flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center border border-white/30">
                <Ionicons name="bicycle" size={20} color="#FFF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-black text-white" numberOfLines={1}>
                  {user?.displayName || 'Driver Partner'}
                </Text>
                <Text className="text-[11px] font-bold text-teal-100" numberOfLines={1}>
                  {user?.businessName || 'Abhiraj Water Plant'} Logistics
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 border border-white/30">
              <View className="w-2 h-2 rounded-full bg-emerald-300" />
              <Text className="text-[9.5px] font-black text-white uppercase tracking-wider">
                Shift Active
              </Text>
            </View>
          </View>

          {/* 4 Shift KPI Metrics Grid */}
          <View className="flex-row gap-2 mb-2.5">
            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-white">{allActiveRuns.length}</Text>
              <Text className="text-[9px] font-extrabold text-teal-100 uppercase mt-0.5">Pending</Text>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-emerald-200">{completedCount}</Text>
              <Text className="text-[9px] font-extrabold text-teal-100 uppercase mt-0.5">Dropped</Text>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-sky-200">{totalEmptyReturned}</Text>
              <Text className="text-[9px] font-extrabold text-teal-100 uppercase mt-0.5">Empty Jars</Text>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-amber-200">₹{totalCashCollected}</Text>
              <Text className="text-[9px] font-extrabold text-teal-100 uppercase mt-0.5">Cash In Hand</Text>
            </View>
          </View>

          {/* Quick Contact & Refresh Actions */}
          <View className="flex-row gap-2 pt-2 border-t border-teal-500/40">
            <TouchableOpacity 
              onPress={() => Linking.openURL(`tel:8485877633`).catch(() => {})}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 7,
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="call" size={13} color="#FFF" />
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>Plant Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => Linking.openURL(`https://wa.me/918485877633?text=Hi%20Plant%20Manager%2C%20driver%20update%20from%20route`).catch(() => {})}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 7,
                backgroundColor: 'rgba(16, 185, 129, 0.35)',
                borderWidth: 1,
                borderColor: 'rgba(167, 243, 208, 0.5)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="logo-whatsapp" size={13} color="#A7F3D0" />
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleManualRefresh}
              disabled={refreshing}
              style={{
                width: 34,
                height: 34,
                borderRadius: 7,
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.75}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="refresh" size={15} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Primary Route Action Bar: + Direct Drop & Add Client */}
      <View className="px-3 pt-1 pb-1.5 flex-row gap-2">
        <TouchableOpacity
          onPress={openDirectDropSheet}
          activeOpacity={0.85}
          style={{
            flex: 1,
            height: 38,
            borderRadius: 9,
            overflow: 'hidden',
            elevation: 2,
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: '100%',
              height: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Ionicons name="cube" size={15} color="#FFF" />
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
              + Record Direct Drop
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.HELPER.ADD_CUSTOMER)}
          activeOpacity={0.75}
          style={{
            flex: 1,
            height: 38,
            borderRadius: 9,
            backgroundColor: '#FFFFFF',
            borderWidth: 1.2,
            borderColor: '#0D9488',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            elevation: 1,
          }}
        >
          <Ionicons name="person-add" size={15} color="#0D9488" />
          <Text style={{ fontSize: 12, fontWeight: '900', color: '#0D9488' }}>
            Add Client
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Route Delivery Runs List */}
      <View className="flex-1 px-3 pt-1">
        <View className="flex-row justify-between items-center mb-2 px-0.5">
          <Text className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Assigned Delivery Stops ({allActiveRuns.length})
          </Text>
          <Text className="text-[10.5px] font-bold text-teal-600 dark:text-teal-400">
            Route Priority Order
          </Text>
        </View>

        {loading && deliveries.length === 0 ? (
          <Loader />
        ) : (
          <FlatList
            data={allActiveRuns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 85 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <DeliveryCard 
                delivery={item}
                onCompletePress={() => openCompletionModal(item)}
              />
            )}
            ListEmptyComponent={
              <View className="items-center py-6 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 my-2 shadow-sm">
                <View className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 items-center justify-center mb-2">
                  <Ionicons name="bicycle" size={24} color="#0D9488" />
                </View>
                <Text className="text-sm font-black text-slate-900 dark:text-slate-100 text-center">
                  Ready on Route
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 text-center mt-0.5 mb-3 px-2">
                  No assigned stops currently pending from plant dispatch. You can log direct water drops to regular clients or register new clients.
                </Text>

                <View className="flex-row gap-2 w-full">
                  <TouchableOpacity
                    onPress={openDirectDropSheet}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: '#10B981',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 4
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cube" size={14} color="#FFF" />
                    <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#FFF' }}>
                      Direct Drop
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(ROUTES.HELPER.ADD_CUSTOMER)}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: '#F0FDFA',
                      borderWidth: 1,
                      borderColor: '#0D9488',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 4
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add" size={14} color="#0D9488" />
                    <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#0D9488' }}>
                      Add Client
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        )}
      </View>

      {/* Complete Assigned Delivery Drop-off Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
              <View className="flex-1 pr-2">
                <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                  Confirm Water Drop-off
                </Text>
                <Text className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5" numberOfLines={1}>
                  Client: {selectedDelivery?.customerName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Bottles Delivered Info */}
              <View className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl p-3 mb-2.5 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="cube" size={18} color="#0D9488" />
                  <Text className="text-xs font-bold text-teal-900 dark:text-teal-100">
                    Jars Delivered:
                  </Text>
                </View>
                <Text className="text-base font-black text-teal-700 dark:text-teal-300">
                  {selectedDelivery?.bottlesDelivered} Jars (20L)
                </Text>
              </View>

              {/* Empty Jars Return Stepper */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Empty Jars Collected Back
              </Text>
              <View className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-2">
                <TouchableOpacity 
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setEmptyReturned((prev) => Math.max(0, prev - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={18} color="#0284c7" />
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-2xl font-black text-slate-900 dark:text-slate-50">
                    {emptyReturned}
                  </Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">
                    Empty Jars Received
                  </Text>
                </View>

                <TouchableOpacity 
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: '#0D9488',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setEmptyReturned((prev) => prev + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Payment Mode Selector Tabs */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Collection Mode
              </Text>
              <View className="flex-row gap-1.5 mb-2.5">
                {[
                  { key: 'cash', label: 'Cash (₹)', icon: 'cash-outline' },
                  { key: 'upi', label: 'UPI / Online', icon: 'qr-code-outline' },
                  { key: 'credit', label: 'Pay Later', icon: 'time-outline' },
                ].map((pm) => {
                  const isSel = paymentMode === pm.key;
                  return (
                    <TouchableOpacity
                      key={pm.key}
                      onPress={() => {
                        setPaymentMode(pm.key as any);
                        if (pm.key !== 'cash') setCashCollected('0');
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        borderRadius: 7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSel ? '#0D9488' : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: isSel ? '#0D9488' : '#CBD5E1',
                      }}
                      activeOpacity={0.75}
                    >
                      <Ionicons name={pm.icon as any} size={14} color={isSel ? '#FFF' : '#64748B'} />
                      <Text style={{ fontSize: 9.5, fontWeight: '900', color: isSel ? '#FFF' : '#475569', marginTop: 2 }}>
                        {pm.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Cash Collection Input */}
              {paymentMode === 'cash' && (
                <Input
                  label="Cash Amount Collected (₹) *"
                  placeholder="0.00"
                  value={cashCollected}
                  onChangeText={setCashCollected}
                  keyboardType="decimal-pad"
                />
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F1F5F9',
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCompleteDelivery}
                  disabled={submitting}
                  style={{
                    flex: 2,
                    height: 42,
                    borderRadius: 8,
                    overflow: 'hidden',
                    elevation: 2,
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done" size={16} color="#FFF" />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                          Confirm Drop-off
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Direct Route Drop Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={directDropModal}
        onRequestClose={() => setDirectDropModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 max-h-[92%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
              <View>
                <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                  Record Direct Water Drop
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  On-the-spot delivery to route client
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDirectDropModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Select Client Section */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Select Client *
              </Text>
              <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl mb-2 border border-slate-200 dark:border-slate-800">
                <Ionicons name="search" size={16} color="#94A3B8" />
                <TextInput
                  placeholder="Search client name or mobile number..."
                  placeholderTextColor="#94A3B8"
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                  className="flex-1 ml-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </View>

              {/* Client Selector List */}
              <View className="max-h-36 mb-3">
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {filteredCustomers.map(c => {
                    const isSelected = selectedCustomer?.id === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => handleCustomerPick(c)}
                        style={{
                          paddingVertical: 7,
                          paddingHorizontal: 10,
                          borderRadius: 8,
                          marginBottom: 4,
                          backgroundColor: isSelected ? '#CCFBF1' : '#F8FAFC',
                          borderWidth: 1,
                          borderColor: isSelected ? '#0D9488' : '#E2E8F0',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: '900', color: isSelected ? '#0F766E' : '#0F172A' }}>
                            {c.name}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#64748B' }}>
                            📞 {c.phone} {c.address ? `• ${c.address}` : ''}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#0D9488' }}>
                            ₹{c.pricePerJar || 35}/jar
                          </Text>
                          {isSelected && <Ionicons name="checkmark-circle" size={15} color="#0D9488" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Stepper: Full Jars Delivered */}
              <View className="flex-row gap-2 mb-2.5">
                <View className="flex-1 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 items-center">
                  <Text className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Full Jars Delivered
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => handleDirectJarsChange(-1)}
                      style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="remove" size={16} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#0D9488', minWidth: 24, textAlign: 'center' }}>
                      {directJarsDelivered}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDirectJarsChange(1)}
                      style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="add" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-1 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 items-center">
                  <Text className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Empty Jars Collected
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => setDirectEmptyReturned(prev => Math.max(0, prev - 1))}
                      style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="remove" size={16} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#0284C7', minWidth: 24, textAlign: 'center' }}>
                      {directEmptyReturned}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setDirectEmptyReturned(prev => prev + 1)}
                      style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#0284C7', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="add" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Payment Mode */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Collection
              </Text>
              <View className="flex-row gap-1.5 mb-2.5">
                {[
                  { key: 'cash', label: 'Cash (₹)', icon: 'cash-outline' },
                  { key: 'upi', label: 'UPI / QR', icon: 'qr-code-outline' },
                  { key: 'credit', label: 'Pay Later', icon: 'time-outline' },
                ].map(pm => {
                  const isSel = directPaymentMode === pm.key;
                  return (
                    <TouchableOpacity
                      key={pm.key}
                      onPress={() => {
                        setDirectPaymentMode(pm.key as any);
                        if (pm.key === 'credit') setDirectCash('0');
                        else {
                          const rate = selectedCustomer?.pricePerJar || 35;
                          setDirectCash((directJarsDelivered * rate).toString());
                        }
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        borderRadius: 7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSel ? '#0D9488' : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: isSel ? '#0D9488' : '#CBD5E1',
                      }}
                      activeOpacity={0.75}
                    >
                      <Ionicons name={pm.icon as any} size={14} color={isSel ? '#FFF' : '#64748B'} />
                      <Text style={{ fontSize: 9.5, fontWeight: '900', color: isSel ? '#FFF' : '#475569', marginTop: 2 }}>
                        {pm.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Cash Amount */}
              {directPaymentMode === 'cash' && (
                <Input
                  label="Amount Collected (₹) *"
                  placeholder="Enter cash amount"
                  value={directCash}
                  onChangeText={setDirectCash}
                  keyboardType="decimal-pad"
                />
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => setDirectDropModal(false)}
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F1F5F9',
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmDirectDrop}
                  disabled={directSubmitting}
                  style={{
                    flex: 2,
                    height: 42,
                    borderRadius: 8,
                    overflow: 'hidden',
                    elevation: 2,
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                  >
                    {directSubmitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done" size={16} color="#FFF" />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                          Confirm Drop
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
