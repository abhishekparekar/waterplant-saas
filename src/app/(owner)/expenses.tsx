import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  TextInput,
  RefreshControl,
  Linking,
  ActivityIndicator
} from 'react-native';
import { getTenantCollection } from '@/services/firebase';
import { getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface PaymentEntryRecord {
  id: string;
  entryType: 'expense' | 'income';
  category: string;
  amount: number;
  description: string;
  paymentMode: 'cash' | 'upi' | 'bank' | 'cheque';
  date: string;
  recordedByName?: string;
  reference?: string;
}

const EXPENSE_CATEGORIES = [
  { label: 'Fuel / Diesel', value: 'Vehicle Fuel', icon: 'speedometer-outline' },
  { label: 'Electricity Bill', value: 'Plant Electricity', icon: 'flash-outline' },
  { label: 'RO Filters & Chemicals', value: 'RO Filters & Chemical', icon: 'water-outline' },
  { label: 'Vehicle Maintenance', value: 'Vehicle Maintenance', icon: 'construct-outline' },
  { label: 'Driver / Staff Wages', value: 'Wages & Driver Pay', icon: 'people-outline' },
  { label: 'New Jars Purchase', value: 'New Jar Purchase', icon: 'cube-outline' },
  { label: 'Plant Rent', value: 'Plant Rent', icon: 'home-outline' },
  { label: 'Misc Expense', value: 'Miscellaneous Expense', icon: 'ellipsis-horizontal-circle-outline' },
];

const INCOME_CATEGORIES = [
  { label: 'Counter Cash Sale', value: 'Counter Jar Sale', icon: 'cash-outline' },
  { label: 'Security Deposit Received', value: 'Security Deposit Inflow', icon: 'shield-checkmark-outline' },
  { label: 'Scrap / Broken Jars Sale', value: 'Scrap & Jar Salvage', icon: 'trash-outline' },
  { label: 'Event Advance Inflow', value: 'Event Order Advance', icon: 'calendar-outline' },
  { label: 'Misc Inflow', value: 'Miscellaneous Income', icon: 'wallet-outline' },
];

const AMOUNT_PRESETS = [50, 100, 200, 500, 1000, 2000, 5000];

export default function ExpensesScreen() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<PaymentEntryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank' | 'cheque'>('cash');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // List Filter State
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(getTenantCollection('expenses'));
      const list: PaymentEntryRecord[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          entryType: data.entryType || 'expense',
          category: data.category || 'General',
          amount: Number(data.amount) || 0,
          description: data.description || '',
          paymentMode: data.paymentMode || 'cash',
          date: data.date || new Date().toISOString(),
          recordedByName: data.recordedByName || user?.displayName || 'Owner',
          reference: data.reference || '',
        });
      });
      // Sort desc
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(list);
    } catch (e) {
      console.error('Failed to fetch payment entries:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Set default category when toggling entryType
  const handleTypeChange = (type: 'expense' | 'income') => {
    setEntryType(type);
    if (type === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].value);
    } else {
      setCategory(INCOME_CATEGORIES[0].value);
    }
  };

  // Financial Summary Aggregation
  const summary = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;

    entries.forEach((item) => {
      if (item.entryType === 'income') {
        totalIncome += item.amount;
      } else {
        totalExpense += item.amount;
      }
    });

    return {
      totalExpense,
      totalIncome,
      net: totalIncome - totalExpense,
    };
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      if (filterType === 'expense' && item.entryType !== 'expense') return false;
      if (filterType === 'income' && item.entryType !== 'income') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchAmt = item.amount.toString().includes(q);
        if (!matchCategory && !matchDesc && !matchAmt) return false;
      }

      return true;
    });
  }, [entries, filterType, searchQuery]);

  const handleAddEntry = async () => {
    const val = parseFloat(amount);
    if (!category || isNaN(val) || val <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    const now = new Date().toISOString();

    try {
      const payload = {
        entryType,
        category,
        amount: val,
        paymentMode,
        description: description.trim() || category,
        reference: reference.trim(),
        date: now,
        recordedByName: user?.displayName || 'Plant Owner',
      };

      const docRef = await addDoc(getTenantCollection('expenses'), payload);

      const newEntry: PaymentEntryRecord = {
        id: docRef.id,
        ...payload,
      };

      setEntries([newEntry, ...entries]);
      setAmount('');
      setDescription('');
      setReference('');
      setModalVisible(false);
      Alert.alert('Success', `${entryType === 'income' ? 'Income' : 'Expense'} entry of ${formatCurrency(val)} recorded successfully.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to record entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = (entry: PaymentEntryRecord) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete this ${entry.entryType} record of ${formatCurrency(entry.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(getTenantCollection('expenses'), entry.id));
              setEntries((prev) => prev.filter((e) => e.id !== entry.id));
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete record.');
            }
          },
        },
      ]
    );
  };

  const handleShareVoucher = (entry: PaymentEntryRecord) => {
    const plant = user?.businessName || 'NextWater Plant';
    const isInc = entry.entryType === 'income';
    const text = 
      `*🧾 ${plant.toUpperCase()} - PAYMENT VOUCHER*\n\n` +
      `📌 *Type:* ${isInc ? '🟢 DIRECT INFLOW / INCOME' : '🔴 OPERATING EXPENSE'}\n` +
      `🏷️ *Category:* ${entry.category}\n` +
      `💰 *Amount:* ₹${entry.amount.toLocaleString('en-IN')}\n` +
      `💳 *Payment Mode:* ${entry.paymentMode.toUpperCase()}\n` +
      `📅 *Date:* ${formatDate(entry.date)}\n` +
      `👤 *Logged By:* ${entry.recordedByName || 'Plant Owner'}\n` +
      (entry.description ? `📝 *Note:* ${entry.description}\n` : '') +
      (entry.reference ? `🔖 *Ref/UTR:* ${entry.reference}\n` : '') +
      `\n_Recorded via NextWater Water Plant Management Suite_`;

    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP FINANCIAL KPI SUMMARY BAR */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3.5 pt-2 pb-2.5">
        <View className="flex-row gap-2 mb-2.5">
          {/* Total Expenses */}
          <View className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1 mb-1">
              <Ionicons name="arrow-up-circle" size={14} color="#E11D48" />
              <Text className="text-[10px] font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Expenses
              </Text>
            </View>
            <Text className="text-base font-black text-rose-700 dark:text-rose-300">
              {formatCurrency(summary.totalExpense)}
            </Text>
          </View>

          {/* Direct Income */}
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1 mb-1">
              <Ionicons name="arrow-down-circle" size={14} color="#059669" />
              <Text className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Income
              </Text>
            </View>
            <Text className="text-base font-black text-emerald-700 dark:text-emerald-300">
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>

          {/* Net */}
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1 mb-1">
              <Ionicons name="wallet-outline" size={14} color="#0284C7" />
              <Text className="text-[10px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                Net Operating
              </Text>
            </View>
            <Text className={`text-base font-black ${summary.net >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-rose-600'}`}>
              {formatCurrency(summary.net)}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search by category, description or amount..."
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

        {/* Filter Badges */}
        <View className="flex-row gap-1.5">
          {[
            { id: 'all', label: `All Entries (${entries.length})` },
            { id: 'expense', label: '🔴 Expenses (Outflow)' },
            { id: 'income', label: '🟢 Direct Income (Inflow)' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilterType(f.id as any)}
              className={`flex-1 py-1.5 rounded-xl items-center border ${
                filterType === f.id
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-[10px] font-bold ${filterType === f.id ? 'text-rose-700 dark:text-rose-300 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. ENTRIES LIST */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 95 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEntries} colors={['#e11d48']} />}
        ListEmptyComponent={
          <EmptyState 
            message="No payment/expense entries match your filter. Tap (+) to record a new entry." 
            iconName="receipt-outline" 
          />
        }
        renderItem={({ item }) => {
          const isInc = item.entryType === 'income';
          return (
            <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-2.5 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${isInc ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-rose-50 dark:bg-rose-950/60'}`}>
                    <Ionicons 
                      name={isInc ? "arrow-down" : "arrow-up"} 
                      size={18} 
                      color={isInc ? "#059669" : "#E11D48"} 
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[14.5px] font-black text-slate-900 dark:text-slate-50">
                      {item.category}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      📅 {formatDate(item.date)} • Mode: {item.paymentMode.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Amount */}
                <View className="items-end">
                  <Text className={`text-base font-black ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isInc ? '+' : '-'}{formatCurrency(item.amount)}
                  </Text>
                  <View className={`px-2 py-0.5 rounded-md mt-1 ${isInc ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-rose-100 dark:bg-rose-900/60'}`}>
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${isInc ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {isInc ? 'Direct Income' : 'Operating Expense'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Note / Description */}
              {item.description ? (
                <View className="bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-xl mt-1 mb-2">
                  <Text className="text-xs text-slate-600 dark:text-slate-300">
                    {item.description}
                  </Text>
                </View>
              ) : null}

              {/* Card Actions */}
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                <Text className="text-[10px] text-slate-400 font-medium">
                  By {item.recordedByName || 'Plant Owner'}
                </Text>

                <View className="flex-row gap-2">
                  {/* Share Receipt */}
                  <TouchableOpacity
                    onPress={() => handleShareVoucher(item)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 flex-row items-center gap-1.5 active:opacity-75"
                  >
                    <Ionicons name="logo-whatsapp" size={13} color="#059669" />
                    <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Share
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Entry */}
                  <TouchableOpacity
                    onPress={() => handleDeleteEntry(item)}
                    className="py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800 flex-row items-center gap-1.5 active:opacity-75"
                  >
                    <Ionicons name="trash-outline" size={13} color="#E11D48" />
                    <Text className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* FLOATING ACTION BUTTON WITH LINEAR GRADIENT */}
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
          shadowColor: '#E11D48',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
        }}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#E11D48', '#BE123C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* LOG PAYMENT / EXPENSE MODAL */}
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
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 max-h-[92%]">
            {/* Header */}
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
              <View className="flex-row items-center gap-2">
                <View className={`w-8 h-8 rounded-lg items-center justify-center ${entryType === 'income' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-rose-50 dark:bg-rose-950'}`}>
                  <Ionicons name={entryType === 'income' ? "wallet" : "receipt"} size={16} color={entryType === 'income' ? "#059669" : "#E11D48"} />
                </View>
                <Text className="text-[14px] font-black text-slate-900 dark:text-slate-50">
                  {entryType === 'income' ? 'Record Direct Income' : 'Record Operating Expense'}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Mode Selector: [ Expense Outflow ] | [ Direct Income Inflow ] */}
              <Text className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Entry Nature
              </Text>
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => handleTypeChange('expense')}
                  className={`flex-1 py-2 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                    entryType === 'expense' 
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Ionicons name="arrow-up-circle-outline" size={15} color={entryType === 'expense' ? '#E11D48' : '#64748B'} />
                  <Text className={`text-[11px] font-bold ${entryType === 'expense' ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600'}`}>
                    Expense (Outflow)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleTypeChange('income')}
                  className={`flex-1 py-2 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                    entryType === 'income' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Ionicons name="arrow-down-circle-outline" size={15} color={entryType === 'income' ? '#059669' : '#64748B'} />
                  <Text className={`text-[11px] font-bold ${entryType === 'income' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600'}`}>
                    Direct Income (Inflow)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Category Selector Chips */}
              <Text className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {entryType === 'income' ? 'Income Category' : 'Expense Category'}
              </Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {(entryType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((preset) => {
                  const isSelected = category === preset.value;
                  return (
                    <TouchableOpacity
                      key={preset.value}
                      onPress={() => setCategory(preset.value)}
                      className={`px-2.5 py-1.5 rounded-xl border flex-row items-center gap-1 ${
                        isSelected 
                          ? entryType === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500' : 'bg-rose-50 dark:bg-rose-950/50 border-rose-500'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={preset.icon as any} 
                        size={12} 
                        color={isSelected ? (entryType === 'income' ? '#059669' : '#E11D48') : '#64748B'} 
                      />
                      <Text className={`text-[10px] font-bold ${isSelected ? (entryType === 'income' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300') : 'text-slate-600 dark:text-slate-400'}`}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Payment Mode Selector */}
              <Text className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Mode
              </Text>
              <View className="flex-row gap-1.5 mb-3">
                {[
                  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
                  { id: 'upi', label: 'UPI / QR', icon: 'qr-code-outline' },
                  { id: 'bank', label: 'Bank Transfer', icon: 'business-outline' },
                  { id: 'cheque', label: 'Cheque', icon: 'document-text-outline' },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setPaymentMode(m.id as any)}
                    className={`flex-1 py-1.5 rounded-xl border flex-row items-center justify-center gap-1 ${
                      paymentMode === m.id 
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Ionicons name={m.icon as any} size={11} color={paymentMode === m.id ? '#0284C7' : '#64748B'} />
                    <Text className={`text-[9.5px] font-bold ${paymentMode === m.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount Presets */}
              <View className="flex-row flex-wrap gap-1 mb-2">
                {AMOUNT_PRESETS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmount(amt.toString())}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700/80 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <Text className="text-[9.5px] font-black text-slate-700 dark:text-slate-300">
                      ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Amount (₹) *"
                placeholder="e.g. 500"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              <Input
                label="Description / Purpose"
                placeholder="e.g. 20 Liters Diesel for delivery pickup"
                value={description}
                onChangeText={setDescription}
              />

              <Input
                label="Reference No. / UTR (Optional)"
                placeholder="e.g. UPI Ref / Receipt No."
                value={reference}
                onChangeText={setReference}
              />

              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddEntry}
                  disabled={submitting}
                  className="flex-1 h-11 rounded-xl overflow-hidden shadow-sm shadow-black/10"
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={entryType === 'income' ? ['#10B981', '#059669'] : ['#E11D48', '#BE123C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full items-center justify-center flex-row gap-1.5"
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons 
                          name={entryType === 'income' ? "checkmark-circle-outline" : "paper-plane-outline"} 
                          size={16} 
                          color="#FFF" 
                        />
                        <Text className="text-xs font-bold text-white tracking-wide">
                          {entryType === 'income' ? 'Save Income' : 'Save Expense'}
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
