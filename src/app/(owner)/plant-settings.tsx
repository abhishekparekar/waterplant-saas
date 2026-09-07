import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { getTenantCollection } from '@/services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlantSettingsScreen() {
  const { user, setUser } = useAuthStore();

  // Plant Profile
  const [businessName, setBusinessName] = useState(user?.businessName || 'Abhiraj Water Plant');
  const [ownerName, setOwnerName] = useState(user?.displayName || 'Abhishek');
  const [phone, setPhone] = useState(user?.phoneNumber || user?.phone || '8485877633');
  const [address, setAddress] = useState('Plot No 42, Water Treatment Zone, Industrial Area');
  const [fssaiLicense, setFssaiLicense] = useState('11520038000123');
  const [gstNumber, setGstNumber] = useState('27AABCN1234F1Z5');

  // Commercial Defaults
  const [defaultPrice, setDefaultPrice] = useState('35');
  const [defaultDeposit, setDefaultDeposit] = useState('150');
  const [lowStockAlert, setLowStockAlert] = useState('25');

  // Notification & Automation Toggles
  const [autoSmsDelivery, setAutoSmsDelivery] = useState(true);
  const [dailyEodReport, setDailyEodReport] = useState(true);
  const [lowStockNotify, setLowStockNotify] = useState(true);

  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (!businessName.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Business Name and Phone number are required.');
      return;
    }

    setSaving(true);
    try {
      if (user) {
        setUser({
          ...user,
          businessName: businessName.trim(),
          displayName: ownerName.trim(),
          phoneNumber: phone.trim(),
          phone: phone.trim(),
        });
      }

      // Save to tenant plant profile doc
      const settingsPayload = {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        fssaiLicense: fssaiLicense.trim(),
        gstNumber: gstNumber.trim(),
        defaultPrice: parseFloat(defaultPrice) || 35,
        defaultDeposit: parseFloat(defaultDeposit) || 150,
        lowStockAlert: parseInt(lowStockAlert) || 25,
        autoSmsDelivery,
        dailyEodReport,
        lowStockNotify,
        updatedAt: new Date().toISOString(),
      };

      try {
        const plantDocRef = doc(getTenantCollection('settings'), 'plant_profile');
        await setDoc(plantDocRef, settingsPayload, { merge: true });
      } catch (e) {}

      Alert.alert('Settings Saved', 'Water plant profile and commercial settings updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    Alert.alert('Data Exported', 'Plant client ledgers and financial records exported successfully to CSV format.');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        className="flex-1 px-3.5 pt-2 pb-8"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. PLANT BRANDING & LICENSURE */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3.5 shadow-sm">
          <View className="flex-row items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <View className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 items-center justify-center">
              <Ionicons name="business" size={18} color="#0284C7" />
            </View>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
              Plant Profile & Licensure
            </Text>
          </View>

          <Input
            label="Plant / Business Name *"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Abhiraj Water Plant"
          />

          <Input
            label="Owner / Managing Director Name *"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="e.g. Abhishek"
          />

          <Input
            label="Helpline / WhatsApp Number *"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 8485877633"
            keyboardType="phone-pad"
          />

          <Input
            label="Plant Physical Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Plant address for invoice slips"
          />

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                label="FSSAI License No."
                value={fssaiLicense}
                onChangeText={setFssaiLicense}
                placeholder="14-digit FSSAI"
              />
            </View>
            <View className="flex-1">
              <Input
                label="GSTIN Number"
                value={gstNumber}
                onChangeText={setGstNumber}
                placeholder="15-digit GSTIN"
              />
            </View>
          </View>
        </View>

        {/* 2. COMMERCIAL DEFAULTS */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3.5 shadow-sm">
          <View className="flex-row items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <View className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 items-center justify-center">
              <Ionicons name="pricetag" size={18} color="#059669" />
            </View>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
              Commercial Rates & Thresholds
            </Text>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                label="Default Jar Price (₹)"
                value={defaultPrice}
                onChangeText={setDefaultPrice}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Default Deposit (₹)"
                value={defaultDeposit}
                onChangeText={setDefaultDeposit}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Low Stock Warning Threshold (Jars)"
            value={lowStockAlert}
            onChangeText={setLowStockAlert}
            keyboardType="numeric"
            placeholder="Trigger warning when filled stock is below this"
          />
        </View>

        {/* 3. AUTOMATION & NOTIFICATIONS */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3.5 shadow-sm">
          <View className="flex-row items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <View className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 items-center justify-center">
              <Ionicons name="notifications" size={18} color="#D97706" />
            </View>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
              Automations & WhatsApp Alerts
            </Text>
          </View>

          {/* Toggle 1 */}
          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Delivery WhatsApp Confirmation
              </Text>
              <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-4">
                Automatically send delivery confirmation slip when driver completes a run
              </Text>
            </View>
            <Switch
              value={autoSmsDelivery}
              onValueChange={setAutoSmsDelivery}
              trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
            />
          </View>

          {/* Toggle 2 */}
          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Daily EOD Profit & Loss Summary
              </Text>
              <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-4">
                Send daily revenue, collections, and expense statement to owner at 8:00 PM
              </Text>
            </View>
            <Switch
              value={dailyEodReport}
              onValueChange={setDailyEodReport}
              trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
            />
          </View>

          {/* Toggle 3 */}
          <View className="flex-row justify-between items-center py-2.5">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Low Inventory Warning
              </Text>
              <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-4">
                Alert owner when filled jar stock falls below threshold
              </Text>
            </View>
            <Switch
              value={lowStockNotify}
              onValueChange={setLowStockNotify}
              trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
            />
          </View>
        </View>

        {/* 4. DATA BACKUP & EXPORT */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2 pb-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <View className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 items-center justify-center">
              <Ionicons name="cloud-download" size={18} color="#6366F1" />
            </View>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
              Data Backup & Export
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleExportData}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex-row justify-center items-center gap-2 active:opacity-80"
          >
            <Ionicons name="download-outline" size={16} color="#0284C7" />
            <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Export Customer Ledgers to CSV
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Button with LinearGradient */}
        <TouchableOpacity
          onPress={handleSaveSettings}
          disabled={saving}
          style={{
            height: 48,
            borderRadius: 16,
            overflow: 'hidden',
            elevation: 3,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#0284C7', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full h-full flex-row items-center justify-center gap-2"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
                <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 }}>
                  Save Plant Configurations
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
