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
import { useCustomerStore } from '@/store/customerStore';
import { customerService } from '@/services/customerService';
import { inventoryService } from '@/services/inventoryService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Customer } from '@/types/customer';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function ProductsInUseScreen() {
  const { customers, loading, fetchCustomers } = useCustomerStore();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'heavy' | 'deposit' | 'nodeposit'>('all');

  // Audit Modal State
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [auditAction, setAuditAction] = useState<'return' | 'issue'>('return');
  const [auditJarCount, setAuditJarCount] = useState('1');
  const [submittingAudit, setSubmittingAudit] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Overall Jar Asset Metrics
  const metrics = useMemo(() => {
    let totalJarsInField = 0;
    let totalDeposits = 0;
    let heavyHoldersCount = 0;
    let totalHolders = 0;

    customers.forEach((c) => {
      const jars = c.emptyBottlesHeld || 0;
      if (jars > 0) {
        totalJarsInField += jars;
        totalHolders++;
        if (jars >= 5) heavyHoldersCount++;
      }
      totalDeposits += c.depositPaid || 0;
    });

    return {
      totalJarsInField,
      totalDeposits,
      heavyHoldersCount,
      totalHolders,
    };
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => (c.emptyBottlesHeld || 0) > 0)
      .filter((c) => {
        // Filter tabs
        if (filterType === 'heavy' && (c.emptyBottlesHeld || 0) < 5) return false;
        if (filterType === 'deposit' && (c.depositPaid || 0) <= 0) return false;
        if (filterType === 'nodeposit' && (c.depositPaid || 0) > 0) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = c.name.toLowerCase().includes(q);
          const matchesPhone = c.phone.includes(q);
          const matchesAddr = (c.address || '').toLowerCase().includes(q);
          if (!matchesName && !matchesPhone && !matchesAddr) return false;
        }

        return true;
      })
      .sort((a, b) => (b.emptyBottlesHeld || 0) - (a.emptyBottlesHeld || 0));
  }, [customers, filterType, searchQuery]);

  // WhatsApp Jar Return / Recovery Request
  const handleSendJarRecoveryReminder = (cust: Customer) => {
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const plantName = user?.businessName || 'NextWater Plant';
    const jars = cust.emptyBottlesHeld || 0;
    const message = 
      `*🪣 ${plantName.toUpperCase()} - EMPTY JAR RETURN NOTICE*\n\n` +
      `Hello ${cust.name},\n` +
      `As per our delivery records, you currently have *${jars} empty 20L water jars* at your premises.\n\n` +
      `Kindly hand over the empty jars during the next delivery or notify us if you would like us to collect them.\n\n` +
      `Thank you for your cooperation! 💧`;

    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  // Perform Quick Jar Audit & Update Inventory
  const handleSaveJarAudit = async () => {
    if (!selectedCust) return;
    const qty = parseInt(auditJarCount);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid jar count.');
      return;
    }

    setSubmittingAudit(true);
    try {
      const currentHeld = selectedCust.emptyBottlesHeld || 0;
      let newHeld = currentHeld;

      if (auditAction === 'return') {
        if (qty > currentHeld) {
          Alert.alert('Validation Error', `Customer only holds ${currentHeld} jars. Cannot return ${qty}.`);
          setSubmittingAudit(false);
          return;
        }
        newHeld = currentHeld - qty;
        // Increase plant empty inventory
        try {
          const items = await inventoryService.getAll();
          const emptyItem = items.find(i => i.id === '2' || i.name.toLowerCase().includes('empty'));
          if (emptyItem) {
            await inventoryService.adjustQuantity(emptyItem.id, qty);
          }
        } catch (e) {}
      } else {
        newHeld = currentHeld + qty;
        // Decrease plant filled/empty inventory
        try {
          const items = await inventoryService.getAll();
          const filledItem = items.find(i => i.id === '1' || i.name.toLowerCase().includes('filled'));
          if (filledItem) {
            await inventoryService.adjustQuantity(filledItem.id, -qty);
          }
        } catch (e) {}
      }

      await customerService.update(selectedCust.id, { emptyBottlesHeld: newHeld });
      Alert.alert(
        'Jar Audit Recorded',
        auditAction === 'return'
          ? `Successfully logged return of ${qty} jars from ${selectedCust.name}. Plant empty stock replenished.`
          : `Issued ${qty} additional jars to ${selectedCust.name}.`
      );

      setSelectedCust(null);
      setAuditJarCount('1');
      fetchCustomers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update jar count.');
    } finally {
      setSubmittingAudit(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP FIELD JAR ASSET OVERVIEW */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3.5 pt-2 pb-2.5">
        {/* KPI 3-Column Box */}
        <View className="flex-row gap-2 mb-2.5">
          {/* Total Field Jars */}
          <View className="flex-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Ionicons name="cube" size={14} color="#D97706" />
              <Text className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Jars in Field
              </Text>
            </View>
            <Text className="text-base font-black text-amber-700 dark:text-amber-300">
              {metrics.totalJarsInField} <Text className="text-xs font-bold">Jars</Text>
            </Text>
          </View>

          {/* Deposits Held */}
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
              <Text className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                Deposits Held
              </Text>
            </View>
            <Text className="text-base font-black text-sky-700 dark:text-sky-300">
              {formatCurrency(metrics.totalDeposits)}
            </Text>
          </View>

          {/* Heavy Holders */}
          <View className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/80 rounded-2xl p-3">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Ionicons name="alert-circle" size={14} color="#E11D48" />
              <Text className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                5+ Jar Clients
              </Text>
            </View>
            <Text className="text-base font-black text-rose-700 dark:text-rose-300">
              {metrics.heavyHoldersCount} <Text className="text-xs font-bold">Clients</Text>
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            placeholder="Search by customer name, phone, area..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Badges */}
        <View className="flex-row gap-1.5">
          {[
            { id: 'all', label: `All Holders (${metrics.totalHolders})` },
            { id: 'heavy', label: `Heavy (5+ Jars)` },
            { id: 'deposit', label: 'Deposit Paid' },
            { id: 'nodeposit', label: 'Zero Deposit' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilterType(f.id as any)}
              className={`flex-1 py-1.5 rounded-xl items-center border ${
                filterType === f.id
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-xs font-bold ${filterType === f.id ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. CUSTOMER FIELD JAR LIST */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCustomers} colors={['#d97706']} />}
        ListEmptyComponent={
          <EmptyState 
            message="No customer jar holding records match this filter." 
            iconName="cube-outline" 
          />
        }
        renderItem={({ item }) => {
          const jars = item.emptyBottlesHeld || 0;
          const isHeavy = jars >= 5;
          const hasDeposit = (item.depositPaid || 0) > 0;

          return (
            <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 mb-2.5 shadow-2xs">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                      {item.name}
                    </Text>
                    {isHeavy && (
                      <View className="bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] font-black text-rose-700 dark:text-rose-300 uppercase">
                          Heavy Holder
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-slate-400 mt-0.5 font-medium">
                    📞 {item.phone} • {item.address || 'Standard Route'}
                  </Text>
                </View>

                {/* Jar Badge */}
                <View className="items-end">
                  <View className={`px-2.5 py-1 rounded-xl items-center flex-row gap-1.5 ${isHeavy ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800'}`}>
                    <Ionicons name="cube" size={14} color={isHeavy ? '#E11D48' : '#D97706'} />
                    <Text className={`text-sm font-black ${isHeavy ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {jars} Jars
                    </Text>
                  </View>
                </View>
              </View>

              {/* Deposit & Balance Meta */}
              <View className="flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl mb-2.5 border border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="shield-checkmark-outline" size={13} color="#0284C7" />
                  <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Deposit: <Text className="font-bold text-sky-600">{hasDeposit ? formatCurrency(item.depositPaid || 0) : '₹0 (No Deposit)'}</Text>
                  </Text>
                </View>

                <Text className="text-xs font-semibold text-slate-500">
                  Dues: <Text className={`font-bold ${(item.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(item.balance || 0)}</Text>
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                {/* WhatsApp Jar Recovery Notice */}
                <TouchableOpacity
                  onPress={() => handleSendJarRecoveryReminder(item)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 flex-row items-center justify-center gap-1.5 active:opacity-75"
                >
                  <Ionicons name="logo-whatsapp" size={14} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Jar Return Notice
                  </Text>
                </TouchableOpacity>

                {/* Audit / Return Modal Trigger with LinearGradient */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCust(item);
                    setAuditAction('return');
                    setAuditJarCount(Math.min(jars, 1).toString());
                  }}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    overflow: 'hidden',
                    elevation: 2,
                    shadowColor: '#D97706',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.25,
                    shadowRadius: 2
                  }}
                >
                  <LinearGradient
                    colors={['#D97706', '#B45309']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 38,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      paddingHorizontal: 8,
                    }}
                  >
                    <Ionicons name="sync-outline" size={14} color="#FFF" />
                    <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                      Audit / Return Jars
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* JAR AUDIT & RETURN MODAL */}
      <Modal
        visible={!!selectedCust}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCust(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Audit Customer Jars
                </Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  Client: {selectedCust?.name} (Holding: {selectedCust?.emptyBottlesHeld || 0} Jars)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCust(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Action Selector: [ Return Jars to Plant ] | [ Issue Additional Jars ] */}
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Audit Action
              </Text>
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => setAuditAction('return')}
                  className={`flex-1 py-2.5 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                    auditAction === 'return' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Ionicons name="arrow-undo-outline" size={15} color={auditAction === 'return' ? '#059669' : '#64748B'} />
                  <Text className={`text-xs font-bold ${auditAction === 'return' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    Return to Plant (-)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAuditAction('issue')}
                  className={`flex-1 py-2.5 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                    auditAction === 'issue' 
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Ionicons name="add-circle-outline" size={15} color={auditAction === 'issue' ? '#D97706' : '#64748B'} />
                  <Text className={`text-xs font-bold ${auditAction === 'issue' ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    Issue Additional (+)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quantity Input */}
              <Input
                label="Number of 20L Jars *"
                placeholder="e.g. 2"
                value={auditJarCount}
                onChangeText={setAuditJarCount}
                keyboardType="numeric"
              />

              {/* Info Notice */}
              <View className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-xl mb-4 border border-sky-200 dark:border-sky-800">
                <Text className="text-xs text-sky-800 dark:text-sky-300 leading-4">
                  💡 This action will automatically update <Text className="font-bold">{selectedCust?.name}&apos;s</Text> field jar balance and adjust the plant&apos;s inventory.
                </Text>
              </View>

              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setSelectedCust(null)}
                    style={{ height: 44 }}
                  />
                </View>
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={handleSaveJarAudit}
                    disabled={submittingAudit}
                    activeOpacity={0.85}
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={auditAction === 'return' ? ['#10B981', '#059669'] : ['#D97706', '#B45309']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: 44,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 5
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                        {submittingAudit ? 'Saving...' : 'Save Jar Audit'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
