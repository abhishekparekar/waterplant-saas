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
  const { addCustomer, fetchCustomers } = useCustomerStore();
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
      Alert.alert('Validation Error', 'Please enter client name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit number.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter delivery address.');
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
        `Client "${name}" has been registered and is now visible to the business owner.`,
        [
          {
            text: 'View Delivery Runs',
            onPress: () => router.replace(ROUTES.HELPER.DASHBOARD)
          },
          {
            text: 'Add Another Client',
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
        className="flex-1 px-3 pt-2" 
        contentContainerStyle={{ paddingBottom: 85 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Compact Title Row (No Green Banner) */}
        <View className="flex-row items-center justify-between mb-2 px-0.5">
          <View>
            <Text className="text-base font-black text-slate-900 dark:text-slate-100">
              Add Client
            </Text>
            <Text className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Register new delivery customer on route
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-md">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <Text className="text-[10.5px] font-black text-emerald-700 dark:text-emerald-300">
              Owner Synced
            </Text>
          </View>
        </View>

        {/* Client Category Chips */}
        <View className="flex-row gap-2 mb-2.5">
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
                  paddingVertical: 7,
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
                <Ionicons name={item.icon as any} size={13} color={isSel ? '#FFF' : '#64748B'} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: isSel ? '#FFF' : '#475569' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Details Card */}
        <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-sm mb-2.5">
          <Input
            label="Client Name *"
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Phone Number *"
            placeholder="Enter number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Delivery Address *"
            placeholder="Enter address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Route / Sector (Optional)"
            placeholder="Enter route / area"
            value={routeArea}
            onChangeText={setRouteArea}
          />

          {/* Pricing & Jar Setup */}
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                label="Price Per Jar (₹)"
                placeholder="Enter price"
                value={pricePerJar}
                onChangeText={setPricePerJar}
                keyboardType="decimal-pad"
              />
            </View>

            <View className="flex-1">
              <Input
                label="Bottle Deposit (₹)"
                placeholder="Enter deposit"
                value={depositCollected}
                onChangeText={setDepositCollected}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Handover Steppers Card */}
        <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-sm mb-2.5">
          <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            Initial Water Jars Handover (Today)
          </Text>

          {/* Full Jars Delivered Stepper */}
          <View className="flex-row items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <View>
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Full Jars Delivered
              </Text>
              <Text className="text-[10px] text-slate-400">
                Left at customer place
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setInitialJars(prev => Math.max(0, prev - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="remove" size={15} color="#0F172A" />
              </TouchableOpacity>

              <Text style={{ fontSize: 15, fontWeight: '900', color: '#0D9488', minWidth: 24, textAlign: 'center' }}>
                {initialJars}
              </Text>

              <TouchableOpacity
                onPress={() => setInitialJars(prev => prev + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: '#0D9488',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="add" size={15} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Empty Jars Taken Back Stepper */}
          <View className="flex-row items-center justify-between py-1.5">
            <View>
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Empty Jars Taken Back
              </Text>
              <Text className="text-[10px] text-slate-400">
                Loaded into vehicle
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setEmptyJarsReceived(prev => Math.max(0, prev - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="remove" size={15} color="#0F172A" />
              </TouchableOpacity>

              <Text style={{ fontSize: 15, fontWeight: '900', color: '#0284C7', minWidth: 24, textAlign: 'center' }}>
                {emptyJarsReceived}
              </Text>

              <TouchableOpacity
                onPress={() => setEmptyJarsReceived(prev => prev + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: '#0284C7',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="add" size={15} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery Note */}
        <Input
          label="Delivery Note (Optional)"
          placeholder="Enter delivery note"
          value={notes}
          onChangeText={setNotes}
        />

        {/* Action Buttons in Rectangular Format */}
        <View className="flex-row gap-2 mt-1.5">
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
              elevation: 2,
              shadowColor: '#0D9488',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
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
                  <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 }}>
                    Save Client
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
