import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ScrollView, 
  RefreshControl, 
  Alert, 
  Linking,
  Platform 
} from 'react-native';
import { getTenantCollection } from '@/services/firebase';
import { getDocs, query, orderBy } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EmptyState } from '@/components/common/EmptyState';

export interface UnifiedTransaction {
  id: string;
  type: 'inflow' | 'outflow';
  title: string;
  categoryOrMethod: string;
  amount: number;
  date: string;
  description?: string;
  receivedByName?: string;
  reference?: string;
  rawType: 'payment' | 'expense';
}

export default function TransactionsScreen() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [selectedTx, setSelectedTx] = useState<UnifiedTransaction | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const combined: UnifiedTransaction[] = [];

      // 1. Fetch Customer Payments / Inflows
      try {
        const paySnap = await getDocs(getTenantCollection('payments'));
        paySnap.forEach((doc) => {
          const data = doc.data();
          combined.push({
            id: doc.id,
            type: 'inflow',
            title: data.customerName || 'Customer Payment',
            categoryOrMethod: (data.method || 'cash').toUpperCase(),
            amount: Number(data.amount) || 0,
            date: data.paymentDate || data.createdAt || new Date().toISOString(),
            description: data.notes || `Payment collection from ${data.customerName || 'Client'}`,
            receivedByName: data.receivedByName || user?.displayName || 'Plant Owner',
            reference: data.reference || data.orderId || '',
            rawType: 'payment',
          });
        });
      } catch (payErr) {
        console.error('Error fetching payments:', payErr);
      }

      // 2. Fetch Operating Expenses / Outflows & Counter Income
      try {
        const expSnap = await getDocs(getTenantCollection('expenses'));
        expSnap.forEach((doc) => {
          const data = doc.data();
          const isIncome = data.entryType === 'income';
          combined.push({
            id: doc.id,
            type: isIncome ? 'inflow' : 'outflow',
            title: isIncome ? (data.category || 'Direct Counter Sale') : (data.category || 'Plant Expense'),
            categoryOrMethod: (data.paymentMode || 'cash').toUpperCase(),
            amount: Number(data.amount) || 0,
            date: data.date || new Date().toISOString(),
            description: data.description || '',
            receivedByName: data.recordedByName || user?.displayName || 'Plant Owner',
            reference: data.reference || '',
            rawType: 'expense',
          });
        });
      } catch (expErr) {
        console.error('Error fetching expenses:', expErr);
      }

      // Sort chronological descending
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(combined);
    } catch (e: any) {
      console.error('Transaction fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filtered list based on Search, Inflow/Outflow, and Date
  const filteredList = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return transactions.filter((tx) => {
      // Type filter
      if (filterType === 'inflow' && tx.type !== 'inflow') return false;
      if (filterType === 'outflow' && tx.type !== 'outflow') return false;

      // Date filter
      if (dateFilter === 'today') {
        const txDate = new Date(tx.date).toISOString().split('T')[0];
        if (txDate !== todayStr) return false;
      } else if (dateFilter === 'month') {
        const d = new Date(tx.date);
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesDesc = (tx.description || '').toLowerCase().includes(q);
        const matchesRef = (tx.reference || '').toLowerCase().includes(q);
        const matchesAmt = tx.amount.toString().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesRef && !matchesAmt) return false;
      }

      return true;
    });
  }, [transactions, filterType, dateFilter, searchQuery]);

  // Overall Financial Aggregates
  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'inflow') totalIn += tx.amount;
      else totalOut += tx.amount;
    });

    return {
      totalIn,
      totalOut,
      netProfit: totalIn - totalOut,
      totalCount: transactions.length,
    };
  }, [transactions]);

  // WhatsApp Voucher / Receipt Share
  const handleShareVoucher = (tx: UnifiedTransaction) => {
    const plant = user?.businessName || 'NextWater Plant';
    const isIn = tx.type === 'inflow';
    const text = 
      `*🧾 ${plant.toUpperCase()} - FINANCIAL TRANSACTION VOUCHER*\n\n` +
      `📌 *Type:* ${isIn ? '🟢 PAYMENT RECEIVED (INFLOW)' : '🔴 EXPENSE / OUTFLOW'}\n` +
      `🏷️ *Entity / Category:* ${tx.title}\n` +
      `💰 *Amount:* ₹${tx.amount.toLocaleString('en-IN')}\n` +
      `💳 *Mode:* ${tx.categoryOrMethod}\n` +
      `📅 *Date:* ${formatDate(tx.date)}\n` +
      `👤 *Recorded By:* ${tx.receivedByName || 'Plant Owner'}\n` +
      (tx.description ? `📝 *Note:* ${tx.description}\n` : '') +
      `\n_Generated via NextWater Water Plant Management Suite_`;

    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP PASSBOOK FINANCIAL BAR */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3.5 pt-2 pb-2.5">
        {/* KPI 3-Column Box */}
        <View className="flex-row gap-2 mb-2.5">
          {/* Inflows */}
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1 mb-1">
              <Ionicons name="arrow-down-circle" size={14} color="#059669" />
              <Text className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Inflows (+)
              </Text>
            </View>
            <Text className="text-base font-black text-emerald-700 dark:text-emerald-300">
              {formatCurrency(stats.totalIn)}
            </Text>
          </View>

          {/* Outflows */}
          <View className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1 mb-1">
              <Ionicons name="arrow-up-circle" size={14} color="#E11D48" />
              <Text className="text-[10px] font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Outflows (-)
              </Text>
            </View>
            <Text className="text-base font-black text-rose-700 dark:text-rose-300">
              {formatCurrency(stats.totalOut)}
            </Text>
          </View>

          {/* Net Cash Flow */}
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1 mb-1">
              <Ionicons name="wallet" size={14} color="#0284C7" />
              <Text className="text-[10px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                Net Balance
              </Text>
            </View>
            <Text className={`text-base font-black ${stats.netProfit >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-rose-600'}`}>
              {formatCurrency(stats.netProfit)}
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search by name, category, note, UTR or amount..."
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

        {/* Filter Badges Row 1: Flow Type */}
        <View className="flex-row gap-1.5 mb-1.5">
          {[
            { id: 'all', label: `All Entries (${transactions.length})` },
            { id: 'inflow', label: '🟢 Inflows (+ Received)' },
            { id: 'outflow', label: '🔴 Outflows (- Paid)' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilterType(f.id as any)}
              className={`flex-1 py-1.5 rounded-xl items-center border ${
                filterType === f.id
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-[10px] font-bold ${filterType === f.id ? 'text-sky-600 dark:text-sky-400 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Badges Row 2: Date Timeline */}
        <View className="flex-row gap-1.5">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today Only' },
            { id: 'month', label: 'This Month' },
          ].map((df) => (
            <TouchableOpacity
              key={df.id}
              onPress={() => setDateFilter(df.id as any)}
              className={`flex-1 py-1.5 rounded-xl items-center border ${
                dateFilter === df.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-[10px] font-bold ${dateFilter === df.id ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                {df.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. TRANSACTIONS UNIFIED PASSBOOK LIST */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => `${item.rawType}-${item.id}`}
        contentContainerStyle={{ padding: 12, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTransactions} colors={['#0284c7']} />}
        ListEmptyComponent={
          <EmptyState 
            message="No financial transactions match your filter criteria." 
            iconName="receipt-outline" 
          />
        }
        renderItem={({ item }) => {
          const isInflow = item.type === 'inflow';
          return (
            <TouchableOpacity
              onPress={() => setSelectedTx(item)}
              activeOpacity={0.8}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-2.5 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${isInflow ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-rose-50 dark:bg-rose-950/60'}`}>
                    <Ionicons 
                      name={isInflow ? "arrow-down" : "arrow-up"} 
                      size={18} 
                      color={isInflow ? "#059669" : "#E11D48"} 
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[14.5px] font-black text-slate-900 dark:text-slate-50" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      📅 {formatDate(item.date)} • By {item.receivedByName || 'Owner'}
                    </Text>
                  </View>
                </View>

                {/* Amount & Badge */}
                <View className="items-end">
                  <Text className={`text-base font-black ${isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isInflow ? '+' : '-'}{formatCurrency(item.amount)}
                  </Text>
                  <View className={`px-2 py-0.5 rounded-md mt-1 ${isInflow ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-rose-100 dark:bg-rose-900/60'}`}>
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${isInflow ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {item.categoryOrMethod}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description Snippet if present */}
              {item.description ? (
                <View className="bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-xl mt-1 mb-2">
                  <Text className="text-xs text-slate-600 dark:text-slate-300" numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View className="flex-row justify-end gap-2 pt-1.5 border-t border-slate-50 dark:border-slate-800">
                <TouchableOpacity
                  onPress={() => handleShareVoucher(item)}
                  className="py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 flex-row items-center gap-1.5 active:opacity-75"
                >
                  <Ionicons name="logo-whatsapp" size={13} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Share Receipt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedTx(item)}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 flex-row items-center gap-1.5"
                >
                  <Ionicons name="eye-outline" size={13} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Voucher Slip
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* TRANSACTION VOUCHER DETAIL MODAL */}
      <Modal
        visible={!!selectedTx}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedTx(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl">
            {/* Header */}
            <View className="items-center pb-3 border-b border-slate-100 dark:border-slate-700">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 ${selectedTx?.type === 'inflow' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-rose-50 dark:bg-rose-950'}`}>
                <Ionicons 
                  name={selectedTx?.type === 'inflow' ? "checkmark-circle" : "receipt"} 
                  size={24} 
                  color={selectedTx?.type === 'inflow' ? "#059669" : "#E11D48"} 
                />
              </View>
              <Text className="text-base font-black text-slate-900 dark:text-slate-50 text-center">
                {selectedTx?.title}
              </Text>
              <Text className={`text-2xl font-black mt-1 ${selectedTx?.type === 'inflow' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {selectedTx?.type === 'inflow' ? '+' : '-'}{formatCurrency(selectedTx?.amount || 0)}
              </Text>
            </View>

            {/* Details */}
            <View className="py-3 gap-2">
              <View className="flex-row justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <Text className="text-xs font-semibold text-slate-400">Transaction Date</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedTx?.date || '')}</Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <Text className="text-xs font-semibold text-slate-400">Payment Mode</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedTx?.categoryOrMethod}</Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <Text className="text-xs font-semibold text-slate-400">Logged By</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedTx?.receivedByName || 'Owner'}</Text>
              </View>

              {selectedTx?.description ? (
                <View className="py-1">
                  <Text className="text-xs font-semibold text-slate-400 mb-1">Notes / Purpose</Text>
                  <Text className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl">
                    {selectedTx.description}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Modal Actions with LinearGradient */}
            <View className="flex-row gap-2.5 mt-3">
              <TouchableOpacity
                onPress={() => {
                  if (selectedTx) handleShareVoucher(selectedTx);
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
                  <Ionicons name="logo-whatsapp" size={15} color="#FFF" />
                  <Text className="text-xs font-black text-white">WhatsApp Slip</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTx(null)}
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
