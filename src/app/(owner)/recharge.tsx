import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  TextInput,
  Image, 
  Linking,
  ActivityIndicator
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Button } from '@/components/common/Button';

export default function RechargeScreen() {
  const { user } = useAuthStore();

  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [activating, setActivating] = useState(false);

  const [walletAlerts, setWalletAlerts] = useState(842);
  const [planDaysLeft, setPlanDaysLeft] = useState(14);

  // Subscription Plans
  const subscriptionPlans = [
    {
      id: 'pro_monthly',
      name: 'Pro Plant Plan',
      price: 999,
      duration: '1 Month',
      popular: true,
      features: [
        'Unlimited Customers & Ledger',
        'Unlimited Drivers & Delivery Routes',
        'WhatsApp Invoices & Monthly Cards',
        'Live Fleet Telemetry & P&L Reports',
        'Automatic Cloud Backup'
      ]
    },
    {
      id: 'pro_annual',
      name: 'Pro Annual Plant (Save 20%)',
      price: 9599,
      duration: '1 Year',
      popular: false,
      features: [
        'Everything in Pro Monthly',
        'Free 5,000 WhatsApp Alert Credits',
        'Custom Plant Logo on Invoices',
        'Priority 24/7 Phone Support',
        '2 Months Free'
      ]
    },
    {
      id: 'starter_monthly',
      name: 'Starter Plant Plan',
      price: 499,
      duration: '1 Month',
      popular: false,
      features: [
        'Up to 150 Customers',
        'Up to 2 Delivery Drivers',
        'Basic Billing & Invoices',
        'Standard Reports'
      ]
    }
  ];

  // WhatsApp Alert Credit Packs
  const alertPacks = [
    { id: 'pack_500', alerts: 500, price: 199, popular: false },
    { id: 'pack_1500', alerts: 1500, price: 499, popular: true },
    { id: 'pack_5000', alerts: 5000, price: 1299, popular: false },
  ];

  const handleOpenPay = (item: any, isAlertPack = false) => {
    setSelectedPlan({ ...item, isAlertPack });
    setUtrNumber('');
    setPayModalVisible(true);
  };

  const handleConfirmRecharge = () => {
    setActivating(true);
    setTimeout(() => {
      setActivating(false);
      setPayModalVisible(false);

      if (selectedPlan?.isAlertPack) {
        setWalletAlerts(prev => prev + selectedPlan.alerts);
        Alert.alert('Pack Activated', `Successfully added ${selectedPlan.alerts} WhatsApp alert credits to your plant wallet.`);
      } else {
        setPlanDaysLeft(prev => prev + (selectedPlan?.duration === '1 Year' ? 365 : 30));
        Alert.alert('Subscription Active', `Your ${selectedPlan?.name} has been activated successfully.`);
      }
    }, 800);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1 px-3.5 pt-2.5 pb-6"
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. CURRENT SUBSCRIPTION & WALLET CARD */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3.5 shadow-sm">
          <View className="flex-row justify-between items-start mb-3.5">
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  {user?.businessName || 'NextWater Pro Plant'}
                </Text>
                <View className="bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <Text className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                    PRO ACTIVE
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-slate-400 font-medium mt-0.5">
                License Key: NW-PRO-84920-IND
              </Text>
            </View>

            <View className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950 items-center justify-center border border-sky-100 dark:border-sky-900">
              <Ionicons name="shield-checkmark" size={24} color="#0284C7" />
            </View>
          </View>

          {/* 2 Stats Badges */}
          <View className="flex-row gap-2.5">
            <View className="flex-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Plan Validity
              </Text>
              <Text className="text-xl font-black text-emerald-600 mt-0.5">
                {planDaysLeft} Days Left
              </Text>
              <Text className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                Renews 20 Sep 2026
              </Text>
            </View>

            <View className="flex-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                WhatsApp SMS Credits
              </Text>
              <Text className="text-xl font-black text-sky-600 mt-0.5">
                {walletAlerts} Alerts
              </Text>
              <Text className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                Invoices & Reminders
              </Text>
            </View>
          </View>
        </View>

        {/* 2. SUBSCRIPTION PLANS SECTION */}
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5">
          Renew or Upgrade SaaS Plan
        </Text>

        <View className="gap-3 mb-4">
          {subscriptionPlans.map((plan) => (
            <View
              key={plan.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-4 border ${
                plan.popular 
                  ? 'border-sky-500 shadow-md shadow-sky-500/10' 
                  : 'border-slate-200/80 dark:border-slate-700/70 shadow-sm'
              }`}
            >
              {plan.popular && (
                <View className="self-start bg-sky-600 px-2.5 py-0.5 rounded-full mb-2.5">
                  <Text className="text-[9.5px] font-black text-white uppercase tracking-wider">
                    Recommended for Water Plants
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-start mb-2.5">
                <View>
                  <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                    {plan.name}
                  </Text>
                  <Text className="text-xs text-slate-400 font-medium mt-0.5">
                    Duration: {plan.duration}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-xl font-black text-slate-900 dark:text-slate-50">
                    {formatCurrency(plan.price)}
                  </Text>
                  <Text className="text-[10px] text-slate-400 font-bold">
                    + GST included
                  </Text>
                </View>
              </View>

              {/* Features List */}
              <View className="gap-1.5 mb-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                {plan.features.map((feat, i) => (
                  <View key={i} className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={15} color="#059669" />
                    <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {feat}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => handleOpenPay(plan, false)}
                activeOpacity={0.85}
                style={{
                  width: '100%',
                  borderRadius: 14,
                  overflow: 'hidden',
                  elevation: 3,
                  shadowColor: plan.popular ? '#0284C7' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
              >
                <LinearGradient
                  colors={plan.popular ? ['#0284C7', '#0EA5E9'] : ['#334155', '#1E293B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    Select {plan.name}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 3. WHATSAPP ALERT TOP-UP PACKS */}
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5">
          Top-Up WhatsApp Invoice Credits
        </Text>

        <View className="flex-row gap-2.5 mb-4">
          {alertPacks.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              onPress={() => handleOpenPay(pack, true)}
              className={`flex-1 bg-white dark:bg-slate-800 border rounded-2xl p-3 items-center ${
                pack.popular 
                  ? 'border-emerald-500 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
              activeOpacity={0.8}
            >
              {pack.popular && (
                <View className="bg-emerald-600 px-2 py-0.5 rounded-full mb-1.5">
                  <Text className="text-[8.5px] font-black text-white uppercase tracking-wide">Best Value</Text>
                </View>
              )}
              <Ionicons name="logo-whatsapp" size={22} color="#059669" />
              <Text className="text-base font-black text-slate-900 dark:text-slate-50 mt-1">
                {pack.alerts}
              </Text>
              <Text className="text-[10px] font-bold text-slate-400">
                Alerts
              </Text>
              <Text className="text-sm font-black text-emerald-600 mt-1">
                ₹{pack.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* UPI QR PAYMENT MODAL */}
      <Modal
        visible={payModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPayModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Instant UPI Activation
                </Text>
                <Text className="text-xs text-slate-400 font-medium mt-0.5">
                  Item: {selectedPlan?.name || `${selectedPlan?.alerts} WhatsApp Credits`}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPayModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={17} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* QR Code Container */}
              <View className="items-center py-2">
                <View className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 items-center">
                  <Ionicons name="qr-code" size={140} color="#0284C7" />
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-50 mt-2">
                    UPI ID: nextwater@icici
                  </Text>
                  <Text className="text-xs text-slate-400 font-medium mt-0.5">
                    Pay {formatCurrency(selectedPlan?.price || 0)} via any UPI App (GPay / PhonePe / Paytm)
                  </Text>
                </View>
              </View>

              <View className="my-2.5">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Enter UPI Transaction UTR / Ref No.
                </Text>
                <TextInput
                  placeholder="e.g. 408271829102"
                  placeholderTextColor="#94A3B8"
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100"
                />
              </View>

              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => setPayModalVisible(false)}
                  className="flex-1 h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmRecharge}
                  disabled={activating}
                  className="flex-1 h-11 rounded-xl overflow-hidden shadow-sm shadow-sky-600/20"
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0284C7', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full flex-row items-center justify-center gap-1.5"
                  >
                    {activating ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                        <Text className="text-xs font-black text-white">Confirm & Activate</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
