import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { inventoryService, InventoryItem, DispatchLog } from '@/services/inventoryService';
import { useStaffStore } from '@/store/staffStore';
import { useCustomerStore } from '@/store/customerStore';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type DispatchMode = 'load' | 'unload';

export default function LoadUnloadScreen() {
  const router = useRouter();
  const { staffList, fetchStaff } = useStaffStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const [mode, setMode] = useState<DispatchMode>('load');
  const [stock, setStock] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [quantity, setQuantity] = useState(50);
  const [customNotes, setCustomNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, dispatchLogs] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getDispatchLogs(),
      ]);
      setStock(items);
      setLogs(dispatchLogs);
    } catch (e) {
      console.error('Failed to load dispatch data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchStaff();
    fetchCustomers();
  }, [fetchStaff, fetchCustomers]);

  // Set default driver if available
  useEffect(() => {
    if (!selectedStaffId && staffList.length > 0) {
      setSelectedStaffId(staffList[0].id);
    }
  }, [staffList, selectedStaffId]);

  // Real-time filled and empty counts
  const filledCount = useMemo(() => {
    const item = stock.find(i => i.id === '1' || i.name.toLowerCase().includes('filled'));
    return item ? item.quantity : 0;
  }, [stock]);

  const emptyCount = useMemo(() => {
    const item = stock.find(i => i.id === '2' || i.name.toLowerCase().includes('empty'));
    return item ? item.quantity : 0;
  }, [stock]);

  const selectedStaff = useMemo(() => {
    return staffList.find(s => s.id === selectedStaffId) || null;
  }, [staffList, selectedStaffId]);

  // Projected stock after action
  const projectedFilled = mode === 'load' ? Math.max(0, filledCount - quantity) : filledCount;
  const projectedEmpty = mode === 'unload' ? emptyCount + quantity : emptyCount;

  const handleConfirmDispatch = async () => {
    if (quantity <= 0) {
      Alert.alert('Validation Error', 'Please enter at least 1 jar.');
      return;
    }

    if (mode === 'load' && quantity > filledCount) {
      Alert.alert(
        'Low Stock Warning',
        `You are attempting to load ${quantity} jars, but only ${filledCount} filled jars are in plant stock. Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => executeDispatch() }
        ]
      );
      return;
    }

    await executeDispatch();
  };

  const executeDispatch = async () => {
    setSubmitting(true);
    try {
      const driverName = selectedStaff?.name || 'Main Delivery Tempo';
      const vehicleNumber = selectedStaff?.vehicleNumber || 'Plant Tempo 01';

      const log = await inventoryService.recordDispatch({
        type: mode,
        driverName,
        vehicleNumber,
        quantity,
        notes: customNotes.trim() || undefined,
      });

      // Update local state
      setLogs((prev) => [log, ...prev]);
      
      // Reload stock
      const updatedStock = await inventoryService.getAll();
      setStock(updatedStock);

      const actionText = mode === 'load' ? 'Loaded to Vehicle' : 'Unloaded to Wash Unit';
      Alert.alert(
        'Dock Entry Recorded',
        `Successfully logged ${quantity} 20L jars ${actionText} (${driverName} - ${vehicleNumber}).`
      );
      setCustomNotes('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to record dock entry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && stock.length === 0) {
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
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={['#0284c7']} />}
      >
        {/* 1. TOP OPERATION MODE SWITCHER */}
        <View className="bg-slate-200/70 dark:bg-slate-800/90 p-1.5 rounded-2xl flex-row mb-3">
          <TouchableOpacity
            onPress={() => setMode('load')}
            style={{
              flex: 1,
              borderRadius: 12,
              overflow: 'hidden',
            }}
            activeOpacity={0.85}
          >
            {mode === 'load' ? (
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="arrow-up-circle" size={17} color="#FFF" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                  Load Truck (Dispatch)
                </Text>
              </LinearGradient>
            ) : (
              <View style={{
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                <Ionicons name="arrow-up-circle" size={17} color="#059669" />
                <Text className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300">
                  Load Truck (Dispatch)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('unload')}
            style={{
              flex: 1,
              borderRadius: 12,
              overflow: 'hidden',
            }}
            activeOpacity={0.85}
          >
            {mode === 'unload' ? (
              <LinearGradient
                colors={['#0284C7', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="arrow-down-circle" size={17} color="#FFF" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                  Unload Empties (Return)
                </Text>
              </LinearGradient>
            ) : (
              <View style={{
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                <Ionicons name="arrow-down-circle" size={17} color="#0284C7" />
                <Text className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300">
                  Unload Empties (Return)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. REAL-TIME PLANT STOCK STATUS & PROJECTION */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-3 shadow-sm">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
            Plant Dock Live Stock Balance
          </Text>

          <View className="flex-row justify-between items-center gap-2.5">
            {/* Filled Stock */}
            <View className="flex-1 items-center bg-sky-50 dark:bg-sky-950/50 p-3 rounded-xl border border-sky-100 dark:border-sky-800">
              <Text className="text-[10.5px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wide">Filled Ready Stock</Text>
              <Text className="text-xl font-black text-sky-700 dark:text-sky-300 mt-1">{filledCount} Jars</Text>
              {mode === 'load' && (
                <Text className="text-[10px] font-black text-slate-500 mt-1">
                  After load: <Text className="text-emerald-600 font-black">{projectedFilled}</Text>
                </Text>
              )}
            </View>

            {/* Empty Stock */}
            <View className="flex-1 items-center bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-100 dark:border-amber-800">
              <Text className="text-[10.5px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide">Empties in Plant</Text>
              <Text className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">{emptyCount} Jars</Text>
              {mode === 'unload' && (
                <Text className="text-[10px] font-black text-slate-500 mt-1">
                  After unload: <Text className="text-sky-600 font-black">{projectedEmpty}</Text>
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 3. SELECT DRIVER & VEHICLE */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-3 shadow-sm">
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/60 items-center justify-center">
                <Ionicons name="bus-outline" size={13} color="#0D9488" />
              </View>
              <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Select Vehicle / Driver
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/(owner)/add-helper')}
              className="flex-row items-center gap-1 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800"
            >
              <Ionicons name="person-add" size={12} color="#0D9488" />
              <Text className="text-[11px] font-black text-teal-600 dark:text-teal-400">+ Add Staff</Text>
            </TouchableOpacity>
          </View>

          {/* Drivers List Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-1">
            {staffList.length === 0 ? (
              <TouchableOpacity
                onPress={() => setSelectedStaffId('default')}
                className="px-3 py-2 rounded-xl border border-sky-500 bg-sky-50 dark:bg-sky-950/40"
              >
                <Text className="text-xs font-bold text-sky-700 dark:text-sky-300">Plant Tempo 01 (Default)</Text>
              </TouchableOpacity>
            ) : (
              staffList.map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                return (
                  <TouchableOpacity
                    key={staff.id}
                    onPress={() => setSelectedStaffId(staff.id)}
                    className={`mr-2 px-3 py-2 rounded-xl border flex-row items-center gap-2 ${
                      isSelected 
                        ? 'bg-sky-600 border-sky-600 shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Ionicons name="person-circle-outline" size={16} color={isSelected ? '#FFF' : '#0284C7'} />
                    <View>
                      <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                        {staff.name}
                      </Text>
                      <Text className={`text-[10px] ${isSelected ? 'text-sky-100 font-medium' : 'text-slate-400'}`}>
                        {staff.vehicleNumber || 'Plant Vehicle'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* 4. QUANTITY STEPPER & PRESETS */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-3 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2.5">
            <View className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 items-center justify-center">
              <Ionicons name="cube" size={13} color="#0284C7" />
            </View>
            <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {mode === 'load' ? 'Filled Jars to Load (+)' : 'Returned Empties to Unload (-)'}
            </Text>
          </View>

          {/* Stepper Controls */}
          <View className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-2.5">
            <TouchableOpacity 
              className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 justify-center items-center active:opacity-75"
              onPress={() => setQuantity((prev) => Math.max(5, prev - 5))}
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
              className={`w-11 h-11 rounded-xl justify-center items-center active:opacity-75 shadow-sm ${
                mode === 'load' ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
              onPress={() => setQuantity((prev) => prev + 5)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Fast Preset Chips */}
          <View className="flex-row gap-1.5 mb-3">
            {[20, 40, 50, 80, 100, 150].map((preset) => (
              <TouchableOpacity
                key={preset}
                className={`flex-1 py-1.5 rounded-xl items-center border ${
                  quantity === preset 
                    ? mode === 'load' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' : 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
                onPress={() => setQuantity(preset)}
                activeOpacity={0.7}
              >
                <Text className={`text-xs font-black ${
                  quantity === preset 
                    ? mode === 'load' ? 'text-emerald-600' : 'text-sky-600' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes Input */}
          <TextInput
            placeholder="Dock notes (e.g. Morning Sector 4 route batch)"
            placeholderTextColor="#94A3B8"
            value={customNotes}
            onChangeText={setCustomNotes}
            className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium p-3 rounded-xl border border-slate-200/70 dark:border-slate-700"
          />
        </View>

        {/* 5. CONFIRM ACTION BUTTON WITH LINEAR GRADIENT */}
        <TouchableOpacity
          disabled={submitting}
          onPress={handleConfirmDispatch}
          style={{
            height: 48,
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: 14,
            elevation: 4,
            shadowColor: mode === 'load' ? '#059669' : '#0284C7',
            shadowOffset: { width: 0, height: 2.5 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            opacity: submitting ? 0.7 : 1
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={mode === 'load' ? ['#10B981', '#059669'] : ['#0284C7', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: '100%',
              height: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Ionicons name={mode === 'load' ? "arrow-up-circle" : "arrow-down-circle"} size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.3 }}>
              {submitting ? "Recording..." : mode === 'load' ? `Confirm Load (${quantity} Filled Jars)` : `Confirm Unload (${quantity} Empties)`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 6. RECENT DOCK DISPATCH LEDGER */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-sm">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
            Recent Truck Dispatch & Unload History
          </Text>

          {logs.length === 0 ? (
            <View className="py-5 items-center">
              <Ionicons name="bus-outline" size={26} color="#94A3B8" />
              <Text className="text-xs text-slate-400 mt-1.5">No truck dock logs recorded yet.</Text>
            </View>
          ) : (
            logs.slice(0, 10).map((log) => {
              const isLoad = log.type === 'load';
              return (
                <View key={log.id} className="py-2 border-b border-slate-100 dark:border-slate-800/60 flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View className={`w-7 h-7 rounded-lg items-center justify-center ${isLoad ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-sky-50 dark:bg-sky-950/60'}`}>
                      <Ionicons name={isLoad ? "arrow-up" : "arrow-down"} size={14} color={isLoad ? "#059669" : "#0284C7"} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isLoad ? 'Loaded' : 'Unloaded'} {log.quantity} Jars • {log.driverName}
                      </Text>
                      <Text className="text-[10px] text-slate-400 mt-0.5">
                        Vehicle: {log.vehicleNumber} • {formatDate(log.timestamp)}
                      </Text>
                    </View>
                  </View>

                  <View className={`px-2.5 py-1 rounded-lg ${isLoad ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-sky-100 dark:bg-sky-900/60'}`}>
                    <Text className={`text-[10px] font-black ${isLoad ? 'text-emerald-700 dark:text-emerald-300' : 'text-sky-700 dark:text-sky-300'}`}>
                      {isLoad ? `+${log.quantity}` : `-${log.quantity}`} JARS
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
