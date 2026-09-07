import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { useDeliveryStore } from '@/store/deliveryStore';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelperAddCustomerScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addCustomer, customers, fetchCustomers } = useCustomerStore();
  const { createDelivery } = useDeliveryStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [routeArea, setRouteArea] = useState('');
  const [pricePerJar, setPricePerJar] = useState('35');
  const [initialJars, setInitialJars] = useState(1);
  const [emptyJarsReceived, setEmptyJarsReceived] = useState(0);
  const [depositCollected, setDepositCollected] = useState('150');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customerType, setCustomerType] = useState<'residential' | 'commercial' | 'hotel'>('residential');

  const handleSaveCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter client/customer name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter client delivery address or landmark.');
      return;
    }

    const price = parseFloat(pricePerJar) || 35;
    const deposit = parseFloat(depositCollected) || 0;

    setSubmitting(true);
    try {
      // 1. Create customer directly in tenant Firestore collection
      const newCustomer = await addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: `${phone.trim().replace(/[^0-9]/g, '')}@waterplant.local`,
        address: `${address.trim()}${routeArea.trim() ? ` (Route: ${routeArea.trim()})` : ''}`,
        pricePerJar: price,
        emptyBottlesHeld: initialJars,
        depositPaid: deposit,
        balance: 0,
      });

      // 2. If initial jars delivered > 0, log a delivery run directly
      if (initialJars > 0 && newCustomer?.id) {
        try {
          await createDelivery({
            orderId: `INIT-${Date.now()}`,
            customerId: newCustomer.id,
            customerName: name.trim(),
            customerPhone: phone.trim(),
            customerAddress: address.trim(),
            helperId: user?.uid || 'driver_staff',
            helperName: user?.displayName || 'Driver Staff',
            bottlesDelivered: initialJars,
            emptyBottlesReturned: emptyJarsReceived,
            cashCollected: (initialJars * price) + deposit,
            status: 'completed',
            scheduledDate: new Date().toISOString(),
            notes: notes.trim() ? `Staff Route Add: ${notes.trim()}` : 'Direct Client Added on Route by Staff'
          });
        } catch (deliveryErr) {
          console.warn('Initial delivery log warning:', deliveryErr);
        }
      }

      await fetchCustomers();

      Alert.alert(
        'Client Added Successfully! 🎉',
        `Client "${name}" is now active in ${user?.businessName || 'Plant'} database and visible to the business owner.`,
        [
          {
            text: 'View Delivery Runs',
            onPress: () => router.replace(ROUTES.HELPER.DASHBOARD)
          },
          {
            text: '+ Add Another Client',
            onPress: () => {
              setName('');
              setPhone('');
              setAddress('');
              setRouteArea('');
              setInitialJars(1);
              setEmptyJarsReceived(0);
              setNotes('');
            }
          }
        ]
      );
    } catch (err: any) {
      Alert.alert('Failed to Add Client', err.message || 'Could not save client. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView 
        className="flex-1 px-3.5 pt-2.5" 
        contentContainerStyle={{ paddingBottom: 95 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Banner with LinearGradient */}
        <LinearGradient
          colors={['#0D9488', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            padding: 14,
            elevation: 3,
            shadowColor: '#0D9488',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
            marginBottom: 12,
          }}
        >
          <View className="flex-row items-center gap-2.5 mb-1">
            <View className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center border border-white/30">
              <Ionicons name="person-add" size={20} color="#FFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-white">
                Register New Water Client
              </Text>
              <Text className="text-[11px] font-bold text-teal-100">
                Instantly synced to plant owner & route accounts
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 mt-1 bg-black/15 px-2.5 py-1 rounded-md self-start">
            <View className="w-2 h-2 rounded-full bg-emerald-300" />
            <Text className="text-[10px] font-black text-white">
              Driver Route Entry: {user?.displayName || 'Logistics Staff'}
            </Text>
          </View>
        </LinearGradient>

        {/* Client Type Selector */}
        <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 px-0.5">
          Client Category *
        </Text>
        <View className="flex-row gap-2 mb-3">
          {[
            { key: 'residential', label: 'Home / Flat', icon: 'home-outline' },
            { key: 'commercial', label: 'Office / Shop', icon: 'business-outline' },
            { key: 'hotel', label: 'Hotel / Cafe', icon: 'restaurant-outline' },
          ].map((item) => {
            const isSel = customerType === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setCustomerType(item.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSel ? '#0D9488' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isSel ? '#0D9488' : '#CBD5E1',
                  flexDirection: 'row',
                  gap: 4
                }}
                activeOpacity={0.75}
              >
                <Ionicons name={item.icon as any} size={14} color={isSel ? '#FFF' : '#64748B'} />
                <Text style={{ fontSize: 11, fontWeight: '900', color: isSel ? '#FFF' : '#475569' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Details Card */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm mb-3">
          <Input
            label="Client Full Name *"
            placeholder="e.g. Ramesh Patil / Sai Cafe"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Client Phone / WhatsApp Number *"
            placeholder="e.g. 9822001122"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Delivery Address / Landmark *"
            placeholder="e.g. Flat 302, Sai Residency, Near Water Tank"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Route / Sector (Optional)"
            placeholder="e.g. Sector 4 / Main Market Route"
            value={routeArea}
            onChangeText={setRouteArea}
          />

          {/* Pricing & Jar Setup */}
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Input
                label="Price Per 20L Jar (₹)"
                placeholder="35"
                value={pricePerJar}
                onChangeText={setPricePerJar}
                keyboardType="decimal-pad"
              />
            </View>

            <View className="flex-1">
              <Input
                label="Bottle Deposit (₹)"
                placeholder="150"
                value={depositCollected}
                onChangeText={setDepositCollected}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Initial First Drop Steppers Card */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm mb-3">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5">
            Initial Water Jars Handover (Today)
          </Text>

          {/* Full Jars Delivered Stepper */}
          <View className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <View>
              <Text className="text-xs font-black text-slate-800 dark:text-slate-200">
                Full Jars Delivered Now
              </Text>
              <Text className="text-[10px] font-semibold text-slate-400">
                Jars left at customer location
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setInitialJars(prev => Math.max(0, prev - 1))}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 7,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="remove" size={16} color="#0F172A" />
              </TouchableOpacity>

              <Text style={{ fontSize: 16, fontWeight: '900', color: '#0D9488', minWidth: 26, textAlign: 'center' }}>
                {initialJars}
              </Text>

              <TouchableOpacity
                onPress={() => setInitialJars(prev => prev + 1)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 7,
                  backgroundColor: '#0D9488',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="add" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Empty Jars Taken Back Stepper */}
          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="text-xs font-black text-slate-800 dark:text-slate-200">
                Empty Jars Taken Back
              </Text>
              <Text className="text-[10px] font-semibold text-slate-400">
                Collected into delivery vehicle
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setEmptyJarsReceived(prev => Math.max(0, prev - 1))}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 7,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="remove" size={16} color="#0F172A" />
              </TouchableOpacity>

              <Text style={{ fontSize: 16, fontWeight: '900', color: '#0284C7', minWidth: 26, textAlign: 'center' }}>
                {emptyJarsReceived}
              </Text>

              <TouchableOpacity
                onPress={() => setEmptyJarsReceived(prev => prev + 1)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 7,
                  backgroundColor: '#0284C7',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="add" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery Note */}
        <Input
          label="Special Delivery Note (Optional)"
          placeholder="e.g. Ring bell twice, regular 2 jars every Mon & Thu"
          value={notes}
          onChangeText={setNotes}
        />

        {/* Action Buttons in Rectangular Format */}
        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity
            onPress={() => router.replace(ROUTES.HELPER.DASHBOARD)}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 8,
              backgroundColor: '#F1F5F9',
              borderWidth: 1,
              borderColor: '#CBD5E1',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#475569' }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveCustomer}
            disabled={submitting}
            style={{
              flex: 2,
              height: 42,
              borderRadius: 8,
              overflow: 'hidden',
              elevation: 3,
              shadowColor: '#0D9488',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={17} color="#FFF" />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 }}>
                    Save Client & Sync Plant
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
