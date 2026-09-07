import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { reportService, DetailedReportData } from '@/services/reportService';
import { useAuthStore } from '@/store/authStore';
import { Loader } from '@/components/common/Loader';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type ReportTimeline = '7days' | 'today' | 'month';

export default function ReportsScreen() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DetailedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<ReportTimeline>('7days');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDetailedReports();
      setData(res);
      // Default to last day in weekly list
      if (res.weeklySales.length > 0) {
        setSelectedDayIdx(res.weeklySales.length - 1);
      }
    } catch (e) {
      console.error('Failed to fetch detailed reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Compute maximum daily revenue for bar scaling
  const maxWeeklyRevenue = useMemo(() => {
    if (!data?.weeklySales || data.weeklySales.length === 0) return 1000;
    const max = Math.max(...data.weeklySales.map(d => d.revenue));
    return max > 0 ? max : 1000;
  }, [data?.weeklySales]);

  // WhatsApp EOD Business Report Share
  const handleShareReportWhatsApp = () => {
    const plantName = user?.businessName || 'NextWater Plant';
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const revenue = data?.totalRevenue || 0;
    const expenses = data?.totalExpenses || 0;
    const netProfit = data?.netProfit || 0;
    const fulfillment = data?.fulfillmentRate || 0;
    const jarsDelivered = data?.totalJarsDelivered || 0;
    const emptiesRecovered = data?.totalEmptiesCollected || 0;
    const dues = data?.outstandingBalance || 0;

    const reportMsg = 
      `*📊 ${plantName.toUpperCase()} - BUSINESS P&L STATEMENT*\n` +
      `📅 *Report Date:* ${todayStr}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total Collections:* ₹${revenue.toLocaleString('en-IN')}\n` +
      `🔴 *Operating Costs:* ₹${expenses.toLocaleString('en-IN')}\n` +
      `🟢 *NET OPERATING MARGIN:* ₹${netProfit.toLocaleString('en-IN')}\n` +
      `📌 *Pending Customer Dues:* ₹${dues.toLocaleString('en-IN')}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🚚 *LOGISTICS PERFORMANCE:*\n` +
      `• Orders Logged: ${data?.totalOrders || 0}\n` +
      `• Fulfillment Rate: ${fulfillment}%\n` +
      `• 20L Jars Dispatched: ${jarsDelivered} Jars\n` +
      `• Empty Jars Recovered: ${emptiesRecovered} Jars\n` +
      `• Recovery Ratio: ${data?.jarRecoveryRate || 0}%\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `_Generated via NextWater Plant Management System_`;

    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(reportMsg)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  if (loading && !data) {
    return <Loader />;
  }

  const revenue = data?.totalRevenue || 0;
  const totalExpenses = data?.totalExpenses || 0;
  const netProfit = data?.netProfit || 0;
  const fulfillmentRate = data?.fulfillmentRate || 0;
  const profitMargin = data?.profitMargin || 0;
  const jarRecoveryRate = data?.jarRecoveryRate || 0;
  const selectedDay = selectedDayIdx !== null && data?.weeklySales ? data.weeklySales[selectedDayIdx] : null;

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3 py-2.5"
      contentContainerStyle={{ paddingBottom: 90 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} colors={['#0284c7']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TOP TIMELINE SWITCHER & SHARE ACTION */}
      <View className="flex-row justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 mb-3 shadow-sm">
        {/* Timeline Tabs */}
        <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex-1 mr-2.5">
          {[
            { id: '7days', label: '7 Days' },
            { id: 'today', label: 'Today' },
            { id: 'month', label: 'This Month' },
          ].map((t) => {
            const isActive = timeline === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTimeline(t.id as any)}
                className="flex-1 rounded-lg overflow-hidden py-1.5 items-center justify-center"
                activeOpacity={0.7}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#0284C7', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="absolute inset-0 rounded-lg"
                  />
                ) : null}
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* WhatsApp Share Button with LinearGradient */}
        <TouchableOpacity
          onPress={handleShareReportWhatsApp}
          activeOpacity={0.85}
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            elevation: 3,
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3
          }}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 9,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFF' }}>
              Share P&L
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 2. THREE DYNAMIC CIRCULAR KPI GAUGES */}
      <View className="flex-row gap-2 mb-3">
        {/* Gauge 1: Fulfillment Rate */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 items-center shadow-sm">
          <View className="w-14 h-14 rounded-full border-[3.5px] border-emerald-500 border-t-emerald-200 justify-center items-center my-0.5 bg-emerald-50/40 dark:bg-emerald-950/30">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">{fulfillmentRate}%</Text>
          </View>
          <Text className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1 uppercase tracking-tight">
            Fulfillment
          </Text>
          <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {data?.completedDeliveries || 0} Delivered
          </Text>
        </View>

        {/* Gauge 2: Profit Margin */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 items-center shadow-sm">
          <View className={`w-14 h-14 rounded-full border-[3.5px] ${netProfit >= 0 ? 'border-sky-600 border-t-sky-200 bg-sky-50/40 dark:bg-sky-950/30' : 'border-rose-500 border-t-rose-200 bg-rose-50/40 dark:bg-rose-950/30'} justify-center items-center my-0.5`}>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">{profitMargin}%</Text>
          </View>
          <Text className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1 uppercase tracking-tight">
            Net Margin
          </Text>
          <Text className={`text-[10px] font-bold ${netProfit >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {netProfit >= 0 ? 'Profitable' : 'Deficit'}
          </Text>
        </View>

        {/* Gauge 3: Jar Recovery Rate */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 items-center shadow-sm">
          <View className="w-14 h-14 rounded-full border-[3.5px] border-amber-500 border-t-amber-200 justify-center items-center my-0.5 bg-amber-50/40 dark:bg-amber-950/30">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">{jarRecoveryRate}%</Text>
          </View>
          <Text className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1 uppercase tracking-tight">
            Jar Return
          </Text>
          <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
            {data?.totalEmptiesCollected || 0} Returned
          </Text>
        </View>
      </View>

      {/* 3. REAL-TIME 7-DAY SALES & DISPATCH BAR GRAPH */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          <View>
            <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              7-Day Sales & Dispatch Trend
            </Text>
            <Text className="text-[10px] font-medium text-slate-400">Live order collections & jar count</Text>
          </View>
          {selectedDay && (
            <View className="bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-xl border border-sky-200 dark:border-sky-800">
              <Text className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                {selectedDay.day}: {formatCurrency(selectedDay.revenue)}
              </Text>
            </View>
          )}
        </View>

        {/* Dynamic Bar Chart Visualizer */}
        <View className="h-32 flex-row items-end justify-between pt-3 pb-1 px-1">
          {data?.weeklySales.map((item, idx) => {
            const isSelected = selectedDayIdx === idx;
            const barHeightPct = Math.max(14, Math.round((item.revenue / maxWeeklyRevenue) * 100));

            return (
              <TouchableOpacity
                key={item.dateStr || idx}
                onPress={() => setSelectedDayIdx(idx)}
                className="items-center flex-1 mx-0.5"
                activeOpacity={0.7}
              >
                {/* Value Label above Bar */}
                <Text className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1" numberOfLines={1}>
                  {item.revenue > 0 ? `₹${item.revenue}` : '0'}
                </Text>

                {/* Animated Height Bar */}
                <View className="w-full max-w-[28px] h-20 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden justify-end">
                  <View 
                    style={{ height: `${barHeightPct}%` }}
                    className="w-full rounded-lg overflow-hidden"
                  >
                    <LinearGradient
                      colors={isSelected ? ['#0284C7', '#38BDF8'] : ['#94A3B8', '#CBD5E1']}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      className="w-full h-full"
                    />
                  </View>
                </View>

                {/* Day Label */}
                <Text className={`text-[10.5px] mt-1.5 font-bold ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {item.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. REAL-TIME PROFIT & LOSS (P&L) STATEMENT */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-3 shadow-sm">
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          Profit & Loss Summary (Live Cloud Ledger)
        </Text>

        <View className="gap-2">
          {/* Revenue */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2.5">
              <View className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 justify-center items-center">
                <Ionicons name="arrow-down" size={13} color="#059669" />
              </View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Gross Collections</Text>
            </View>
            <Text className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(revenue)}
            </Text>
          </View>

          {/* Expenses */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2.5">
              <View className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/50 justify-center items-center">
                <Ionicons name="arrow-up" size={13} color="#E11D48" />
              </View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Operating Expenses</Text>
            </View>
            <Text className="text-sm font-black text-rose-600 dark:text-rose-400">
              -{formatCurrency(totalExpenses)}
            </Text>
          </View>

          {/* Dues */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2.5">
              <View className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/50 justify-center items-center">
                <Ionicons name="time" size={13} color="#D97706" />
              </View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Pending Dues</Text>
            </View>
            <Text className="text-sm font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(data?.outstandingBalance || 0)}
            </Text>
          </View>

          <View className="h-px bg-slate-100 dark:bg-slate-700/60 my-1" />

          {/* Net Profit */}
          <View className="flex-row justify-between items-center pt-1">
            <Text className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide">Net Business Margin</Text>
            <Text className={`text-base font-black ${netProfit >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600'}`}>
              {formatCurrency(netProfit)}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. REAL-TIME EXPENSE CATEGORY DISTRIBUTION */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Real Expenses by Category
          </Text>
          <Text className="text-[11px] font-bold text-slate-400">
            Total: {formatCurrency(totalExpenses)}
          </Text>
        </View>

        {data?.categoryExpenses && data.categoryExpenses.length > 0 ? (
          <View className="gap-2.5">
            {data.categoryExpenses.map((cat) => (
              <View key={cat.category} className="mb-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.category}</Text>
                  <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                    {formatCurrency(cat.amount)} ({cat.percentage}%)
                  </Text>
                </View>
                <View className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <View 
                    style={{ width: `${Math.max(4, cat.percentage)}%`, backgroundColor: cat.color }} 
                    className="h-full rounded-full" 
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-5 items-center">
            <Ionicons name="receipt-outline" size={28} color="#94A3B8" />
            <Text className="text-xs font-semibold text-slate-400 mt-1.5">No expenses recorded in Cloud yet.</Text>
            <Text className="text-[10.5px] text-slate-400">Log expenses in "Payment Entry" to view breakdown.</Text>
          </View>
        )}
      </View>

      {/* 6. LOGISTICS & BOTTLE CIRCULATION SUMMARY */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-sm">
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          Plant Logistics Performance
        </Text>

        <View className="flex-row justify-between py-1.5">
          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Customer Orders Logged</Text>
          <Text className="text-[13px] font-black text-slate-900 dark:text-slate-100">{data?.totalOrders || 0}</Text>
        </View>
        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        <View className="flex-row justify-between py-1.5">
          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">Delivered & Closed Runs</Text>
          <Text className="text-[13px] font-black text-emerald-600">{data?.completedDeliveries || 0}</Text>
        </View>
        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        <View className="flex-row justify-between py-1.5">
          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">Active Runs in Route</Text>
          <Text className="text-[13px] font-black text-sky-600">{data?.pendingDeliveries || 0}</Text>
        </View>
        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        <View className="flex-row justify-between py-1.5">
          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">20L Jars Dispatched</Text>
          <Text className="text-[13px] font-black text-slate-900 dark:text-slate-100">{data?.totalJarsDelivered || 0} Jars</Text>
        </View>
        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        <View className="flex-row justify-between py-1.5">
          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">Empty Bottles Recovered</Text>
          <Text className="text-[13px] font-black text-amber-600">{data?.totalEmptiesCollected || 0} Jars</Text>
        </View>
      </View>
    </ScrollView>
  );
}
