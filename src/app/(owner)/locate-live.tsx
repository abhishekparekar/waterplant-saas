import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  Linking, 
  RefreshControl,
  Platform,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import { useStaffStore } from '@/store/staffStore';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';

export interface DriverFleetStatus {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  route: string;
  status: 'on_route' | 'delivering' | 'returning' | 'idle';
  speedKmH: number;
  batteryPct: number;
  lastPing: string;
  jarsLoaded: number;
  jarsDelivered: number;
  currentStop: string;
  nextStop: string;
}

export default function LocateLiveScreen() {
  const isDark = useColorScheme() === 'dark';
  const { staffList, loading, fetchStaff } = useStaffStore();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle'>('all');
  const [broadcastModalVisible, setBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverFleetStatus | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Compute live simulated telemetry for all registered active drivers
  const fleet: DriverFleetStatus[] = useMemo(() => {
    return staffList.map((staff, idx) => {
      const isEven = idx % 2 === 0;
      const isActive = staff.status === 'active';
      const jarsLoaded = 50 + (idx * 15);
      const jarsDelivered = Math.min(jarsLoaded - 8, Math.max(12, (staff.todayDeliveries || 0) * 5 + (idx * 8)));

      return {
        id: staff.id,
        name: staff.name,
        phone: staff.phone,
        vehicle: staff.vehicleNumber || `Plant Tempo ${idx + 1}`,
        route: staff.assignedRoute || `Delivery Route ${idx + 1}`,
        status: !isActive ? 'idle' : (isEven ? 'on_route' : 'delivering'),
        speedKmH: !isActive ? 0 : 24 + (idx * 5),
        batteryPct: 85 - (idx * 6),
        lastPing: '2 mins ago',
        jarsLoaded,
        jarsDelivered,
        currentStop: isEven ? 'Sector 4, Shop 12' : 'Industrial Area Plot 18',
        nextStop: isEven ? 'Krishna Heights, Flat 402' : 'Greenfield Society Gate 2',
      };
    });
  }, [staffList]);

  const filteredFleet = useMemo(() => {
    return fleet.filter((driver) => {
      if (filterStatus === 'active' && driver.status === 'idle') return false;
      if (filterStatus === 'idle' && driver.status !== 'idle') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = driver.name.toLowerCase().includes(q);
        const matchesVehicle = driver.vehicle.toLowerCase().includes(q);
        const matchesRoute = driver.route.toLowerCase().includes(q);
        if (!matchesName && !matchesVehicle && !matchesRoute) return false;
      }

      return true;
    });
  }, [fleet, filterStatus, searchQuery]);

  const activeFleetCount = fleet.filter(f => f.status !== 'idle').length;
  const totalLoaded = fleet.reduce((acc, f) => acc + (f.status !== 'idle' ? f.jarsLoaded : 0), 0);
  const totalDelivered = fleet.reduce((acc, f) => acc + (f.status !== 'idle' ? f.jarsDelivered : 0), 0);

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) {
      Alert.alert('Validation Error', 'Please enter a message to broadcast to drivers.');
      return;
    }
    setSendingBroadcast(true);
    setTimeout(() => {
      setSendingBroadcast(false);
      setBroadcastModalVisible(false);
      setBroadcastMessage('');
      Alert.alert('Broadcast Sent', `Notification broadcasted to ${activeFleetCount} active delivery drivers.`);
    }, 600);
  };

  const handleCallDriver = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Notice', 'Unable to make phone call.');
    });
  };

  const handleWhatsAppDriver = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const plantName = user?.businessName || 'NextWater Plant';
    const text = `Hello ${name}, this is ${plantName} dispatch office. Please share your current GPS location and pending delivery count.`;
    Linking.openURL(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP LIVE TELEMETRY BAR */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3.5 pt-2.5 pb-3">
        <View className="flex-row gap-2 mb-2.5">
          {/* Active Fleet */}
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/80 rounded-2xl p-2.5">
            <View className="flex-row items-center gap-1.5 mb-0.5">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Active On Route
              </Text>
            </View>
            <Text className="text-xl font-black text-emerald-700 dark:text-emerald-300">
              {activeFleetCount} <Text className="text-xs font-bold">Vehicles</Text>
            </Text>
          </View>

          {/* Jars Delivered vs On-Truck */}
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/80 rounded-2xl p-2.5">
            <View className="flex-row items-center gap-1.5 mb-0.5">
              <Ionicons name="cube" size={13} color="#0284C7" />
              <Text className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                Jars Delivered
              </Text>
            </View>
            <Text className="text-xl font-black text-sky-700 dark:text-sky-300">
              {totalDelivered} / {totalLoaded}
            </Text>
          </View>

          {/* Broadcast Trigger with LinearGradient */}
          <TouchableOpacity
            onPress={() => setBroadcastModalVisible(true)}
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: 'hidden',
              elevation: 3,
              shadowColor: '#D97706',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#D97706', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full h-full justify-center items-center p-2.5"
            >
              <Ionicons name="megaphone" size={17} color="#FFFFFF" />
              <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', marginTop: 3 }}>
                Broadcast
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search by driver name, vehicle, or route..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={15} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Badges */}
        <View className="flex-row gap-1.5">
          {[
            { id: 'all', label: `All Vehicles (${fleet.length})` },
            { id: 'active', label: `🟢 On Route (${activeFleetCount})` },
            { id: 'idle', label: '⚪ Off Duty / Idle' },
          ].map((f) => {
            const isSelected = filterStatus === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilterStatus(f.id as any)}
                className={`flex-1 py-1.5 rounded-xl items-center border ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
                activeOpacity={0.7}
              >
                <Text className={`text-[10px] font-bold ${isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. FLEET DRIVER CARDS LIST */}
      <ScrollView
        className="flex-1 px-3.5 py-3"
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStaff} colors={['#0284c7']} />}
      >
        <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
          Fleet Driver Positions ({filteredFleet.length})
        </Text>

        <View className="gap-3">
          {filteredFleet.map((driver) => {
            const isIdle = driver.status === 'idle';
            const progressPct = driver.jarsLoaded > 0 
              ? Math.min(100, Math.round((driver.jarsDelivered / driver.jarsLoaded) * 100))
              : 0;

            return (
              <View
                key={driver.id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm"
              >
                {/* Driver & Vehicle Header */}
                <View className="flex-row justify-between items-start mb-2.5">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 justify-center items-center mr-2.5">
                      <Ionicons name="bus" size={22} color="#0D9488" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                          {driver.name}
                        </Text>
                        <View className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                          <Text className="text-[9.5px] font-bold text-slate-600 dark:text-slate-300">
                            {driver.vehicle}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        📍 {driver.route}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View className={`px-2.5 py-1 rounded-xl items-center flex-row gap-1.5 ${isIdle ? 'bg-slate-100 dark:bg-slate-700' : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'}`}>
                    <View className={`w-2 h-2 rounded-full ${isIdle ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                    <Text className={`text-[10px] font-black uppercase tracking-wide ${isIdle ? 'text-slate-500' : 'text-emerald-700 dark:text-emerald-300'}`}>
                      {isIdle ? 'OFF DUTY' : 'ON ROUTE'}
                    </Text>
                  </View>
                </View>

                {!isIdle && (
                  <>
                    {/* Live Telemetry Data (Speed, Battery, Stops) */}
                    <View className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl mb-2.5 border border-slate-100 dark:border-slate-800">
                      <View className="flex-row justify-between items-center mb-2.5">
                        <View className="flex-row items-center gap-1.5">
                          <Ionicons name="speedometer-outline" size={14} color="#64748B" />
                          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {driver.speedKmH} km/h
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1.5">
                          <Ionicons name="battery-charging-outline" size={14} color="#059669" />
                          <Text className="text-xs font-bold text-emerald-600">
                            {driver.batteryPct}% Battery
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1.5">
                          <Ionicons name="time-outline" size={14} color="#64748B" />
                          <Text className="text-[11px] font-medium text-slate-400">
                            Ping: {driver.lastPing}
                          </Text>
                        </View>
                      </View>

                      {/* Delivery Progress Bar */}
                      <View className="mb-2">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-[10.5px] font-bold text-slate-500">
                            Delivery Trip Progress
                          </Text>
                          <Text className="text-[10.5px] font-black text-sky-600">
                            {driver.jarsDelivered} / {driver.jarsLoaded} Jars ({progressPct}%)
                          </Text>
                        </View>
                        <View className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <View 
                            className="h-full rounded-full overflow-hidden" 
                            style={{ width: `${progressPct}%` }} 
                          >
                            <LinearGradient
                              colors={['#0284C7', '#38BDF8']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              className="w-full h-full"
                            />
                          </View>
                        </View>
                      </View>

                      {/* Next Scheduled Stop */}
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Ionicons name="arrow-forward-circle" size={14} color="#0284C7" />
                        <Text className="text-xs text-slate-600 dark:text-slate-300" numberOfLines={1}>
                          Next Stop: <Text className="font-bold text-slate-800 dark:text-slate-100">{driver.nextStop}</Text>
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Card Actions */}
                <View className="flex-row gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <TouchableOpacity
                    onPress={() => handleCallDriver(driver.phone)}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: isDark ? '#334155' : '#E2E8F0',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={14} color="#059669" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: isDark ? '#F1F5F9' : '#1E293B' }}>
                      Call Driver
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleWhatsAppDriver(driver.phone, driver.name)}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 12,
                      overflow: 'hidden',
                      elevation: 2,
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.25,
                      shadowRadius: 2
                    }}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-full h-full flex-row items-center justify-center gap-1.5"
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#FFF" />
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                        WhatsApp
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedDriver(driver)}
                    style={{
                      paddingHorizontal: 14,
                      height: 40,
                      borderRadius: 12,
                      overflow: 'hidden',
                      elevation: 2,
                      shadowColor: '#0284C7',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.25,
                      shadowRadius: 2
                    }}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#0284C7', '#0EA5E9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-full h-full flex-row items-center justify-center gap-1.5"
                    >
                      <Ionicons name="map-outline" size={14} color="#FFF" />
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                        Details
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* BROADCAST ALERT MODAL */}
      <Modal
        visible={broadcastModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBroadcastModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 justify-center items-center">
                  <Ionicons name="megaphone" size={16} color="#D97706" />
                </View>
                <Text className="text-[14px] font-black text-slate-900 dark:text-slate-50">
                  Broadcast Driver Announcement
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBroadcastModalVisible(false)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-slate-500 mb-2">
              Send an instant priority notification to all active delivery drivers currently on route.
            </Text>

            <TextInput
              placeholder="e.g. Urgent: Return empty jars to plant before 5:00 PM for washing batch."
              placeholderTextColor="#94A3B8"
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              multiline
              numberOfLines={3}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 mb-4"
              textAlignVertical="top"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setBroadcastModalVisible(false)}
                className="flex-1 h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                activeOpacity={0.7}
              >
                <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendBroadcast}
                disabled={sendingBroadcast}
                className="flex-1 h-11 rounded-xl overflow-hidden shadow-sm shadow-amber-600/20"
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#D97706', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-full h-full flex-row items-center justify-center gap-1.5"
                >
                  {sendingBroadcast ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="megaphone" size={16} color="#FFF" />
                      <Text className="text-xs font-black text-white">Send Broadcast</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DRIVER ROUTE DETAILS MODAL */}
      <Modal
        visible={!!selectedDriver}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedDriver(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl">
            <View className="items-center pb-3 border-b border-slate-100 dark:border-slate-700">
              <View className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 items-center justify-center mb-1.5">
                <Ionicons name="bus" size={24} color="#0D9488" />
              </View>
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                {selectedDriver?.name}
              </Text>
              <Text className="text-xs text-slate-400 font-medium mt-0.5">
                {selectedDriver?.vehicle} • {selectedDriver?.route}
              </Text>
            </View>

            <View className="py-3 gap-2">
              <View className="flex-row justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <Text className="text-xs font-semibold text-slate-400">Current Trip Load</Text>
                <Text className="text-xs font-black text-slate-800 dark:text-slate-200">{selectedDriver?.jarsLoaded} 20L Jars</Text>
              </View>
              <View className="flex-row justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <Text className="text-xs font-semibold text-slate-400">Delivered</Text>
                <Text className="text-xs font-black text-emerald-600">{selectedDriver?.jarsDelivered} Jars</Text>
              </View>
              <View className="flex-row justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <Text className="text-xs font-semibold text-slate-400">Current Location / Stop</Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedDriver?.currentStop}</Text>
              </View>
              <View className="flex-row justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <Text className="text-xs font-semibold text-slate-400">Next Stop</Text>
                <Text className="text-xs font-bold text-sky-600">{selectedDriver?.nextStop}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedDriver(null)}
              className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-700 items-center justify-center mt-2"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
