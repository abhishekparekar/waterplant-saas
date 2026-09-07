import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Linking
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCustomerStore } from '@/store/customerStore';
import { useOrderStore } from '@/store/orderStore';
import { useStaffStore } from '@/store/staffStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { APP_CONFIG } from '@/constants/config';
import { Customer } from '@/types/customer';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId?: string }>();
  
  const { user } = useAuthStore();
  const { customers, loading, fetchCustomers } = useCustomerStore();
  const { addOrder } = useOrderStore();
  const { staffList, fetchStaff } = useStaffStore();

  const defaultPrice = user?.pricePerJar || APP_CONFIG.defaultWaterPrice || 35;
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [custSearch, setCustSearch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(defaultPrice.toString());
  const [assignedDriverId, setAssignedDriverId] = useState<string>('');
  const [helperName, setHelperName] = useState<string>('');
  const [deliverySlot, setDeliverySlot] = useState<'immediate' | 'morning' | 'evening'>('immediate');
  const [paymentOption, setPaymentOption] = useState<'pending' | 'paid'>('pending');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchStaff();
  }, [fetchCustomers, fetchStaff]);

  // Preselect customer if passed in URL params
  useEffect(() => {
    if (params.customerId && customers.length > 0) {
      const found = customers.find((c) => c.id === params.customerId);
      if (found) {
        handleSelectCustomer(found);
      }
    }
  }, [params.customerId, customers]);

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCust(cust);
    const rate = cust.pricePerJar || defaultPrice;
    setPricePerUnit(rate.toString());
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!custSearch.trim()) return customers;
    const q = custSearch.toLowerCase().trim();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q)
    );
  }, [customers, custSearch]);

  const priceNum = parseFloat(pricePerUnit) || 0;
  const totalAmount = quantity * priceNum;

  const handleCreateOrder = async () => {
    if (!selectedCust) {
      Alert.alert('Validation Error', 'Please select a customer for delivery.');
      return;
    }

    if (quantity <= 0) {
      Alert.alert('Validation Error', 'Please enter at least 1 jar.');
      return;
    }
    if (priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price per bottle.');
      return;
    }

    setSubmitting(true);
    
    try {
      const now = new Date().toISOString();
      const isPaid = paymentOption === 'paid';

      await addOrder({
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        customerPhone: selectedCust.phone,
        deliveryAddress: selectedCust.address,
        items: [
          {
            itemId: 'jar-20l',
            itemName: '20L RO Water Jar',
            quantity: quantity,
            pricePerUnit: priceNum,
            totalPrice: totalAmount,
          }
        ],
        totalAmount: totalAmount,
        status: assignedDriverId ? 'assigned' : 'pending',
        paymentStatus: isPaid ? 'paid' : 'pending',
        amountPaid: isPaid ? totalAmount : 0,
        deliveryDate: now,
        assignedHelperId: assignedDriverId || undefined,
        assignedHelperName: helperName.trim() || undefined,
        notes: notes.trim() ? `[${deliverySlot.toUpperCase()} SLOT] ${notes.trim()}` : `[${deliverySlot.toUpperCase()} SLOT]`,
      });

      Alert.alert(
        'Delivery Run Dispatched', 
        `Order of ${quantity} jars for ${selectedCust.name} has been dispatched successfully!`,
        [
          { text: 'Done', onPress: () => router.back() }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create delivery entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && customers.length === 0) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView 
        className="flex-1 px-3 py-2.5"
        contentContainerStyle={{ paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. CUSTOMER SELECTION CARD */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-2.5 shadow-2xs">
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 items-center justify-center">
                <Ionicons name="person" size={13} color="#0284c7" />
              </View>
              <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                1. Select Customer *
              </Text>
            </View>
            {selectedCust && (
              <TouchableOpacity 
                onPress={() => setSelectedCust(null)}
                className="bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-1 rounded-lg"
              >
                <Text className="text-xs font-black text-sky-600 dark:text-sky-400">Change</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Box */}
          {!selectedCust ? (
            <>
              <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
                <Ionicons name="search-outline" size={17} color="#94a3b8" />
                <TextInput
                  placeholder="Search by customer name, phone or address..."
                  placeholderTextColor="#94a3b8"
                  value={custSearch}
                  onChangeText={setCustSearch}
                  className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
                />
                {custSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCustSearch('')}>
                    <Ionicons name="close-circle" size={17} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Horizontal Fast Selection Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-1">
                {filteredCustomers.slice(0, 10).map((cust) => (
                  <TouchableOpacity 
                    key={cust.id} 
                    className="mr-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex-row items-center gap-1.5 active:opacity-75"
                    onPress={() => handleSelectCustomer(cust)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-circle-outline" size={15} color="#0284c7" />
                    <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {cust.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            /* Selected Customer Highlight Card */
            <View className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 rounded-2xl p-3">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-base font-black text-sky-900 dark:text-sky-100">
                  {selectedCust.name}
                </Text>
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`tel:${selectedCust.phone}`).catch(() => {})}
                  className="flex-row items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 shadow-2xs"
                >
                  <Ionicons name="call" size={12} color="#0284c7" />
                  <Text className="text-xs font-black text-sky-700 dark:text-sky-300">
                    {selectedCust.phone}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center gap-1.5 mb-2">
                <Ionicons name="location-outline" size={13} color="#0284c7" />
                <Text className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
                  {selectedCust.address}
                </Text>
              </View>

              <View className="flex-row justify-between pt-2 border-t border-sky-200/60 dark:border-sky-800/60">
                <Text className="text-xs font-bold text-slate-500 uppercase">
                  Jars in Field: <Text className="font-black text-indigo-600 dark:text-indigo-400">{selectedCust.emptyBottlesHeld || 0} Jars</Text>
                </Text>
                <Text className="text-xs font-bold text-slate-500 uppercase">
                  Dues: <Text className={`font-black ${selectedCust.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(selectedCust.balance || 0)}
                  </Text>
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 2. JAR QUANTITY & PRICING CARD */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-2.5 shadow-2xs">
          <View className="flex-row items-center gap-2 mb-2.5">
            <View className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 items-center justify-center">
              <Ionicons name="cube" size={13} color="#2563EB" />
            </View>
            <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              2. 20L Water Jars Quantity & Rate
            </Text>
          </View>

          {/* Stepper Controls */}
          <View className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2.5">
            <TouchableOpacity 
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 justify-center items-center active:opacity-75 shadow-2xs"
              onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color="#0284c7" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-2xl font-black text-slate-900 dark:text-slate-50">
                {quantity}
              </Text>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                20L Bubbletop Jars
              </Text>
            </View>

            <TouchableOpacity 
              className="w-10 h-10 rounded-xl bg-sky-600 justify-center items-center active:opacity-75 shadow-2xs"
              onPress={() => setQuantity((prev) => prev + 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Fast Preset Chips */}
          <View className="flex-row gap-1.5 mb-3">
            {[1, 2, 3, 5, 10, 20].map((preset) => (
              <TouchableOpacity
                key={preset}
                className={`flex-1 py-1.5 rounded-xl items-center border ${
                  quantity === preset 
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
                onPress={() => setQuantity(preset)}
                activeOpacity={0.7}
              >
                <Text className={`text-xs font-black ${quantity === preset ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rate Per Jar Input */}
          <Input
            label="Rate Per Jar (₹)"
            placeholder="35.00"
            value={pricePerUnit}
            onChangeText={setPricePerUnit}
            keyboardType="decimal-pad"
          />
        </View>

        {/* 3. ASSIGN DELIVERY DRIVER & STAFF CARD */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-2.5 shadow-2xs">
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/60 items-center justify-center">
                <Ionicons name="bicycle" size={13} color="#0D9488" />
              </View>
              <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                3. Assign Delivery Driver
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/(owner)/add-helper')}
              className="flex-row items-center gap-1 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg"
            >
              <Ionicons name="person-add" size={12} color="#0D9488" />
              <Text className="text-xs font-black text-teal-700 dark:text-teal-400">+ Add Driver</Text>
            </TouchableOpacity>
          </View>

          {/* Driver Selection Horizontal Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
            {/* Unassigned Option */}
            <TouchableOpacity
              onPress={() => { setAssignedDriverId(''); setHelperName(''); }}
              className={`mr-2 px-3.5 py-2 rounded-xl border flex-row items-center gap-2 ${
                !assignedDriverId 
                  ? 'bg-slate-800 dark:bg-slate-200 border-slate-800 dark:border-slate-200' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Ionicons name="help-circle-outline" size={15} color={!assignedDriverId ? '#FFF' : '#64748B'} />
              <Text className={`text-xs font-black ${!assignedDriverId ? 'text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}>
                Unassigned (Pool)
              </Text>
            </TouchableOpacity>

            {/* Live Staff Drivers from Firestore */}
            {staffList.map((staff) => {
              const isSelected = assignedDriverId === staff.id;
              return (
                <TouchableOpacity
                  key={staff.id}
                  onPress={() => { setAssignedDriverId(staff.id); setHelperName(staff.name); }}
                  className={`mr-2 px-3.5 py-2 rounded-xl border flex-row items-center gap-2 ${
                    isSelected 
                      ? 'bg-sky-600 border-sky-600 shadow-2xs' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Ionicons name="bus-outline" size={15} color={isSelected ? '#FFF' : '#0284C7'} />
                  <View>
                    <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                      {staff.name}
                    </Text>
                    {staff.vehicleNumber ? (
                      <Text className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                        {staff.vehicleNumber}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Delivery Slot Selector */}
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Delivery Time Slot
          </Text>
          <View className="flex-row gap-2 mb-3">
            {[
              { id: 'immediate', label: 'Express Now', icon: 'flash' },
              { id: 'morning', label: 'Morning Run', icon: 'sunny' },
              { id: 'evening', label: 'Evening Run', icon: 'moon' },
            ].map((slot) => (
              <TouchableOpacity
                key={slot.id}
                onPress={() => setDeliverySlot(slot.id as any)}
                className={`flex-1 py-2 px-2.5 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                  deliverySlot === slot.id 
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Ionicons name={slot.icon as any} size={13} color={deliverySlot === slot.id ? '#0284C7' : '#64748B'} />
                <Text className={`text-xs font-bold ${deliverySlot === slot.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Status at Entry */}
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Payment Mode
          </Text>
          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              onPress={() => setPaymentOption('pending')}
              className={`flex-1 py-2 px-2.5 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                paymentOption === 'pending' 
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Ionicons name="time" size={14} color={paymentOption === 'pending' ? '#D97706' : '#64748B'} />
              <Text className={`text-xs font-bold ${paymentOption === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                Add to Dues
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentOption('paid')}
              className={`flex-1 py-2 px-2.5 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                paymentOption === 'paid' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Ionicons name="checkmark-circle" size={14} color={paymentOption === 'paid' ? '#059669' : '#64748B'} />
              <Text className={`text-xs font-bold ${paymentOption === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                Cash / UPI Paid
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Delivery Notes (Optional)"
            placeholder="e.g. Leave at door, call on arrival"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* 4. LIVE TOTAL & DISPATCH CTA WITH LINEAR GRADIENT */}
        <LinearGradient
          colors={['#0284C7', '#0EA5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 16,
            marginBottom: 20,
            elevation: 4,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5
          }}
        >
          <View className="flex-row justify-between items-center mb-3 pb-2.5 border-b border-white/20">
            <View>
              <Text className="text-xs font-black text-sky-100 uppercase tracking-widest">
                Total Order Value
              </Text>
              <Text className="text-xs text-white font-semibold mt-0.5">
                {quantity} Jars × ₹{priceNum.toFixed(2)}
              </Text>
            </View>
            <Text className="text-2xl font-black text-white">
              {formatCurrency(totalAmount)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateOrder}
            disabled={submitting}
            activeOpacity={0.85}
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
          >
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 48,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="paper-plane" size={17} color="#FFF" />
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFF' }}>
                {submitting ? "Dispatching..." : "Confirm & Dispatch Delivery"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
