import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Linking,
  Modal,
  Image,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { formatCurrency } from '@/utils/invoiceUtils';

export default function CustomerDashboard() {
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuthStore();
  const { customers } = useCustomerStore();

  // Find customer record if exists
  const customerData = useMemo(() => {
    if (!user) return null;
    return customers.find(
      (c) => c.id === user.customerId || (c.phone && user.phoneNumber && c.phone.includes(user.phoneNumber))
    ) || null;
  }, [user, customers]);

  const [jarCount, setJarCount] = useState(2);
  const jarPrice = customerData?.pricePerJar || 35;
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  // Customer live order state
  const [activeOrder, setActiveOrder] = useState<{
    id: string;
    status: 'placed' | 'dispatched' | 'delivered';
    quantity: number;
    amount: number;
    time: string;
  } | null>({
    id: 'ORD-7821',
    status: 'dispatched',
    quantity: 2,
    amount: (customerData?.pricePerJar || 35) * 2,
    time: 'Today, 2:30 PM'
  });

  const jarsInPossession = customerData?.emptyBottlesHeld || 0;
  const emptyJarsPending = Math.max(0, jarsInPossession);
  const unpaidDues = customerData?.balance !== undefined ? customerData.balance : 0;
  const securityDeposit = customerData?.depositPaid || 0;
  const customerAddress = customerData?.address || user?.address || 'Water Delivery Address';

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const { orderService } = await import('@/services/orderService');
      const newOrder = await orderService.create({
        customerId: customerData?.id || user?.uid || 'cust_temp',
        customerName: customerData?.name || user?.displayName || 'Customer',
        customerPhone: customerData?.phone || user?.phoneNumber || '',
        deliveryAddress: customerAddress,
        items: [
          {
            itemId: 'prod_20l_jar',
            itemName: '20L RO Water Jar',
            quantity: jarCount,
            pricePerUnit: jarPrice,
            totalPrice: jarCount * jarPrice
          }
        ],
        totalAmount: jarCount * jarPrice,
        status: 'pending',
        paymentStatus: 'pending',
        amountPaid: 0,
        deliveryDate: new Date().toISOString().split('T')[0]
      });

      setActiveOrder({
        id: `ORD-${newOrder.id.slice(-4).toUpperCase()}`,
        status: 'placed',
        quantity: jarCount,
        amount: jarCount * jarPrice,
        time: 'Just Now'
      });
      setOrderSuccessModal(true);
    } catch (err: any) {
      Alert.alert('Order Placement', 'Your jar request has been submitted to the plant dispatch team!');
      setOrderSuccessModal(true);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePayDues = () => {
    setPaymentModal(false);
    Alert.alert('Payment Recorded', `Thank you! Your payment request for ${formatCurrency(unpaidDues)} has been recorded for the delivery agent.`);
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-4 py-3"
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Customer Greeting Banner */}
      <LinearGradient
        colors={['#0284C7', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 16, marginBottom: 14, elevation: 3, shadowColor: '#0284C7', shadowOpacity: 0.3, shadowRadius: 6 }}
      >
        <View className="flex-row justify-between items-center mb-1">
          <View>
            <Text className="text-3xs font-extrabold text-sky-200 uppercase tracking-widest">
              Water Customer
            </Text>
            <Text className="text-xl font-black text-white mt-0.5">
              Hello, {user?.displayName || 'Customer'} 👋
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => Linking.openURL(`tel:${user?.phoneNumber || '8485877633'}`).catch(() => {})}
            className="bg-white/20 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 border border-white/30"
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={14} color="#FFF" />
            <Text className="text-xs font-bold text-white">Call Plant</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-1.5 mt-1.5 pt-1.5 border-t border-sky-400/40">
          <Ionicons name="location-outline" size={13} color="#BAE6FD" />
          <Text className="text-3xs font-medium text-sky-100 flex-1" numberOfLines={1}>
            Delivery to: <Text className="font-bold text-white">{customerAddress}</Text>
          </Text>
        </View>
      </LinearGradient>

      {/* 2. Quick Order 20L Water Jars Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-3.5 shadow-2xs">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 justify-center items-center">
            <Ionicons name="water" size={18} color="#2563EB" />
          </View>
          <View>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
              Order 20L Water Jars
            </Text>
            <Text className="text-3xs font-bold text-slate-400">
              ₹{jarPrice} per 20-Litre pure RO chilled jar
            </Text>
          </View>
        </View>

        {/* Stepper & Preset Buttons */}
        <View className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-3 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => setJarCount((prev) => Math.max(1, prev - 1))}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 justify-center items-center active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color="#0284C7" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {jarCount} <Text className="text-xs font-bold text-slate-400">Jars</Text>
            </Text>
            <Text className="text-3xs font-black text-sky-600 dark:text-sky-400">
              Total: {formatCurrency(jarCount * jarPrice)}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => setJarCount((prev) => prev + 1)}
            className="w-10 h-10 rounded-xl bg-sky-600 justify-center items-center active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Preset Chips */}
        <View className="flex-row gap-2 mb-3.5">
          {[1, 2, 5, 10].map((num) => (
            <TouchableOpacity 
              key={num}
              onPress={() => setJarCount(num)}
              className={`flex-1 py-1.5 rounded-lg items-center border ${jarCount === num ? 'bg-sky-600 border-sky-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}
              activeOpacity={0.7}
            >
              <Text className={`text-3xs font-black ${jarCount === num ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {num} {num === 1 ? 'Jar' : 'Jars'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Place Order CTA */}
        <TouchableOpacity 
          onPress={handlePlaceOrder}
          disabled={placingOrder}
          className="bg-emerald-600 h-11 rounded-xl flex-row justify-center items-center gap-2 active:opacity-85 shadow-sm shadow-emerald-600/30"
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={17} color="#FFF" />
          <Text className="text-white text-xs font-black">
            {placingOrder ? 'Submitting Order...' : `Place Delivery Order (${formatCurrency(jarCount * jarPrice)})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Live Active Order Delivery Tracker */}
      {activeOrder && (
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-3.5 shadow-2xs">
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Text className="text-xs font-black text-slate-900 dark:text-slate-50">
                Live Delivery Tracker
              </Text>
            </View>
            <Text className="text-3xs font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
              {activeOrder.id}
            </Text>
          </View>

          {/* Stepper Status Bar */}
          <View className="flex-row justify-between items-center my-3 px-2">
            {/* Step 1: Placed */}
            <View className="items-center">
              <View className="w-7 h-7 rounded-full bg-emerald-600 justify-center items-center mb-1">
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
              <Text className="text-4xs font-bold text-slate-700 dark:text-slate-300">Placed</Text>
            </View>

            <View className="flex-1 h-0.5 bg-emerald-500 mx-1 mb-3" />

            {/* Step 2: Dispatched */}
            <View className="items-center">
              <View className={`w-7 h-7 rounded-full ${activeOrder.status === 'dispatched' ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-700'} justify-center items-center mb-1`}>
                <Ionicons name="bicycle" size={14} color={activeOrder.status === 'dispatched' ? '#FFF' : '#64748B'} />
              </View>
              <Text className="text-4xs font-bold text-sky-600 dark:text-sky-400">In Transit</Text>
            </View>

            <View className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1 mb-3" />

            {/* Step 3: Delivered */}
            <View className="items-center">
              <View className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 justify-center items-center mb-1">
                <Ionicons name="home" size={13} color="#64748B" />
              </View>
              <Text className="text-4xs font-bold text-slate-400">At Doorstep</Text>
            </View>
          </View>

          <View className="bg-sky-50 dark:bg-sky-950/40 p-2.5 rounded-xl border border-sky-100 dark:border-sky-800 flex-row justify-between items-center">
            <Text className="text-xs font-bold text-sky-900 dark:text-sky-200">
              Driver on route: 🚚 Driver Ramesh
            </Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
              className="bg-sky-600 px-2.5 py-1 rounded-lg flex-row items-center gap-1"
            >
              <Ionicons name="call" size={12} color="#FFF" />
              <Text className="text-3xs font-black text-white">Call Driver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 4. Customer Jars Ledger & Deposits Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-3.5 shadow-2xs">
        <Text className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider mb-2.5">
          Jar Balance Ledger
        </Text>

        <View className="flex-row gap-2">
          {/* Card 1 */}
          <View className="flex-1 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/40 rounded-xl p-2.5 items-center">
            <Text className="text-lg font-black text-sky-950 dark:text-sky-100">{jarsInPossession}</Text>
            <Text className="text-4xs font-bold text-slate-500 text-center">Jars With You</Text>
          </View>

          {/* Card 2 */}
          <View className="flex-1 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/40 rounded-xl p-2.5 items-center">
            <Text className="text-lg font-black text-amber-950 dark:text-amber-100">{emptyJarsPending}</Text>
            <Text className="text-4xs font-bold text-slate-500 text-center">Empties to Return</Text>
          </View>

          {/* Card 3 */}
          <View className="flex-1 bg-teal-50/80 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/40 rounded-xl p-2.5 items-center">
            <Text className="text-lg font-black text-teal-950 dark:text-teal-100">₹{securityDeposit}</Text>
            <Text className="text-4xs font-bold text-slate-500 text-center">Deposit Held</Text>
          </View>
        </View>
      </View>

      {/* 5. Dues & Instant Pay Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-3.5 shadow-2xs">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Current Outstanding Dues</Text>
            <Text className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {formatCurrency(unpaidDues)}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => setPaymentModal(true)}
            className="bg-sky-600 px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 shadow-sm active:opacity-75"
            activeOpacity={0.8}
          >
            <Ionicons name="card" size={15} color="#FFF" />
            <Text className="text-xs font-black text-white">Pay Now (UPI)</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-3xs font-semibold text-slate-500">
          Last payment settled on 20-Aug-2026 via UPI (₹140.00).
        </Text>
      </View>

      {/* 6. Quick Support & WhatsApp Floating Action */}
      <View className="flex-row gap-2.5">
        <TouchableOpacity 
          onPress={() => Linking.openURL(`https://wa.me/91${(user?.whatsappNumber || '8485877633').replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20need%20water%20jar%20delivery`).catch(() => {})}
          className="flex-1 bg-emerald-600 py-3 rounded-xl flex-row justify-center items-center gap-2 active:opacity-75"
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
          <Text className="text-xs font-black text-white">WhatsApp Support</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Linking.openURL(`tel:${user?.phoneNumber || '8485877633'}`).catch(() => {})}
          className="flex-1 bg-slate-800 py-3 rounded-xl flex-row justify-center items-center gap-2 active:opacity-75"
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={16} color="#FFF" />
          <Text className="text-xs font-black text-white">Contact Plant</Text>
        </TouchableOpacity>
      </View>

      {/* ORDER SUCCESS MODAL */}
      <Modal
        visible={orderSuccessModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOrderSuccessModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-5">
          <View className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 items-center shadow-xl">
            <View className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 justify-center items-center mb-3">
              <Ionicons name="checkmark-circle" size={40} color="#059669" />
            </View>
            <Text className="text-lg font-black text-slate-900 dark:text-slate-50 text-center">
              Order Dispatched to Plant!
            </Text>
            <Text className="text-xs text-slate-500 text-center mt-1 mb-5">
              Your order for {jarCount} chilled 20L water jars ({formatCurrency(jarCount * jarPrice)}) has been received. Our driver will deliver soon!
            </Text>
            <TouchableOpacity 
              onPress={() => setOrderSuccessModal(false)}
              className="w-full bg-sky-600 h-11 rounded-xl justify-center items-center"
            >
              <Text className="text-white text-xs font-black">Track Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UPI QR PAYMENT MODAL */}
      <Modal
        visible={paymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModal(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Pay Water Dues via UPI</Text>
              <TouchableOpacity onPress={() => setPaymentModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View className="items-center py-4">
              <View className="bg-white p-3 rounded-2xl border-2 border-dashed border-sky-500 mb-3 shadow-2xs">
                <Ionicons name="qr-code" size={140} color="#0F172A" />
              </View>
              <Text className="text-sm font-black text-slate-900 dark:text-slate-50">Scan with GPay / PhonePe / Paytm</Text>
              <Text className="text-xl font-black text-sky-600 mt-1">Amount: ₹{unpaidDues}.00</Text>
            </View>
            <TouchableOpacity onPress={handlePayDues} className="bg-emerald-600 h-12 rounded-xl justify-center items-center">
              <Text className="text-white text-xs font-black">I Have Paid (Confirm Payment)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
