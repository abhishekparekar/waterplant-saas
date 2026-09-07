import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  RefreshControl,
  Linking,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { monthlyCardService, MonthlyCard } from '@/services/monthlyCardService';
import { useCustomerStore } from '@/store/customerStore';
import { useAuthStore } from '@/store/authStore';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Customer } from '@/types/customer';

type CardFilter = 'active' | 'all' | 'completed';

export default function MonthlyCardsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const [cards, setCards] = useState<MonthlyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CardFilter>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Issue Card Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [custSearch, setCustSearch] = useState('');
  const [planType, setPlanType] = useState<'daily' | 'office' | 'custom'>('daily');
  const [quota, setQuota] = useState('30');
  const [price, setPrice] = useState('900');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [submitting, setSubmitting] = useState(false);

  // Selected Card Calendar Punch Modal State
  const [calendarCard, setCalendarCard] = useState<MonthlyCard | null>(null);

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthStr = today.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  const loadCards = async () => {
    try {
      setLoading(true);
      const res = await monthlyCardService.getAll();
      setCards(res);
    } catch (e) {
      console.error('Failed to load monthly cards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
    fetchCustomers();
  }, [fetchCustomers]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch = !searchQuery.trim() || 
        card.customerName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        card.customerPhone.includes(searchQuery.trim());

      let matchesFilter = true;
      if (filter === 'active') matchesFilter = card.status === 'active';
      if (filter === 'completed') matchesFilter = card.status === 'completed';

      return matchesSearch && matchesFilter;
    });
  }, [cards, searchQuery, filter]);

  // Overall statistics
  const stats = useMemo(() => {
    const activeCards = cards.filter(c => c.status === 'active');
    const totalMRR = cards.reduce((sum, c) => sum + (c.price || 0), 0);
    const todayPunches = cards.reduce((sum, c) => sum + (c.dailyDeliveries?.[currentDay] || 0), 0);

    return {
      activeCount: activeCards.length,
      totalCount: cards.length,
      totalMRR,
      todayPunches
    };
  }, [cards, currentDay]);

  // Auto calculate price based on quota and selected customer rate
  const handlePlanSelect = (type: 'daily' | 'office' | 'custom') => {
    setPlanType(type);
    const rate = selectedCust?.pricePerJar || 35;
    if (type === 'daily') {
      setQuota('30');
      setPrice((30 * rate).toString());
    } else if (type === 'office') {
      setQuota('60');
      setPrice((60 * (rate - 3)).toString()); // bulk discount
    } else {
      setQuota('45');
      setPrice((45 * rate).toString());
    }
  };

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCust(c);
    const rate = c.pricePerJar || 35;
    setPrice((parseInt(quota) * rate).toString());
  };

  const handleIssueCard = async () => {
    if (!selectedCust) {
      Alert.alert('Validation Error', 'Please select a customer.');
      return;
    }

    const quotaNum = parseInt(quota);
    const priceNum = parseFloat(price);

    if (isNaN(quotaNum) || quotaNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid jar quota.');
      return;
    }

    setSubmitting(true);
    try {
      const planTitle = planType === 'daily' 
        ? 'Daily 1 Jar Plan (30 Jars)' 
        : planType === 'office' 
        ? 'Office Bulk Plan (60 Jars)' 
        : `Custom Plan (${quotaNum} Jars)`;

      const newCard = await monthlyCardService.issueCard({
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        customerPhone: selectedCust.phone,
        customerAddress: selectedCust.address,
        planName: planTitle,
        totalQuota: quotaNum,
        month: currentMonthStr,
        price: priceNum,
        paymentStatus
      });

      setCards((prev) => [newCard, ...prev]);
      setModalVisible(false);
      setSelectedCust(null);
      Alert.alert('Card Issued', `Digital Monthly Water Card issued to ${selectedCust.name}!`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to issue card.');
    } finally {
      setSubmitting(false);
    }
  };

  // Punch or toggle delivery for a day
  const handleToggleDayPunch = async (card: MonthlyCard, dayNum: number) => {
    const currentQty = card.dailyDeliveries?.[dayNum] || 0;
    const newQty = currentQty > 0 ? 0 : 1; // toggle between 0 and 1

    try {
      const res = await monthlyCardService.punchDelivery(card.id, dayNum, newQty);
      
      const updatedCard = {
        ...card,
        deliveredCount: res.deliveredCount,
        dailyDeliveries: res.dailyDeliveries,
        status: res.deliveredCount >= card.totalQuota ? ('completed' as const) : ('active' as const)
      };

      setCards((prev) => prev.map(c => c.id === card.id ? updatedCard : c));
      if (calendarCard?.id === card.id) {
        setCalendarCard(updatedCard);
      }
    } catch (e: any) {
      Alert.alert('Punch Error', 'Could not save day delivery.');
    }
  };

  // Send WhatsApp Digital Pass & Punch Summary
  const handleSendCardWhatsApp = (card: MonthlyCard) => {
    const cleanPhone = card.customerPhone.replace(/[^0-9]/g, '');
    const plantName = user?.businessName || 'NextWater Plant';
    const remaining = Math.max(0, card.totalQuota - card.deliveredCount);
    
    let punchesText = '';
    for (let i = 1; i <= 31; i++) {
      if (card.dailyDeliveries?.[i]) {
        punchesText += ` Day ${i} (✓)`;
      }
    }

    const message = `💧 *${plantName} - DIGITAL MONTHLY WATER PASS*\n\n` +
      `👤 Client: *${card.customerName}*\n` +
      `📅 Month: *${card.month}*\n` +
      `🏷️ Subscription: *${card.planName}*\n\n` +
      `📊 *DELIVERY STATUS:*\n` +
      `• Delivered: *${card.deliveredCount} / ${card.totalQuota} Jars*\n` +
      `• Remaining Quota: *${remaining} Jars*\n` +
      `• Payment: *${card.paymentStatus.toUpperCase()} (₹${card.price})*\n\n` +
      `🗓️ *Days Delivered:* ${punchesText || 'None yet'}\n\n` +
      `Thank you for subscribing to pure mineral water!`;

    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  if (loading && cards.length === 0) {
    return <Loader />;
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3 pt-2 pb-2">
        {/* KPI Banner */}
        <LinearGradient
          colors={['#0D9488', '#0F766E']}
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
            shadowColor: '#0D9488',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 6
          }}
        >
          <View>
            <Text className="text-[11px] font-black text-teal-100 uppercase tracking-wider">
              Active Monthly Cards • {currentMonthStr}
            </Text>
            <Text className="text-2xl font-black text-white mt-1">
              {stats.activeCount} Active Clients
            </Text>
            <Text className="text-xs text-teal-100 font-bold mt-1">
              Today's Punches: {stats.todayPunches} Jars Delivered
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={16} color="#0D9488" />
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#0D9488' }}>+ Issue Card</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput 
            placeholder="Search monthly subscribers..."
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

        {/* Filter Tabs */}
        <View className="flex-row gap-1.5">
          {[
            { id: 'active', label: `Active Passes (${stats.activeCount})` },
            { id: 'all', label: `All Cards (${stats.totalCount})` },
            { id: 'completed', label: 'Quota Completed' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id as any)}
              className={`flex-1 py-1.5 rounded-xl items-center border ${
                filter === f.id 
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-[10.5px] font-bold ${filter === f.id ? 'text-teal-700 dark:text-teal-300 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. DIGITAL CARDS LIST */}
      <ScrollView 
        className="flex-1 px-3 py-2"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCards} colors={['#0D9488']} />}
      >
        {filteredCards.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="card-outline" size={42} color="#94A3B8" />
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">No Monthly Cards Found</Text>
            <Text className="text-xs text-slate-400 text-center px-6 mt-1">
              Issue a digital water card to households or offices to manage fixed monthly deliveries.
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="mt-3.5 bg-teal-600 px-4 py-2.5 rounded-xl"
            >
              <Text className="text-white text-xs font-black">+ Issue First Monthly Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCards.map((card) => {
            const delivered = card.deliveredCount || 0;
            const quotaTotal = card.totalQuota || 30;
            const progressPct = Math.min(100, Math.round((delivered / quotaTotal) * 100));
            const isTodayPunched = (card.dailyDeliveries?.[currentDay] || 0) > 0;
            const isCompleted = card.status === 'completed' || delivered >= quotaTotal;

            return (
              <View 
                key={card.id} 
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-3 shadow-sm"
              >
                {/* Header: Customer Name, Month, Plan & Payment Status */}
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      <Text className="text-[14.5px] font-black text-slate-900 dark:text-slate-50">
                        {card.customerName}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {card.customerPhone} • {card.planName}
                    </Text>
                  </View>

                  <View className="items-end">
                    <View className={`px-2.5 py-0.5 rounded-full ${isCompleted ? 'bg-slate-100 dark:bg-slate-700' : 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800'}`}>
                      <Text className={`text-[10px] font-black ${isCompleted ? 'text-slate-600' : 'text-teal-700 dark:text-teal-300'}`}>
                        {isCompleted ? 'QUOTA FULL' : `${card.month}`}
                      </Text>
                    </View>
                    <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                      {formatCurrency(card.price)} ({card.paymentStatus.toUpperCase()})
                    </Text>
                  </View>
                </View>

                {/* Progress Bar & Quota Numbers */}
                <View className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl mb-2.5 border border-slate-100 dark:border-slate-800">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Delivered: <Text className="font-black text-teal-600">{delivered}</Text> / {quotaTotal} Jars
                    </Text>
                    <Text className="text-[11px] font-extrabold text-slate-500">
                      {progressPct}% Completed ({Math.max(0, quotaTotal - delivered)} Left)
                    </Text>
                  </View>

                  <View className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <View 
                      style={{ width: `${progressPct}%` }}
                      className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-teal-500'}`}
                    />
                  </View>
                </View>

                {/* Interactive 31-Day Mini Punch Matrix Preview */}
                <View className="mb-3">
                  <View className="flex-row justify-between items-center mb-1.5 px-0.5">
                    <Text className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider">
                      31-Day Delivery Punch Log:
                    </Text>
                    <Text className="text-[10px] text-teal-600 dark:text-teal-400 font-black">Tap day to toggle jar</Text>
                  </View>

                  <View className="flex-row flex-wrap gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const isDelivered = (card.dailyDeliveries?.[day] || 0) > 0;
                      const isCurrentDay = day === currentDay;

                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => handleToggleDayPunch(card, day)}
                          className={`w-[8.8%] py-1.5 items-center justify-center rounded-lg border ${
                            isDelivered 
                              ? 'bg-teal-600 border-teal-600' 
                              : isCurrentDay 
                              ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400' 
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800'
                          }`}
                        >
                          <Text className={`text-[9.5px] font-black ${isDelivered ? 'text-white' : isCurrentDay ? 'text-sky-600 font-black' : 'text-slate-500'}`}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Punch Today Button */}
                  {isTodayPunched ? (
                    <TouchableOpacity
                      onPress={() => handleToggleDayPunch(card, currentDay)}
                      className="flex-1 py-2 px-3 rounded-xl flex-row items-center justify-center gap-1.5 active:opacity-80 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800"
                    >
                      <Ionicons name="checkmark-circle" size={15} color="#059669" />
                      <Text className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                        Day {currentDay} Punched (✓)
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleToggleDayPunch(card, currentDay)}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        overflow: 'hidden',
                        elevation: 2,
                        shadowColor: '#0D9488',
                        shadowOffset: { width: 0, height: 1.5 },
                        shadowOpacity: 0.25,
                        shadowRadius: 2.5
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#0D9488', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          height: 38,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                        }}
                      >
                        <Ionicons name="water-outline" size={15} color="#FFF" />
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                          + Punch Today (Day {currentDay})
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {/* Share Card on WhatsApp */}
                  <TouchableOpacity
                    onPress={() => handleSendCardWhatsApp(card)}
                    className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 items-center justify-center active:opacity-75"
                  >
                    <Ionicons name="logo-whatsapp" size={17} color="#059669" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ISSUE NEW MONTHLY CARD MODAL */}
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
                  Issue Digital Monthly Water Pass
                </Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  Set recurring jar quota & fixed monthly pricing
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Customer Selector */}
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                1. Select Client *
              </Text>
              {!selectedCust ? (
                <>
                  <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2.5 border border-slate-200/60 dark:border-slate-800">
                    <Ionicons name="search-outline" size={16} color="#94A3B8" />
                    <TextInput 
                      placeholder="Search customer by name..."
                      placeholderTextColor="#94A3B8"
                      value={custSearch}
                      onChangeText={setCustSearch}
                      className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 ml-2 py-0"
                    />
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
                    {customers
                      .filter(c => !custSearch.trim() || c.name.toLowerCase().includes(custSearch.toLowerCase().trim()))
                      .slice(0, 8)
                      .map((cust) => (
                        <TouchableOpacity
                          key={cust.id}
                          onPress={() => handleSelectCustomer(cust)}
                          className="mr-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex-row items-center gap-1.5"
                        >
                          <Ionicons name="person-circle-outline" size={15} color="#0D9488" />
                          <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">{cust.name}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </>
              ) : (
                <View className="bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-100 dark:border-teal-800 mb-3 flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm font-black text-teal-900 dark:text-teal-100">{selectedCust.name}</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">{selectedCust.phone} • Rate: ₹{selectedCust.pricePerJar || 35}/jar</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedCust(null)}>
                    <Text className="text-xs font-black text-teal-600">Change</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Plan Preset Selector */}
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                2. Subscription Plan Preset
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { id: 'daily', label: 'Household (30 Jars)' },
                  { id: 'office', label: 'Commercial (60 Jars)' },
                  { id: 'custom', label: 'Custom Quota' },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => handlePlanSelect(p.id as any)}
                    className={`flex-1 py-2 px-1 rounded-xl border items-center ${
                      planType === p.id 
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${planType === p.id ? 'text-teal-700 dark:text-teal-300 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <Input
                    label="Monthly Jar Quota *"
                    value={quota}
                    onChangeText={(q) => {
                      setQuota(q);
                      const rate = selectedCust?.pricePerJar || 35;
                      const val = parseInt(q) || 0;
                      setPrice((val * rate).toString());
                    }}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Total Monthly Price (₹) *"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Payment Mode */}
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Payment Status
              </Text>
              <View className="flex-row gap-2 mb-4">
                <TouchableOpacity
                  onPress={() => setPaymentStatus('paid')}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    paymentStatus === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className={`text-xs font-bold ${paymentStatus === 'paid' ? 'text-emerald-700 dark:text-emerald-300 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                    ✓ Pre-Paid Full
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentStatus('pending')}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    paymentStatus === 'pending' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className={`text-xs font-bold ${paymentStatus === 'pending' ? 'text-amber-700 dark:text-amber-300 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                    Add to Monthly Dues
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2.5">
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
                  onPress={handleIssueCard}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#0D9488',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    opacity: submitting ? 0.7 : 1
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text className="text-sm font-black text-white">
                      {submitting ? 'Issuing...' : 'Issue Card'}
                    </Text>
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
