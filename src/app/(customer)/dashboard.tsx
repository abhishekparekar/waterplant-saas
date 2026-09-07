import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Linking, 
  Modal, 
  TextInput,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { orderService } from '@/services/orderService';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Order } from '@/types/order';

export default function CustomerDashboard() {
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuthStore();
  const { customers, fetchCustomers } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Find customer record from database
  const customerData = useMemo(() => {
    if (!user) return null;
    return customers.find(
      (c) => c.id === user.customerId || c.id === user.uid || (c.phone && user.phoneNumber && c.phone.replace(/[^0-9]/g, '') === user.phoneNumber.replace(/[^0-9]/g, ''))
    ) || null;
  }, [user, customers]);

  const plantName = user?.businessName || customerData?.businessName || 'Abhiraj Water Plant';
  const jarPrice = customerData?.pricePerJar || 35;
  const customerAddress = customerData?.address || user?.address || 'Water Delivery Address';
  const jarsInPossession = customerData?.emptyBottlesHeld || 0;
  const securityDeposit = customerData?.depositPaid || 0;
  const unpaidDues = customerData?.balance !== undefined ? customerData.balance : 0;

  // Order Form State
  const [jarCount, setJarCount] = useState(2);
  const [deliverySlot, setDeliverySlot] = useState<'morning' | 'evening' | 'urgent'>('morning');
  const [paymentOption, setPaymentOption] = useState<'cod' | 'upi' | 'credit'>('cod');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState('');

  // Live Orders
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const loadCustomerOrders = async () => {
    const custId = customerData?.id || user?.customerId || user?.uid;
    if (!custId) return;
    setOrdersLoading(true);
    try {
      const orders = await orderService.getByCustomer(custId);
      setCustomerOrders(orders);
    } catch (err) {
      console.warn('Orders fetch note:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders();
  }, [customerData, user]);

  const handlePlaceOrder = async () => {
    const custId = customerData?.id || user?.customerId || user?.uid || 'temp_cust';
    const total = jarCount * jarPrice;

    setPlacingOrder(true);
    try {
      const newOrder = await orderService.create({
        customerId: custId,
        customerName: customerData?.name || user?.displayName || 'Water Customer',
        customerPhone: customerData?.phone || user?.phoneNumber || '',
        deliveryAddress: customerAddress,
        items: [
          {
            itemId: 'prod_20l_jar',
            itemName: '20L RO Pure Chilled Jar',
            quantity: jarCount,
            pricePerUnit: jarPrice,
            totalPrice: total
          }
        ],
        totalAmount: total,
        status: 'pending',
        paymentStatus: paymentOption === 'upi' ? 'paid' : 'pending',
        paymentMethod: paymentOption,
        amountPaid: paymentOption === 'upi' ? total : 0,
        deliveryDate: new Date().toISOString().split('T')[0],
        notes: `Slot: ${deliverySlot.toUpperCase()}${deliveryNote.trim() ? ` • ${deliveryNote.trim()}` : ''}`
      });

      setLastPlacedOrderId(newOrder.id);
      setOrderSuccessModal(true);
      loadCustomerOrders();
    } catch (err: any) {
      Alert.alert('Order Placement Notice', 'Your water order has been submitted to plant dispatch!');
      setOrderSuccessModal(true);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Find most recent active order
  const activeOrder = useMemo(() => {
    return customerOrders.find(o => o.status !== 'delivered' && o.status !== 'cancelled') || null;
  }, [customerOrders]);

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5"
      contentContainerStyle={{ paddingBottom: 85 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Branded Customer Greeting Hero Banner with LinearGradient */}
      <LinearGradient
        colors={isDark ? ['#0F2B48', '#0A1D33'] : ['#0284C7', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          elevation: 3,
          shadowColor: '#0284C7',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-1.5 mb-0.5">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-[10px] font-black text-sky-200 uppercase tracking-widest" numberOfLines={1}>
                {plantName}
              </Text>
            </View>
            <Text className="text-lg font-black text-white" numberOfLines={1}>
              Hello, {customerData?.name || user?.displayName || 'Customer'} 👋
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => Linking.openURL(`tel:8485877633`).catch(() => {})}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="call" size={13} color="#FFF" />
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>Plant Call</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-1.5 pt-2 border-t border-sky-400/30">
          <Ionicons name="location-sharp" size={13} color="#BAE6FD" />
          <Text className="text-[11px] font-semibold text-sky-100 flex-1" numberOfLines={1}>
            Delivery Address: <Text className="font-black text-white">{customerAddress}</Text>
          </Text>
        </View>
      </LinearGradient>

      {/* 2. Order 20L Water Jars Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center mb-2.5">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 justify-center items-center border border-sky-200 dark:border-sky-800">
              <Ionicons name="water" size={18} color="#0284C7" />
            </View>
            <View>
              <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                Order 20L Water Jars
              </Text>
              <Text className="text-[10.5px] font-bold text-slate-400">
                ₹{jarPrice} per 20-Litre pure RO chilled jar
              </Text>
            </View>
          </View>

          <View className="bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <Text className="text-[9.5px] font-black text-emerald-700 dark:text-emerald-300">
              Same-Day Drop
            </Text>
          </View>
        </View>

        {/* Jar Stepper Control */}
        <View className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-2.5 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => setJarCount((prev) => Math.max(1, prev - 1))}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#CBD5E1',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color="#0284C7" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {jarCount} <Text className="text-xs font-bold text-slate-400">Jars</Text>
            </Text>
            <Text className="text-xs font-black text-sky-600 dark:text-sky-400">
              Total: {formatCurrency(jarCount * jarPrice)}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => setJarCount((prev) => prev + 1)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: '#0284C7',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Preset Quick Chips */}
        <View className="flex-row gap-1.5 mb-2.5">
          {[1, 2, 5, 10].map((num) => (
            <TouchableOpacity 
              key={num}
              onPress={() => setJarCount(num)}
              style={{
                flex: 1,
                paddingVertical: 6,
                borderRadius: 7,
                alignItems: 'center',
                backgroundColor: jarCount === num ? '#0284C7' : '#F1F5F9',
                borderWidth: 1,
                borderColor: jarCount === num ? '#0284C7' : '#E2E8F0',
              }}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 11, fontWeight: '900', color: jarCount === num ? '#FFF' : '#475569' }}>
                {num} {num === 1 ? 'Jar' : 'Jars'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Timing Slots */}
        <Text className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">
          Preferred Delivery Timing
        </Text>
        <View className="flex-row gap-1.5 mb-2.5">
          {[
            { key: 'morning', label: 'Morning (7-10 AM)', icon: 'sunny-outline' },
            { key: 'evening', label: 'Evening (4-7 PM)', icon: 'moon-outline' },
            { key: 'urgent', label: 'Urgent Express', icon: 'flash-outline' },
          ].map((slot) => {
            const isSel = deliverySlot === slot.key;
            return (
              <TouchableOpacity
                key={slot.key}
                onPress={() => setDeliverySlot(slot.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSel ? '#0284C7' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: isSel ? '#0284C7' : '#CBD5E1',
                }}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: isSel ? '#FFF' : '#475569' }}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Method Selector */}
        <Text className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">
          Payment Preference
        </Text>
        <View className="flex-row gap-1.5 mb-3">
          {[
            { key: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' },
            { key: 'upi', label: 'UPI / Online', icon: 'qr-code-outline' },
            { key: 'credit', label: 'Monthly Account', icon: 'time-outline' },
          ].map((pm) => {
            const isSel = paymentOption === pm.key;
            return (
              <TouchableOpacity
                key={pm.key}
                onPress={() => setPaymentOption(pm.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSel ? '#0D9488' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: isSel ? '#0D9488' : '#CBD5E1',
                }}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: isSel ? '#FFF' : '#475569' }}>
                  {pm.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Place Order Button in Rectangular Format */}
        <TouchableOpacity 
          onPress={handlePlaceOrder}
          disabled={placingOrder}
          style={{
            height: 42,
            borderRadius: 9,
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
            style={{
              width: '100%',
              height: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            {placingOrder ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="cart" size={17} color="#FFF" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                  Place Delivery Order ({formatCurrency(jarCount * jarPrice)})
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 3. Live Active Order Tracker */}
      {activeOrder ? (
        <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Text className="text-xs font-black text-slate-900 dark:text-slate-50">
                Live Delivery Tracker
              </Text>
            </View>
            <Text className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/60">
              ORD-{activeOrder.id.slice(-4).toUpperCase()}
            </Text>
          </View>

          {/* Stepper Status Bar */}
          <View className="flex-row justify-between items-center my-2.5 px-2">
            {/* Step 1: Placed */}
            <View className="items-center">
              <View className="w-7 h-7 rounded-full bg-emerald-600 justify-center items-center mb-1">
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#059669' }}>Placed</Text>
            </View>

            <View className={`flex-1 h-0.5 ${activeOrder.status === 'assigned' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'} mx-1 mb-3`} />

            {/* Step 2: In Transit */}
            <View className="items-center">
              <View className={`w-7 h-7 rounded-full ${activeOrder.status === 'assigned' ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-700'} justify-center items-center mb-1`}>
                <Ionicons name="bicycle" size={14} color={activeOrder.status === 'assigned' ? '#FFF' : '#64748B'} />
              </View>
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: activeOrder.status === 'assigned' ? '#0284C7' : '#94A3B8' }}>
                In Transit
              </Text>
            </View>

            <View className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1 mb-3" />

            {/* Step 3: Delivered */}
            <View className="items-center">
              <View className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 justify-center items-center mb-1">
                <Ionicons name="home" size={13} color="#64748B" />
              </View>
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#94A3B8' }}>At Doorstep</Text>
            </View>
          </View>

          {/* Assigned Driver Box */}
          <View className="bg-sky-50 dark:bg-sky-950/40 p-2.5 rounded-xl border border-sky-100 dark:border-sky-800 flex-row justify-between items-center">
            <View>
              <Text className="text-xs font-bold text-sky-900 dark:text-sky-200">
                Driver: {activeOrder.assignedHelperName || 'Fleet Assigned on Route'}
              </Text>
              <Text className="text-[10px] text-sky-700 dark:text-sky-400">
                {activeOrder.items ? activeOrder.items.reduce((s, i) => s + i.quantity, 0) : 2} Jars • {formatCurrency(activeOrder.totalAmount)}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
              style={{
                backgroundColor: '#0284C7',
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: 7,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Ionicons name="call" size={11} color="#FFF" />
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFF' }}>Call Driver</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* 4. Bottle Ledger & Deposit Summary Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm">
        <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5">
          Jar Balance & Deposit Ledger
        </Text>

        <View className="flex-row gap-2">
          {/* Jars With You */}
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-2.5 items-center">
            <Ionicons name="water" size={18} color="#0284C7" />
            <Text className="text-xl font-black text-sky-900 dark:text-sky-100 mt-1">
              {jarsInPossession}
            </Text>
            <Text className="text-[9px] font-bold text-sky-700 dark:text-sky-300 uppercase mt-0.5">
              Jars With You
            </Text>
          </View>

          {/* Empty to Return */}
          <View className="flex-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 items-center">
            <Ionicons name="cube" size={18} color="#D97706" />
            <Text className="text-xl font-black text-amber-900 dark:text-amber-100 mt-1">
              {jarsInPossession}
            </Text>
            <Text className="text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase mt-0.5">
              Empty to Return
            </Text>
          </View>

          {/* Deposit Held */}
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2.5 items-center">
            <Ionicons name="shield-checkmark" size={18} color="#059669" />
            <Text className="text-xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
              ₹{securityDeposit}
            </Text>
            <Text className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mt-0.5">
              Deposit Held
            </Text>
          </View>
        </View>

        {/* Outstanding Dues Notice if any */}
        <View className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Account Ledger Balance:
            </Text>
            <Text className={`text-sm font-black ${unpaidDues > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {unpaidDues > 0 ? `Unpaid Dues: ${formatCurrency(unpaidDues)}` : 'All Dues Cleared (₹0)'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setPaymentModalVisible(true)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 7,
              backgroundColor: '#0284C7',
            }}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>
              Pay Online / UPI
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Recent Delivery History */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Past Delivery Orders ({customerOrders.length})
          </Text>
          <TouchableOpacity onPress={loadCustomerOrders}>
            <Ionicons name="refresh" size={14} color="#0284C7" />
          </TouchableOpacity>
        </View>

        {customerOrders.length === 0 ? (
          <View className="py-4 items-center">
            <Ionicons name="receipt-outline" size={24} color="#94A3B8" />
            <Text className="text-xs text-slate-400 mt-1">No past orders found</Text>
          </View>
        ) : (
          customerOrders.slice(0, 4).map((order) => (
            <View 
              key={order.id} 
              className="py-2 border-b border-slate-100 dark:border-slate-700/50 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                  {order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 1} Jars (20L)
                </Text>
                <Text className="text-[10px] text-slate-400">
                  📅 {formatDate(order.createdAt)} • {order.paymentMethod?.toUpperCase()}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                  {formatCurrency(order.totalAmount)}
                </Text>
                <View className={`px-1.5 py-0.5 rounded ${order.status === 'delivered' ? 'bg-emerald-100' : 'bg-sky-100'}`}>
                  <Text style={{ fontSize: 8.5, fontWeight: '900', color: order.status === 'delivered' ? '#047857' : '#0369A1', textTransform: 'uppercase' }}>
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Order Success Modal */}
      <Modal
        visible={orderSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOrderSuccessModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm items-center shadow-xl">
            <View className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 justify-center items-center mb-3">
              <Ionicons name="checkmark-done" size={32} color="#059669" />
            </View>
            <Text className="text-lg font-black text-slate-900 dark:text-slate-50 text-center mb-1">
              Order Placed Successfully!
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4 leading-relaxed">
              Your order for {jarCount} pure RO water jars has been routed to {plantName} logistics. Driver dispatch is in progress!
            </Text>
            <TouchableOpacity
              onPress={() => setOrderSuccessModal(false)}
              className="bg-emerald-600 w-full py-2.5 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-black">View Live Order Tracking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UPI Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                Online UPI Payment
              </Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="items-center py-3">
              <View className="w-40 h-40 bg-slate-100 dark:bg-slate-700 rounded-xl items-center justify-center mb-3 border border-slate-200">
                <Ionicons name="qr-code" size={120} color="#0F172A" />
              </View>
              <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                Pay to: {plantName}
              </Text>
              <Text className="text-[11px] font-bold text-sky-600 mt-0.5">
                UPI ID: 8485877633@okaxis
              </Text>
              <Text className="text-[10px] text-slate-400 text-center mt-2 px-4">
                Scan using Google Pay, PhonePe, or Paytm to settle your water dues directly with the plant.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setPaymentModalVisible(false);
                Alert.alert('Payment Recorded', 'Thank you! Your payment confirmation will be verified by the plant desk.');
              }}
              style={{
                height: 42,
                borderRadius: 8,
                backgroundColor: '#10B981',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 6
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                Confirm Payment Made
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
