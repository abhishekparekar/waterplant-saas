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
import { eventOrderService, EventOrder, EventType, EventStatus } from '@/services/eventOrderService';
import { useStaffStore } from '@/store/staffStore';
import { useAuthStore } from '@/store/authStore';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type EventFilter = 'upcoming' | 'all' | 'completed';

export default function EventOrdersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { staffList, fetchStaff } = useStaffStore();

  const [events, setEvents] = useState<EventOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Book Event Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventTitle, setEventTitle] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('11:00 AM');
  const [jarQuantity, setJarQuantity] = useState('100');
  const [ratePerJar, setRatePerJar] = useState('35');
  const [dispenserStandsCount, setDispenserStandsCount] = useState('2');
  const [advancePaid, setAdvancePaid] = useState('1000');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventOrderService.getAll();
      setEvents(res);
    } catch (e) {
      console.error('Failed to load event orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    fetchStaff();
  }, [fetchStaff]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        e.clientName.toLowerCase().includes(q) ||
        e.eventTitle.toLowerCase().includes(q) ||
        e.venueAddress.toLowerCase().includes(q) ||
        e.clientPhone.includes(q);

      let matchesFilter = true;
      if (filter === 'upcoming') matchesFilter = e.status === 'booked' || e.status === 'dispatched';
      if (filter === 'completed') matchesFilter = e.status === 'completed';

      return matchesSearch && matchesFilter;
    });
  }, [events, searchQuery, filter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const upcomingList = events.filter(e => e.status === 'booked' || e.status === 'dispatched');
    const totalJars = events.reduce((sum, e) => sum + (e.jarQuantity || 0), 0);
    const totalRevenue = events.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
    const totalAdvance = events.reduce((sum, e) => sum + (e.advancePaid || 0), 0);

    return {
      upcomingCount: upcomingList.length,
      totalCount: events.length,
      totalJars,
      totalRevenue,
      totalAdvance
    };
  }, [events]);

  const handleEventTypeSelect = (type: EventType) => {
    setEventType(type);
    if (type === 'wedding') {
      setEventTitle('Wedding Ceremony & Reception');
      setJarQuantity('150');
      setDispenserStandsCount('4');
    } else if (type === 'corporate') {
      setEventTitle('Corporate Conference / Meeting');
      setJarQuantity('50');
      setDispenserStandsCount('2');
    } else if (type === 'party') {
      setEventTitle('Birthday / Family Function');
      setJarQuantity('30');
      setDispenserStandsCount('1');
    } else if (type === 'festival') {
      setEventTitle('Community Festival & Gathering');
      setJarQuantity('200');
      setDispenserStandsCount('5');
    }
  };

  const handleBookEvent = async () => {
    if (!clientName.trim() || !clientPhone.trim() || !venueAddress.trim()) {
      Alert.alert('Validation Error', 'Client name, phone, and venue address are required.');
      return;
    }

    const qty = parseInt(jarQuantity) || 0;
    const rate = parseFloat(ratePerJar) || 35;
    const advance = parseFloat(advancePaid) || 0;
    const stands = parseInt(dispenserStandsCount) || 0;
    const total = qty * rate;

    if (qty <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid jar quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedDriver = staffList.find(s => s.id === assignedDriverId);

      const created = await eventOrderService.create({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        eventType,
        eventTitle: eventTitle.trim() || 'Special Event Function',
        venueAddress: venueAddress.trim(),
        eventDate,
        eventTime,
        jarQuantity: qty,
        ratePerJar: rate,
        totalAmount: total,
        advancePaid: advance,
        dispenserStandsCount: stands,
        assignedDriverName: selectedDriver?.name,
        assignedVehicle: selectedDriver?.vehicleNumber,
        status: 'booked',
        notes: notes.trim() || undefined
      });

      setEvents((prev) => [created, ...prev]);
      setModalVisible(false);
      setClientName('');
      setClientPhone('');
      setVenueAddress('');
      Alert.alert('Event Booked', `Bulk order booking confirmed for ${clientName}!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to book event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (event: EventOrder, nextStatus: EventStatus) => {
    try {
      await eventOrderService.updateStatus(event.id, nextStatus, {
        balanceDue: nextStatus === 'completed' ? 0 : event.balanceDue
      });

      setEvents((prev) => prev.map(e => e.id === event.id ? { ...e, status: nextStatus, balanceDue: nextStatus === 'completed' ? 0 : e.balanceDue } : e));
      Alert.alert('Status Updated', `Event booking marked as ${nextStatus.toUpperCase()}`);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  // WhatsApp Event Quotation & Confirmation Slip
  const handleSendWhatsAppSlip = (event: EventOrder) => {
    const cleanPhone = event.clientPhone.replace(/[^0-9]/g, '');
    const plantName = user?.businessName || 'NextWater Plant';

    const message = `🎉 *${plantName} - EVENT BULK WATER BOOKING CONFIRMATION*\n\n` +
      `👤 Client: *${event.clientName}*\n` +
      `🏷️ Function: *${event.eventTitle}*\n` +
      `📍 Venue: *${event.venueAddress}*\n` +
      `📅 Date & Time: *${event.eventDate} at ${event.eventTime}*\n\n` +
      `📦 *SUPPLY PACKAGE:*\n` +
      `• 20L Water Jars: *${event.jarQuantity} Jars*\n` +
      `• Dispenser Stands: *${event.dispenserStandsCount} Units*\n` +
      `• Rate per Jar: *₹${event.ratePerJar}*\n\n` +
      `💰 *BILLING SUMMARY:*\n` +
      `• Total Booking Amount: *₹${event.totalAmount}*\n` +
      `• Advance Received: *₹${event.advancePaid}*\n` +
      `• Balance Payable at Venue: *₹${event.balanceDue}*\n\n` +
      `🚛 *Logistics Driver:* ${event.assignedDriverName || 'Plant Express Tempo'}\n\n` +
      `Thank you for trusting us for your special event!`;

    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  const getEventTypeTheme = (type: EventType) => {
    switch (type) {
      case 'wedding':
        return { color: '#E11D48', bg: '#FFE4E6', label: 'Wedding / Reception', icon: 'heart' };
      case 'corporate':
        return { color: '#2563EB', bg: '#DBEAFE', label: 'Corporate Event', icon: 'business' };
      case 'party':
        return { color: '#D97706', bg: '#FEF3C7', label: 'Birthday / Function', icon: 'gift' };
      case 'festival':
        return { color: '#059669', bg: '#D1FAE5', label: 'Public Festival', icon: 'flag' };
      default:
        return { color: '#0284C7', bg: '#E0F2FE', label: 'Bulk Order', icon: 'water' };
    }
  };

  if (loading && events.length === 0) {
    return <Loader />;
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP SUMMARY & KPI BAR */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3 pt-2 pb-2">
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
              Event & Function Bulk Orders
            </Text>
            <Text className="text-2xl font-black text-white mt-1">
              {stats.upcomingCount} Upcoming Bookings
            </Text>
            <Text className="text-xs text-rose-100 font-bold mt-1">
              Volume: {stats.totalJars} Jars • Advances: {formatCurrency(stats.totalAdvance)}
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
            <Ionicons name="calendar" size={15} color="#E11D48" />
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#E11D48' }}>+ Book Event</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-2 border border-slate-200/60 dark:border-slate-800">
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput 
            placeholder="Search by client, venue, or function..."
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
            { id: 'upcoming', label: `Upcoming (${stats.upcomingCount})` },
            { id: 'all', label: `All Bookings (${stats.totalCount})` },
            { id: 'completed', label: 'Completed' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id as any)}
              className={`flex-1 py-1.5 rounded-xl items-center border ${
                filter === f.id 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-[10.5px] font-bold ${filter === f.id ? 'text-rose-700 dark:text-rose-300 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. EVENT CARDS LIST */}
      <ScrollView 
        className="flex-1 px-3 py-2"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEvents} colors={['#E11D48']} />}
      >
        {filteredEvents.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="calendar-clear-outline" size={42} color="#94A3B8" />
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">No Event Bookings Found</Text>
            <Text className="text-xs text-slate-400 text-center px-6 mt-1">
              Book special water orders for weddings, conferences, birthdays, and festivals.
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="mt-3.5 bg-rose-600 px-4 py-2.5 rounded-xl"
            >
              <Text className="text-white text-xs font-black">+ Book First Event Order</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredEvents.map((event) => {
            const theme = getEventTypeTheme(event.eventType);
            const isCompleted = event.status === 'completed';
            const isDispatched = event.status === 'dispatched';

            return (
              <View 
                key={event.id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-3.5 mb-3 shadow-sm"
              >
                {/* Header: Event Type Badge & Status */}
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-1.5">
                    <View 
                      style={{ backgroundColor: theme.bg }} 
                      className="px-2.5 py-0.5 rounded-full flex-row items-center gap-1"
                    >
                      <Ionicons name={theme.icon as any} size={12} color={theme.color} />
                      <Text style={{ color: theme.color }} className="text-[10px] font-black">
                        {theme.label}
                      </Text>
                    </View>
                  </View>

                  <View className={`px-2.5 py-0.5 rounded-full ${
                    isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200' :
                    isDispatched ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200' :
                    'bg-amber-50 dark:bg-amber-950/60 border border-amber-200'
                  }`}>
                    <Text className={`text-[10px] font-black uppercase ${
                      isCompleted ? 'text-emerald-700' : isDispatched ? 'text-sky-700' : 'text-amber-700'
                    }`}>
                      {event.status}
                    </Text>
                  </View>
                </View>

                {/* Event Title & Client Info */}
                <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50 leading-tight">
                  {event.eventTitle}
                </Text>

                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Client: {event.clientName}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(`tel:${event.clientPhone}`).catch(() => {})}
                    className="flex-row items-center gap-1"
                  >
                    <Ionicons name="call" size={12} color="#0284C7" />
                    <Text className="text-xs font-extrabold text-sky-600">{event.clientPhone}</Text>
                  </TouchableOpacity>
                </View>

                {/* Venue & Date/Time */}
                <View className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl my-2 border border-slate-100 dark:border-slate-800">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <Ionicons name="location" size={13} color="#D97706" />
                    <Text className="text-xs text-slate-700 dark:text-slate-300 font-medium flex-1" numberOfLines={1}>
                      {event.venueAddress}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="calendar-outline" size={12} color="#64748B" />
                    <Text className="text-[11px] text-slate-500 font-semibold">
                      {event.eventDate} at {event.eventTime}
                    </Text>
                  </View>
                </View>

                {/* Package & Financials Bar */}
                <View className="flex-row justify-between items-center py-1.5 border-t border-slate-100 dark:border-slate-800 mb-2.5">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="cube-outline" size={13} color="#2563EB" />
                    <Text className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {event.jarQuantity} Jars
                    </Text>
                    {event.dispenserStandsCount > 0 && (
                      <Text className="text-[10.5px] text-slate-400 font-medium">
                        + {event.dispenserStandsCount} Stands
                      </Text>
                    )}
                  </View>

                  <View className="items-end">
                    <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {formatCurrency(event.totalAmount)}
                    </Text>
                    <Text className="text-[10px] font-bold text-rose-600">
                      {event.balanceDue > 0 ? `Due on Venue: ${formatCurrency(event.balanceDue)}` : 'Fully Settled (✓)'}
                    </Text>
                  </View>
                </View>

                {/* Action Controls */}
                <View className="flex-row gap-2">
                  {/* Status update button with LinearGradient */}
                  {!isCompleted && (
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(event, isDispatched ? 'completed' : 'dispatched')}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        overflow: 'hidden',
                        elevation: 2,
                        shadowColor: isDispatched ? '#059669' : '#0284C7',
                        shadowOffset: { width: 0, height: 1.5 },
                        shadowOpacity: 0.25,
                        shadowRadius: 2.5
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={isDispatched ? ['#10B981', '#059669'] : ['#0284C7', '#0EA5E9']}
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
                        <Ionicons name={isDispatched ? "checkmark-done-circle" : "bus-outline"} size={14} color="#FFF" />
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                          {isDispatched ? 'Mark Completed & Paid' : 'Dispatch to Venue'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {/* WhatsApp Slip Button */}
                  <TouchableOpacity
                    onPress={() => handleSendWhatsAppSlip(event)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex-row items-center gap-1.5 active:opacity-75"
                  >
                    <Ionicons name="logo-whatsapp" size={15} color="#059669" />
                    <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Share Slip
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* BOOK EVENT MODAL */}
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
                  Book Bulk Event Water Order
                </Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  Weddings, receptions, conferences & parties
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Event Type Presets */}
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Event Type Preset
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { id: 'wedding', label: '💍 Wedding' },
                  { id: 'corporate', label: '🏢 Corporate' },
                  { id: 'party', label: '🎂 Party' },
                  { id: 'festival', label: '🎪 Festival' },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => handleEventTypeSelect(t.id as any)}
                    className={`flex-1 py-2 rounded-xl border items-center ${
                      eventType === t.id 
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${eventType === t.id ? 'text-rose-700 dark:text-rose-300 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Event / Function Title *"
                placeholder="e.g. Rahul Sharma Wedding Reception"
                value={eventTitle}
                onChangeText={setEventTitle}
              />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Client Contact Name *"
                    placeholder="e.g. Rahul Sharma"
                    value={clientName}
                    onChangeText={setClientName}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Client Phone Number *"
                    placeholder="e.g. 9876543210"
                    value={clientPhone}
                    onChangeText={setClientPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <Input
                label="Venue Address & Hall Name *"
                placeholder="e.g. Royal Palace Banquet Hall, Sector 12"
                value={venueAddress}
                onChangeText={setVenueAddress}
              />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Event Date (YYYY-MM-DD)"
                    placeholder="2026-09-15"
                    value={eventDate}
                    onChangeText={setEventDate}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Setup Time"
                    placeholder="e.g. 10:00 AM"
                    value={eventTime}
                    onChangeText={setEventTime}
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="20L Jars Count *"
                    placeholder="100"
                    value={jarQuantity}
                    onChangeText={setJarQuantity}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Rate/Jar (₹)"
                    placeholder="35"
                    value={ratePerJar}
                    onChangeText={setRatePerJar}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Stands Rented"
                    placeholder="2"
                    value={dispenserStandsCount}
                    onChangeText={setDispenserStandsCount}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Input
                label="Advance Payment Collected (₹)"
                placeholder="e.g. 1000"
                value={advancePaid}
                onChangeText={setAdvancePaid}
                keyboardType="numeric"
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
                  onPress={handleBookEvent}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#E11D48',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    opacity: submitting ? 0.7 : 1
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#E11D48', '#BE123C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text className="text-sm font-black text-white">
                      {submitting ? 'Booking...' : 'Confirm Booking'}
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
