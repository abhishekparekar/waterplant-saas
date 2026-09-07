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
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useDeliveryStore } from '@/store/deliveryStore';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
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
  const [submitting, setSubmitting] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState<Delivery[]>([]);

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
          customerId: o.customerId,
          customerName: o.customerName,
          bottlesDelivered: bottleQty,
          emptyBottlesReturned: 0,
          cashCollected: 0,
          status: 'in_progress',
          scheduledDate: o.deliveryDate || new Date().toISOString(),
          createdAt: o.createdAt || new Date().toISOString(),
          updatedAt: o.updatedAt || new Date().toISOString()
        });
      });
      setAssignedOrders(runs);
    } catch (e) {}
  };

  useEffect(() => {
    loadDriverRuns();
  }, [user]);

  const openCompletionModal = (item: Delivery) => {
    setSelectedDelivery(item);
    setEmptyReturned(item.bottlesDelivered || 1);
    setCashCollected('0');
    setModalVisible(true);
  };

  const handleCompleteDelivery = async () => {
    if (!selectedDelivery) return;

    const cash = parseFloat(cashCollected);
    if (isNaN(cash) || cash < 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount of cash collected (or 0 if unpaid).');
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
          paymentStatus: cash > 0 ? 'paid' : 'pending',
          amountPaid: cash,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {}
      
      Alert.alert('Success', `Delivery completed! Empty Jars Collected: ${emptyReturned}, Cash: ₹${cash}`);
      setModalVisible(false);
      setSelectedDelivery(null);
      loadDriverRuns();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update run status');
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

  const completedCount = deliveries.filter((d) => d.status === 'completed').length;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Top Driver Header with LinearGradient */}
      <View className="px-4 pt-3 pb-2">
        <LinearGradient
          colors={['#0D9488', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 18, padding: 16, elevation: 3, shadowColor: '#0D9488', shadowOpacity: 0.25, shadowRadius: 8 }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="bicycle" size={13} color="#99F6E4" />
                <Text className="text-3xs font-black text-teal-100 uppercase tracking-widest">
                  Logistics Driver
                </Text>
              </View>
              <Text className="text-xl font-black text-white mt-0.5">
                {user?.displayName || 'Delivery Partner'}
              </Text>
            </View>

            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-white/15 border border-white/30 justify-center items-center active:opacity-75"
              onPress={() => router.push(ROUTES.HELPER.PROFILE)}
            >
              <Ionicons name="person" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Status Counters inside Gradient */}
          <View className="flex-row gap-2.5 mb-3">
            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2.5 flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-emerald-400/20 items-center justify-center">
                <Ionicons name="checkmark-done" size={18} color="#A7F3D0" />
              </View>
              <View>
                <Text className="text-base font-black text-white">{completedCount}</Text>
                <Text className="text-4xs font-bold text-teal-100 uppercase">Completed</Text>
              </View>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2.5 flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-amber-400/20 items-center justify-center">
                <Ionicons name="time" size={18} color="#FDE68A" />
              </View>
              <View>
                <Text className="text-base font-black text-white">{allActiveRuns.length}</Text>
                <Text className="text-4xs font-bold text-teal-100 uppercase">Remaining</Text>
              </View>
            </View>
          </View>

          {/* Quick Contact Plant Owner Actions */}
          <View className="flex-row gap-2 pt-2 border-t border-teal-500/40">
            <TouchableOpacity 
              onPress={() => Linking.openURL(`tel:${user?.phoneNumber || '8485877633'}`).catch(() => {})}
              className="flex-1 bg-white/15 border border-white/25 py-2 rounded-xl flex-row justify-center items-center gap-1.5 active:opacity-75"
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={13} color="#FFF" />
              <Text className="text-3xs font-black text-white">Call Plant Owner</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => Linking.openURL(`https://wa.me/91${(user?.whatsappNumber || '8485877633').replace(/[^0-9]/g, '')}?text=Hi%20Owner%2C%20driver%20update%20from%20delivery%20route`).catch(() => {})}
              className="flex-1 bg-emerald-500/40 border border-emerald-300/40 py-2 rounded-xl flex-row justify-center items-center gap-1.5 active:opacity-75"
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={13} color="#A7F3D0" />
              <Text className="text-3xs font-black text-white">WhatsApp Plant</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Route List */}
      {loading && deliveries.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={allActiveRuns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DeliveryCard 
              delivery={item}
              onCompletePress={() => openCompletionModal(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState message="All caught up! No pending deliveries assigned to your route right now." iconName="happy-outline" />
          }
        />
      )}

      {/* Complete Delivery Modal */}
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
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Complete Water Drop-off
                </Text>
                <Text className="text-xs text-sky-600 dark:text-sky-400 font-bold mt-0.5">
                  Client: {selectedDelivery?.customerName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Bottles Delivered Info */}
              <View className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/50 rounded-xl p-3 mb-4 flex-row justify-between items-center">
                <Text className="text-xs font-bold text-sky-900 dark:text-sky-100">
                  Bottles Delivered to Client:
                </Text>
                <Text className="text-base font-black text-sky-700 dark:text-sky-300">
                  {selectedDelivery?.bottlesDelivered} Jars
                </Text>
              </View>

              {/* Empty Jars Return Stepper */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Empty Jars Collected Back
              </Text>
              <View className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                <TouchableOpacity 
                  className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 justify-center items-center active:opacity-75"
                  onPress={() => setEmptyReturned((prev) => Math.max(0, prev - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={20} color="#0284c7" />
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-2xl font-black text-slate-900 dark:text-slate-50">
                    {emptyReturned}
                  </Text>
                  <Text className="text-3xs font-bold text-slate-400 uppercase">
                    Empty Jars Returned
                  </Text>
                </View>

                <TouchableOpacity 
                  className="w-11 h-11 rounded-xl bg-sky-600 justify-center items-center active:opacity-75"
                  onPress={() => setEmptyReturned((prev) => prev + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Cash Collection Input */}
              <Input
                label="Cash Collected on Delivery (₹)"
                placeholder="0.00"
                value={cashCollected}
                onChangeText={setCashCollected}
                keyboardType="decimal-pad"
              />

              <Button
                title="Confirm & Complete Drop-off"
                onPress={handleCompleteDelivery}
                loading={submitting}
                style={{ backgroundColor: '#059669', marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
