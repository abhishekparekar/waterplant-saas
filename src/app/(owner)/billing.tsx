import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  Modal, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCustomerStore } from '@/store/customerStore';
import { paymentService } from '@/services/paymentService';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Customer } from '@/types/customer';
import { Payment, PaymentMethod } from '@/types/payment';

type BillingTab = 'ledger' | 'transactions';
type BillingFilter = 'all' | 'dues' | 'settled';

const PAYMENT_PRESETS = [100, 200, 350, 500, 1000, 2000];

export default function BillingScreen() {
  const router = useRouter();
  const { customers, loading, fetchCustomers } = useCustomerStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<BillingTab>('ledger');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Modals
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceModalCust, setInvoiceModalCust] = useState<Customer | null>(null);

  // Payment Form State
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<BillingFilter>('all');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    fetchCustomers();
    try {
      setLoadingPayments(true);
      const res = await paymentService.getAll();
      setPayments(res);
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = !searchQuery.trim() || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        c.phone.includes(searchQuery.trim()) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      
      let matchesFilter = true;
      if (filter === 'dues') matchesFilter = (c.balance || 0) > 0;
      if (filter === 'settled') matchesFilter = (c.balance || 0) <= 0;

      return matchesSearch && matchesFilter;
    });
  }, [customers, searchQuery, filter]);

  // Overall financial summary metrics
  const summary = useMemo(() => {
    let totalDues = 0;
    let totalAdvance = 0;
    let countWithDues = 0;

    customers.forEach((c) => {
      if ((c.balance || 0) > 0) {
        totalDues += c.balance;
        countWithDues++;
      } else if ((c.balance || 0) < 0) {
        totalAdvance += Math.abs(c.balance);
      }
    });

    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return { totalDues, totalAdvance, countWithDues, totalCollected };
  }, [customers, payments]);

  const openPaymentModal = (cust: Customer) => {
    setSelectedCust(cust);
    setAmount(cust.balance > 0 ? cust.balance.toString() : '35');
    setNotes('');
    setPaymentMethod('cash');
    setModalVisible(true);
  };

  // Official WhatsApp Invoice / Account Statement Share
  const handleSendWhatsAppInvoice = (cust: Customer) => {
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const plantName = user?.businessName || 'NextWater Plant';
    const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const dues = cust.balance || 0;
    const rate = cust.pricePerJar || 35;
    const jars = cust.emptyBottlesHeld || 0;

    const message = 
      `*💧 ${plantName.toUpperCase()} - TAX INVOICE & BILL*\n` +
      `📅 *Billing Month:* ${monthName}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Customer:* ${cust.name}\n` +
      `📞 *Phone:* ${cust.phone}\n` +
      `📍 *Delivery Address:* ${cust.address || 'Local Route'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏷️ *Product:* 20L Premium RO Water Jar\n` +
      `💰 *Standard Rate:* ₹${rate} / Jar\n` +
      `🪣 *Empty Jars Held:* ${jars} Jars\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *TOTAL OUTSTANDING PAYABLE:* ₹${dues.toLocaleString('en-IN')}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💳 *Payment Methods Accepted:*\n` +
      `• Cash to Delivery Executive\n` +
      `• UPI QR / GPay / PhonePe\n\n` +
      `_Please settle the dues at your earliest convenience. Thank you for choosing ${plantName}!_`;

    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  const handleRecordPayment = async () => {
    if (!selectedCust) return;
    const payAmt = parseFloat(amount);
    
    if (isNaN(payAmt) || payAmt <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const recorded = await paymentService.processPayment({
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        amount: payAmt,
        method: paymentMethod,
        receivedById: user?.uid || 'owner',
        receivedByName: user?.displayName || 'Plant Owner',
        paymentDate: new Date().toISOString(),
      });
      
      setPayments((prev) => [recorded, ...prev]);
      Alert.alert('Payment Recorded', `Successfully collected ${formatCurrency(payAmt)} from ${selectedCust.name} via ${paymentMethod.toUpperCase()}`);
      setModalVisible(false);
      setAmount('');
      setSelectedCust(null);
      fetchCustomers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP FINANCIAL SUMMARY CARD WITH LINEAR GRADIENT */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3.5 pt-2 pb-2">
        <LinearGradient
          colors={['#E11D48', '#BE123C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 16,
            marginBottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#E11D48',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 6
          }}
        >
          <View>
            <Text className="text-[11px] font-black text-rose-100 uppercase tracking-wider">
              Total Outstanding Customer Dues
            </Text>
            <Text className="text-2xl font-black text-white mt-1">
              {formatCurrency(summary.totalDues)}
            </Text>
            <Text className="text-xs text-rose-100 font-bold mt-1">
              Pending across {summary.countWithDues} client accounts
            </Text>
          </View>

          <View className="w-12 h-12 rounded-2xl bg-white/20 justify-center items-center border border-white/30">
            <Ionicons name="wallet" size={24} color="#FFF" />
          </View>
        </LinearGradient>

        {/* View Switcher: [ Customer Ledgers ] | [ Transaction History ] */}
        <View className="bg-slate-200/80 dark:bg-slate-900/80 p-1 rounded-xl flex-row mb-2">
          <TouchableOpacity 
            onPress={() => setActiveTab('ledger')}
            className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-1.5 ${
              activeTab === 'ledger' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-transparent'
            }`}
          >
            <Ionicons name="people-outline" size={15} color={activeTab === 'ledger' ? '#0284C7' : '#64748B'} />
            <Text className={`text-xs font-black ${activeTab === 'ledger' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
              Customer Dues ({summary.countWithDues})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('transactions')}
            className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-1.5 ${
              activeTab === 'transactions' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-transparent'
            }`}
          >
            <Ionicons name="receipt-outline" size={15} color={activeTab === 'transactions' ? '#0284C7' : '#64748B'} />
            <Text className={`text-xs font-black ${activeTab === 'transactions' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
              Payment Receipts ({payments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar & Filter Chips (Only on Ledger View) */}
        {activeTab === 'ledger' && (
          <View>
            <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
              <Ionicons name="search-outline" size={16} color="#94A3B8" />
              <TextInput 
                placeholder="Search by customer name, phone, address..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 ml-2 py-0"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row gap-1.5">
              {[
                { id: 'all', label: `All Clients (${customers.length})` },
                { id: 'dues', label: `Pending Dues (${summary.countWithDues})` },
                { id: 'settled', label: 'Settled / Advance' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFilter(f.id as any)}
                  className={`flex-1 py-1.5 rounded-xl items-center border ${
                    filter === f.id 
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className={`text-[10.5px] font-bold ${filter === f.id ? 'text-sky-600 dark:text-sky-400 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 2. TAB CONTENT */}
      {activeTab === 'ledger' ? (
        /* CUSTOMER DUES LEDGER LIST */
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 110 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={['#0284c7']} />}
          ListEmptyComponent={() => (
            <View className="py-12 items-center">
              <Ionicons name="checkmark-done-circle-outline" size={40} color="#10B981" />
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">All Dues Settled!</Text>
              <Text className="text-xs text-slate-400 mt-0.5">No customers found with pending balances in this filter.</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const hasDues = (item.balance || 0) > 0;
            return (
              <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-2.5 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-[14.5px] font-black text-slate-900 dark:text-slate-50">
                      {item.name}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {item.phone} • {item.address || 'Local Route'}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className={`text-base font-black ${hasDues ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(Math.abs(item.balance || 0))}
                    </Text>
                    <Text className={`text-[10px] font-black uppercase ${hasDues ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {hasDues ? 'Due Balance' : 'Settled'}
                    </Text>
                  </View>
                </View>

                {/* Sub-meta: Jars & Rate */}
                <View className="flex-row items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-xl mb-2.5 border border-slate-100 dark:border-slate-800">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="cube-outline" size={13} color="#2563EB" />
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.emptyBottlesHeld || 0} Jars with client
                    </Text>
                  </View>
                  <Text className="text-slate-300">•</Text>
                  <Text className="text-xs font-semibold text-slate-500">
                    Rate: ₹{item.pricePerJar || 35}/jar
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* WhatsApp Bill / Invoice Button */}
                  <TouchableOpacity
                    onPress={() => handleSendWhatsAppInvoice(item)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 flex-row items-center justify-center gap-1.5 active:opacity-75"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-whatsapp" size={15} color="#059669" />
                    <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Send Invoice
                    </Text>
                  </TouchableOpacity>

                  {/* View Invoice Preview Slip */}
                  <TouchableOpacity
                    onPress={() => setInvoiceModalCust(item)}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 flex-row items-center justify-center gap-1.5"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="document-text-outline" size={14} color="#64748B" />
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Preview
                    </Text>
                  </TouchableOpacity>

                  {/* Record Payment Button with LinearGradient */}
                  <TouchableOpacity
                    onPress={() => openPaymentModal(item)}
                    activeOpacity={0.85}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      overflow: 'hidden',
                      elevation: 2,
                      shadowColor: '#0284C7',
                      shadowOffset: { width: 0, height: 1.5 },
                      shadowOpacity: 0.25,
                      shadowRadius: 2.5
                    }}
                  >
                    <LinearGradient
                      colors={['#0284C7', '#0EA5E9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      <Ionicons name="cash-outline" size={14} color="#FFF" />
                      <Text className="text-xs font-black text-white">
                        Collect Pay
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      ) : (
        /* REAL-TIME TRANSACTION RECEIPTS HISTORY */
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 110 }}
          refreshControl={<RefreshControl refreshing={loadingPayments} onRefresh={loadData} colors={['#0284c7']} />}
          ListEmptyComponent={() => (
            <View className="py-12 items-center">
              <Ionicons name="receipt-outline" size={40} color="#94A3B8" />
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">No Payment Receipts Yet</Text>
              <Text className="text-xs text-slate-400 mt-0.5">Recorded payments will appear here in real-time.</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const isUPI = item.method === 'upi';
            const isBank = item.method === 'bank_transfer' || item.method === 'credit';
            return (
              <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-2.5 shadow-sm flex-row justify-between items-center">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${isUPI ? 'bg-indigo-50 dark:bg-indigo-950/60' : isBank ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-emerald-50 dark:bg-emerald-950/60'}`}>
                    <Ionicons 
                      name={isUPI ? "qr-code-outline" : isBank ? "card-outline" : "cash-outline"} 
                      size={18} 
                      color={isUPI ? "#6366F1" : isBank ? "#D97706" : "#059669"} 
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                      {item.customerName}
                    </Text>
                    <Text className="text-[11px] text-slate-400 mt-0.5">
                      Collected by {item.receivedByName || 'Plant Owner'} • {formatDate(item.paymentDate || item.createdAt)}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(item.amount)}
                  </Text>
                  <View className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md mt-1">
                    <Text className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {item.method.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* RECORD PAYMENT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[88%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Record Customer Payment
                </Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  Client: {selectedCust?.name} (Current Dues: {formatCurrency(selectedCust?.balance || 0)})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Payment Method Selector */}
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Payment Mode
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
                  { id: 'upi', label: 'UPI QR', icon: 'qr-code-outline' },
                  { id: 'bank_transfer', label: 'Bank / Cheque', icon: 'business-outline' },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setPaymentMethod(m.id as any)}
                    className={`flex-1 py-2.5 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                      paymentMethod === m.id 
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Ionicons name={m.icon as any} size={15} color={paymentMethod === m.id ? '#0284C7' : '#64748B'} />
                    <Text className={`text-xs font-bold ${paymentMethod === m.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Amount Chips */}
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Quick Presets
              </Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {selectedCust && selectedCust.balance > 0 && (
                  <TouchableOpacity
                    onPress={() => setAmount(selectedCust.balance.toString())}
                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800"
                  >
                    <Text className="text-xs font-black text-rose-600 dark:text-rose-400">
                      Full Due (₹{selectedCust.balance})
                    </Text>
                  </TouchableOpacity>
                )}
                {PAYMENT_PRESETS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmount(amt.toString())}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <Text className="text-xs font-black text-slate-700 dark:text-slate-300">
                      ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Received Amount (₹) *"
                placeholder="e.g. 500"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              <Input
                label="Payment Note / Transaction Reference"
                placeholder="e.g. Google Pay UTR 12345"
                value={notes}
                onChangeText={setNotes}
              />

              <View className="flex-row gap-2.5 mt-3">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={submitting}
                  onPress={handleRecordPayment}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#0284C7',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    opacity: submitting ? 0.7 : 1
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0284C7', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text className="text-sm font-black text-white">
                      {submitting ? 'Recording...' : 'Confirm Payment'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* INVOICE PREVIEW SLIP MODAL */}
      <Modal
        visible={!!invoiceModalCust}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setInvoiceModalCust(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl">
            <View className="items-center pb-3 border-b border-slate-100 dark:border-slate-700">
              <View className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 items-center justify-center mb-1.5">
                <Ionicons name="receipt" size={22} color="#0284C7" />
              </View>
              <Text className="text-base font-black text-slate-900 dark:text-slate-50 text-center">
                {user?.businessName || 'NextWater Plant'}
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">Monthly Tax Invoice Slip</Text>
            </View>

            <View className="py-3 gap-2">
              <View className="flex-row justify-between py-0.5">
                <Text className="text-xs text-slate-400">Customer</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{invoiceModalCust?.name}</Text>
              </View>
              <View className="flex-row justify-between py-0.5">
                <Text className="text-xs text-slate-400">Contact</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{invoiceModalCust?.phone}</Text>
              </View>
              <View className="flex-row justify-between py-0.5">
                <Text className="text-xs text-slate-400">20L Jars Held</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{invoiceModalCust?.emptyBottlesHeld || 0} Jars</Text>
              </View>
              <View className="flex-row justify-between py-0.5">
                <Text className="text-xs text-slate-400">Price Rate</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">₹{invoiceModalCust?.pricePerJar || 35} / Jar</Text>
              </View>

              <View className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl mt-2 flex-row justify-between items-center border border-slate-100 dark:border-slate-700">
                <Text className="text-xs font-black text-slate-800 dark:text-slate-100">Total Net Due</Text>
                <Text className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(invoiceModalCust?.balance || 0)}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={() => {
                  if (invoiceModalCust) {
                    handleSendWhatsAppInvoice(invoiceModalCust);
                    setInvoiceModalCust(null);
                  }
                }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  overflow: 'hidden',
                  elevation: 2,
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 1.5 },
                  shadowOpacity: 0.25,
                  shadowRadius: 2.5
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
                  <Text className="text-xs font-black text-white">Send WhatsApp</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setInvoiceModalCust(null)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#F1F5F9',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
