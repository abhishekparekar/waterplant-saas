import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Linking,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/utils/invoiceUtils';

export default function CustomerProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const customerData = useMemo(() => {
    if (!user) return null;
    return customers.find(
      (c) => c.id === user.customerId || c.id === user.uid || (c.phone && user.phoneNumber && c.phone.replace(/[^0-9]/g, '') === user.phoneNumber.replace(/[^0-9]/g, ''))
    ) || null;
  }, [user, customers]);

  const plantName = user?.businessName || customerData?.businessName || 'Abhiraj Water Plant';
  const jarRate = customerData?.pricePerJar || 35;
  const jarsHeld = customerData?.emptyBottlesHeld || 0;
  const depositPaid = customerData?.depositPaid || 0;
  const accountDues = customerData?.balance !== undefined ? customerData.balance : 0;

  const [modalVisible, setModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || customerData?.name || 'Customer');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || customerData?.phone || '');
  const [address, setAddress] = useState(user?.address || customerData?.address || 'Flat 302, Green Valley Apartments');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!displayName.trim() || !phoneNumber.trim() || !address.trim()) {
      Alert.alert('Validation Error', 'Please enter your name, phone number, and delivery address.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
      Alert.alert('Profile Saved 🎉', 'Your delivery address and contact details have been updated.');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your customer account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace(ROUTES.LOGIN);
        }
      }
    ]);
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5" 
      contentContainerStyle={{ paddingBottom: 85 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Customer Profile Identity Header Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mb-3">
        <LinearGradient
          colors={['#0284C7', '#0369A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 64, width: '100%' }}
        />
        <View className="items-center px-4 pb-4 -mt-9">
          {/* Avatar Frame */}
          <View className="w-18 h-18 rounded-full bg-sky-600 justify-center items-center shadow-md overflow-hidden border-3 border-white dark:border-slate-800 mb-2">
            <Text className="text-2xl font-black text-white">
              {(displayName || 'C').substring(0, 2).toUpperCase()}
            </Text>
          </View>

          <Text className="text-base font-black text-slate-900 dark:text-slate-50 text-center leading-tight">
            {displayName}
          </Text>

          <Text className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5 text-center">
            📞 {phoneNumber || 'Not Added'}
          </Text>

          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60 mt-2">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <Text className="text-[10px] font-black text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              Active Water Client
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Connected Water Plant Business Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm mb-3">
        <View className="flex-row justify-between items-center mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Connected Water Plant Supplier
          </Text>
          <View className="bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <Text style={{ fontSize: 9, fontWeight: '900', color: '#047857' }}>Official Supplier</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3 py-1">
          <View className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 items-center justify-center">
            <Ionicons name="business" size={22} color="#0284C7" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>
              {plantName}
            </Text>
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              Your Jar Rate: <Text className="font-black text-teal-600">₹{jarRate} / 20L Jar</Text>
            </Text>
          </View>
        </View>

        {/* Action Buttons for Plant Support */}
        <View className="flex-row gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#F0FDFA',
              borderWidth: 1,
              borderColor: '#99F6E4',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="call" size={13} color="#0D9488" />
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#0F766E' }}>Call Plant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://wa.me/918485877633?text=Hi%20Plant%20Manager%2C%20inquiry%20regarding%20water%20supply').catch(() => {})}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#F0FDF4',
              borderWidth: 1,
              borderColor: '#BBF7D0',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="logo-whatsapp" size={13} color="#16A34A" />
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#15803D' }}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Delivery Location & Address Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm mb-3">
        <View className="flex-row justify-between items-center mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Delivery Destination & Notes
          </Text>

          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: '#F0F9FF',
              borderWidth: 1,
              borderColor: '#BAE6FD',
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={12} color="#0284C7" />
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#0284C7' }}>Edit Address</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-start gap-2.5 py-1">
          <View className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 items-center justify-center mt-0.5">
            <Ionicons name="location" size={14} color="#D97706" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
              {address}
            </Text>
            <Text className="text-[10px] text-slate-400 mt-1">
              Drivers dispatched from {plantName} will deliver to this location.
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Bottle Ledger & Security Deposit Summary */}
      <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm mb-3">
        <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5">
          Water Jar Balance & Deposits
        </Text>

        <View className="flex-row gap-2">
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-2.5 items-center">
            <Text className="text-lg font-black text-sky-900 dark:text-sky-100">
              {jarsHeld}
            </Text>
            <Text className="text-[9px] font-bold text-sky-700 dark:text-sky-300 uppercase mt-0.5">
              Jars With You
            </Text>
          </View>

          <View className="flex-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 items-center">
            <Text className="text-lg font-black text-amber-900 dark:text-amber-100">
              {jarsHeld}
            </Text>
            <Text className="text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase mt-0.5">
              Empty Pending
            </Text>
          </View>

          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2.5 items-center">
            <Text className="text-lg font-black text-emerald-900 dark:text-emerald-100">
              ₹{depositPaid}
            </Text>
            <Text className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mt-0.5">
              Deposit Paid
            </Text>
          </View>
        </View>

        <View className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex-row justify-between items-center">
          <Text className="text-xs text-slate-500 dark:text-slate-400">Account Dues Status:</Text>
          <Text className={`text-xs font-black ${accountDues > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {accountDues > 0 ? `Unpaid Dues: ${formatCurrency(accountDues)}` : 'All Dues Paid (₹0)'}
          </Text>
        </View>
      </View>

      {/* 5. Log Out Button in Rectangular Format */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{
          height: 42,
          borderRadius: 8,
          backgroundColor: '#FEE2E2',
          borderWidth: 1,
          borderColor: '#FECACA',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 2,
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="power" size={16} color="#DC2626" />
        <Text style={{ fontSize: 13, fontWeight: '900', color: '#DC2626' }}>
          Log Out Customer Account
        </Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                Update Delivery Details
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Full Name *"
                placeholder="Enter your name"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <Input
                label="Contact Number *"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              <Input
                label="Delivery Address / Landmark *"
                placeholder="Enter complete address, flat, street & landmark"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />

              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
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
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={saving}
                  style={{
                    flex: 2,
                    height: 42,
                    borderRadius: 8,
                    overflow: 'hidden',
                    elevation: 2,
                    shadowColor: '#0284C7',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0284C7', '#0369A1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>Save Details</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
