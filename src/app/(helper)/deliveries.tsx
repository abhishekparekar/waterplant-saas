import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  RefreshControl 
} from 'react-native';
import { useDeliveryStore } from '@/store/deliveryStore';
import { useAuthStore } from '@/store/authStore';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelperDeliveriesScreen() {
  const { user } = useAuthStore();
  const { deliveries, loading, fetchHelperDeliveries } = useDeliveryStore();

  const [filterTab, setFilterTab] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetchHelperDeliveries(user.uid);
    }
  }, [user, fetchHelperDeliveries]);

  const completedList = useMemo(() => deliveries.filter((d) => d.status === 'completed'), [deliveries]);
  const totalCompleted = completedList.length;
  const totalEmptyJars = completedList.reduce((sum, d) => sum + (d.emptyBottlesReturned || 0), 0);
  const totalCashCollected = completedList.reduce((sum, d) => sum + (d.cashCollected || 0), 0);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (filterTab === 'completed' && d.status !== 'completed') return false;
      if (filterTab === 'in_progress' && d.status !== 'in_progress') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = (d.customerName || '').toLowerCase().includes(q) ||
                      (d.customerAddress || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [deliveries, filterTab, searchQuery]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Top Metrics Hero Card */}
      <View className="px-3.5 pt-2.5 pb-1">
        <LinearGradient
          colors={['#0284C7', '#0369A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            padding: 14,
            elevation: 3,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
          }}
        >
          <View className="flex-row justify-between items-center mb-2.5">
            <View>
              <Text className="text-[10.5px] font-black text-sky-200 uppercase tracking-widest">
                Driver Ledger & History
              </Text>
              <Text className="text-base font-black text-white mt-0.5">
                Delivery Drops Log
              </Text>
            </View>

            <View className="px-2.5 py-1 rounded-md bg-white/20 border border-white/30">
              <Text className="text-[9.5px] font-black text-white uppercase">
                {deliveries.length} Total Runs
              </Text>
            </View>
          </View>

          {/* 3 Metrics Cards inside Hero */}
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-white">{totalCompleted}</Text>
              <Text className="text-[9px] font-extrabold text-sky-100 uppercase mt-0.5">Drops Made</Text>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-emerald-200">{totalEmptyJars}</Text>
              <Text className="text-[9px] font-extrabold text-sky-100 uppercase mt-0.5">Empty Taken</Text>
            </View>

            <View className="flex-1 bg-white/15 border border-white/20 rounded-xl p-2 items-center">
              <Text className="text-lg font-black text-amber-200">₹{totalCashCollected}</Text>
              <Text className="text-[9px] font-extrabold text-sky-100 uppercase mt-0.5">Cash Handover</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Filter & Search Controls */}
      <View className="px-3.5 pt-1.5 pb-2">
        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          borderRadius: 8,
          paddingHorizontal: 10,
          height: 38,
          marginBottom: 8,
        }}>
          <Ionicons name="search" size={16} color="#64748B" style={{ marginRight: 6 }} />
          <TextInput
            style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#0F172A', paddingVertical: 0 }}
            placeholder="Search past deliveries by customer name..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs in Rectangular Format */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[
            { key: 'all', label: `All (${deliveries.length})` },
            { key: 'completed', label: `Completed (${totalCompleted})` },
            { key: 'in_progress', label: `In Transit (${deliveries.length - totalCompleted})` },
          ].map((tab) => {
            const isSelected = filterTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilterTab(tab.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#0284C7' : '#F1F5F9',
                  borderWidth: 1,
                  borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                }}
                activeOpacity={0.75}
              >
                <Text style={{
                  fontSize: 10.5,
                  fontWeight: '900',
                  color: isSelected ? '#FFFFFF' : '#64748B',
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Runs List */}
      <View className="flex-1 px-3.5">
        {loading && deliveries.length === 0 ? (
          <Loader />
        ) : (
          <FlatList
            data={filteredDeliveries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 85 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={loading} 
                onRefresh={() => user?.uid && fetchHelperDeliveries(user.uid)} 
                colors={['#0284C7']}
              />
            }
            renderItem={({ item }) => (
              <DeliveryCard 
                delivery={item}
              />
            )}
            ListEmptyComponent={
              <EmptyState 
                message="No delivery records found matching your selection." 
                iconName="receipt-outline" 
              />
            }
          />
        )}
      </View>
    </View>
  );
}

