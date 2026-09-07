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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useDeliveryStore } from '@/store/deliveryStore';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/constants/routes';
import { Delivery } from '@/types/delivery';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelperDashboard() {
  const { user } = useAuthStore();
  const { deliveries, loading, fetchHelperDeliveries, updateDeliveryStatus } = useDeliveryStore();
  const router = useRouter();

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [emptyReturned, setEmptyReturned] = useState(0);
  const [cashCollected, setCashCollected] = useState('0');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'credit'>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState<Delivery[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDriverRuns = async () => {
    if (user?.uid) {
      await fetchHelperDeliveries(user.uid);
    }
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
      
      Alert.alert('Drop-off Completed', `✓ Empty Jars: ${emptyReturned}\n✓ Payment: ${paymentMode.toUpperCase()} (₹${cash})`);
      setModalVisible(false);
      setSelectedDelivery(null);
      loadDriverRuns();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update delivery status');
    } finally {
      setSubmitting(false);
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

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Top Driver Hero Section with LinearGradient */}
      <View className="px-3.5 pt-2.5 pb-1">
        <LinearGradient
          colors={['#0D9488', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            padding: 14,
            elevation: 3,
            shadowColor: '#0D9488',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
          }}
        >
          {/* Top Row: Driver Profile & Shift Badge */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center gap-2.5 flex-1 pr-2">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center border border-white/30">
                <Ionicons name="bicycle" size={22} color="#FFF" />
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
          <View className="flex-row gap-2 mb-3">
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

          {/* Quick Contact & Action Buttons in Rectangular Format */}
          <View className="flex-row gap-2 pt-2 border-t border-teal-500/40">
            <TouchableOpacity 
              onPress={() => Linking.openURL(`tel:8485877633`).catch(() => {})}
              style={{
                flex: 1,
                height: 36,
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
                height: 36,
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
                width: 36,
                height: 36,
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
                <Ionicons name="refresh" size={16} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Active Route Delivery Runs List */}
      <View className="flex-1 px-3.5 pt-2">
        <View className="flex-row justify-between items-center mb-2 px-0.5">
          <Text className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Assigned Delivery Stops ({allActiveRuns.length})
          </Text>
          <Text className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
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
              <EmptyState 
                message="All caught up! No pending deliveries assigned to your route right now." 
                iconName="happy-outline" 
              />
            }
          />
        )}
      </View>

      {/* Complete Delivery Drop-off Modal */}
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
              <View className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl p-3 mb-3 flex-row justify-between items-center">
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
                    width: 40,
                    height: 40,
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
                  <Ionicons name="remove" size={20} color="#0284c7" />
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
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#0D9488',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setEmptyReturned((prev) => prev + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Quick Presets for Empty Jars */}
              <View className="flex-row gap-2 mb-3">
                {[0, 1, 2, 5].map((qty) => (
                  <TouchableOpacity
                    key={qty}
                    onPress={() => setEmptyReturned(qty)}
                    style={{
                      flex: 1,
                      paddingVertical: 5,
                      borderRadius: 6,
                      alignItems: 'center',
                      backgroundColor: emptyReturned === qty ? '#0D9488' : '#F1F5F9',
                      borderWidth: 1,
                      borderColor: emptyReturned === qty ? '#0D9488' : '#E2E8F0',
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: emptyReturned === qty ? '#FFF' : '#64748B' }}>
                      {qty} Empty
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Payment Mode Selector Tabs */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Collection Mode
              </Text>
              <View className="flex-row gap-1.5 mb-3">
                {[
                  { key: 'cash', label: 'Cash (₹)', icon: 'cash-outline' },
                  { key: 'upi', label: 'UPI / Online', icon: 'qr-code-outline' },
                  { key: 'card', label: 'Monthly Card', icon: 'card-outline' },
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

              {/* Action Buttons in Rectangular Format */}
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
                    elevation: 3,
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
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
                        <Ionicons name="checkmark-done" size={17} color="#FFF" />
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
    </View>
  );
}
