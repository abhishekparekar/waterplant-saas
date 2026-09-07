import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  Platform, 
  KeyboardAvoidingView,
  RefreshControl,
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '@/utils/invoiceUtils';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  clientLimit: string;
  driverLimit: string;
  features: string[];
  active: boolean;
  popular?: boolean;
}

const PLANS_CACHE_KEY = '@nextwater_saas_plans';

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Plant Plan',
    price: 499,
    interval: 'Monthly',
    clientLimit: 'Up to 50 Clients',
    driverLimit: '1 Delivery Driver',
    features: ['Daily Delivery Ledger', 'Basic Invoicing', 'Customer Portal', 'Bottle Ledger'],
    active: true,
  },
  {
    id: 'plan_growth',
    name: 'Growth Business Plan',
    price: 999,
    interval: 'Monthly',
    clientLimit: 'Up to 250 Clients',
    driverLimit: '3 Delivery Drivers',
    features: ['Automated Billing & UPI QR', 'Driver GPS Routes', 'WhatsApp Alerts', 'Full Inventory Ledger', 'Staff Route Add'],
    active: true,
    popular: true,
  },
  {
    id: 'plan_pro',
    name: 'Enterprise Pro Plant',
    price: 1999,
    interval: 'Monthly',
    clientLimit: 'Unlimited Clients',
    driverLimit: 'Unlimited Drivers',
    features: ['Full Multi-vehicle Dispatch', 'P&L Reports & Circular Gauges', 'Priority 24/7 Helpline', 'Custom Plant Branding', 'Staff Shift Tracking'],
    active: true,
  },
  {
    id: 'plan_annual',
    name: 'Annual Enterprise Plan',
    price: 9999,
    interval: 'Yearly (Save 50%)',
    clientLimit: 'Unlimited Clients',
    driverLimit: 'Unlimited Drivers',
    features: ['Dedicated Account Manager', 'Custom Android Build', 'Unlimited WhatsApp API', 'Direct Database Backup', 'Zero Downtime SLA'],
    active: true,
  }
];

export default function PlansScreen() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [interval, setInterval] = useState('Monthly');
  const [clientLimit, setClientLimit] = useState('');
  const [driverLimit, setDriverLimit] = useState('');
  const [featuresText, setFeaturesText] = useState('');

  const loadPlans = async () => {
    try {
      setLoading(true);
      // 1. Fetch from Firestore first
      const snap = await getDocs(collection(db, 'tenants', 'waterplant', 'saas_plans'));
      const firestorePlans: SubscriptionPlan[] = [];
      snap.forEach(d => {
        firestorePlans.push({ id: d.id, ...d.data() } as SubscriptionPlan);
      });

      if (firestorePlans.length > 0) {
        setPlans(firestorePlans);
        await AsyncStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(firestorePlans));
      } else {
        // Fallback to cache or defaults
        const cached = await AsyncStorage.getItem(PLANS_CACHE_KEY);
        if (cached) {
          setPlans(JSON.parse(cached));
        } else {
          setPlans(DEFAULT_PLANS);
          await AsyncStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(DEFAULT_PLANS));
          // Seed defaults to Firestore
          DEFAULT_PLANS.forEach(async p => {
            await setDoc(doc(db, 'tenants', 'waterplant', 'saas_plans', p.id), p, { merge: true });
          });
        }
      }
    } catch (e) {
      console.warn('Error loading plans from Firestore:', e);
      try {
        const cached = await AsyncStorage.getItem(PLANS_CACHE_KEY);
        if (cached) setPlans(JSON.parse(cached));
      } catch (ce) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenAddModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setName(plan.name);
      setPrice(plan.price.toString());
      setInterval(plan.interval);
      setClientLimit(plan.clientLimit);
      setDriverLimit(plan.driverLimit);
      setFeaturesText(plan.features.join('\n'));
    } else {
      setEditingPlan(null);
      setName('');
      setPrice('');
      setInterval('Monthly');
      setClientLimit('Up to 100 Clients');
      setDriverLimit('2 Drivers');
      setFeaturesText('Delivery Ledger\nInvoicing\nCustomer App');
    }
    setModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Required Fields', 'Please enter a plan name and price.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid plan price.');
      return;
    }

    const featureList = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    let planToSave: SubscriptionPlan;
    let updatedPlans: SubscriptionPlan[];

    if (editingPlan) {
      planToSave = {
        ...editingPlan,
        name: name.trim(),
        price: priceNum,
        interval: interval.trim() || 'Monthly',
        clientLimit: clientLimit.trim() || 'Unlimited',
        driverLimit: driverLimit.trim() || 'Unlimited',
        features: featureList.length > 0 ? featureList : editingPlan.features,
      };
      updatedPlans = plans.map(p => p.id === editingPlan.id ? planToSave : p);
    } else {
      planToSave = {
        id: `plan_${Date.now()}`,
        name: name.trim(),
        price: priceNum,
        interval: interval.trim() || 'Monthly',
        clientLimit: clientLimit.trim() || 'Unlimited',
        driverLimit: driverLimit.trim() || 'Unlimited',
        features: featureList.length > 0 ? featureList : ['Standard Access'],
        active: true,
      };
      updatedPlans = [...plans, planToSave];
    }

    setPlans(updatedPlans);
    await AsyncStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(updatedPlans));

    // Save to Firestore so Business Owners see it in Recharge / Upgrade!
    try {
      await setDoc(doc(db, 'tenants', 'waterplant', 'saas_plans', planToSave.id), planToSave, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore plan save note:', fsErr);
    }

    setModalVisible(false);
    Alert.alert('Success! 🎉', `Plan "${name}" has been saved and is now live for all Business Owners.`);
  };

  const handleTogglePlan = async (id: string) => {
    const updated = plans.map(p => p.id === id ? { ...p, active: !p.active } : p);
    setPlans(updated);
    await AsyncStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(updated));
    const target = updated.find(p => p.id === id);
    if (target) {
      try {
        await setDoc(doc(db, 'tenants', 'waterplant', 'saas_plans', id), target, { merge: true });
      } catch (e) {}
    }
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    Alert.alert(
      'Delete Subscription Plan?',
      `Are you sure you want to permanently delete "${plan.name}"? Business owners will no longer be able to select this tier.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Plan',
          style: 'destructive',
          onPress: async () => {
            const updated = plans.filter(p => p.id !== plan.id);
            setPlans(updated);
            await AsyncStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(updated));
            try {
              await deleteDoc(doc(db, 'tenants', 'waterplant', 'saas_plans', plan.id));
            } catch (e) {}
            if (editingPlan?.id === plan.id) setModalVisible(false);
            Alert.alert('Plan Deleted', `"${plan.name}" has been removed.`);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Subscription Tiers</Text>
          <Text style={styles.headerSub}>Manage plant pricing & feature limits</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleOpenAddModal()} 
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>+ Add Tier</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlans} colors={['#0284C7']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Banner */}
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerRow}>
            <View style={styles.bannerIconBox}>
              <Ionicons name="card" size={24} color="#38BDF8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>NextWater SaaS Tier Engine</Text>
              <Text style={styles.bannerText}>
                Active plans appear automatically in the Plant Owner's Recharge / Upgrade screen.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Plan Cards */}
        {plans.map((plan) => (
          <View key={plan.id} style={[styles.planCard, !plan.active && styles.planCardDisabled]}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.limitsRow}>
                  <View style={styles.limitTag}>
                    <Ionicons name="people" size={12} color="#0284C7" />
                    <Text style={styles.limitText}>{plan.clientLimit}</Text>
                  </View>
                  <View style={styles.limitTag}>
                    <Ionicons name="car" size={12} color="#10B981" />
                    <Text style={styles.limitText}>{plan.driverLimit}</Text>
                  </View>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.planPrice}>{formatCurrency(plan.price)}</Text>
                <Text style={styles.planInterval}>/{plan.interval}</Text>
              </View>
            </View>

            {/* Feature List */}
            <View style={styles.featureBox}>
              {plan.features.map((feat, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActions}>
              <TouchableOpacity 
                onPress={() => handleTogglePlan(plan.id)}
                style={[styles.toggleBtn, plan.active ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={plan.active ? "eye" : "eye-off"} 
                  size={14} 
                  color={plan.active ? "#0284C7" : "#64748B"} 
                />
                <Text style={[styles.toggleBtnText, { color: plan.active ? "#0284C7" : "#64748B" }]}>
                  {plan.active ? 'Active Tier' : 'Inactive'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity 
                  onPress={() => handleOpenAddModal(plan)}
                  style={styles.editBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={13} color="#0F172A" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleDeletePlan(plan)}
                  style={[styles.editBtn, { backgroundColor: '#FEE2E2' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={13} color="#DC2626" />
                  <Text style={[styles.editBtnText, { color: '#DC2626' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Plan Edit / Create Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="card" size={18} color="#0284C7" />
                </View>
                <Text style={styles.modalTitle}>
                  {editingPlan ? 'Edit Plan Tier' : 'New Plan Tier'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Plan Name</Text>
              <TextInput 
                value={name} 
                onChangeText={setName} 
                placeholder="e.g. Enterprise Pro" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Price (₹)</Text>
                  <TextInput 
                    value={price} 
                    onChangeText={setPrice} 
                    keyboardType="numeric" 
                    placeholder="e.g. 1499" 
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Billing Cycle</Text>
                  <TextInput 
                    value={interval} 
                    onChangeText={setInterval} 
                    placeholder="Monthly / Yearly" 
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput} 
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Client Limit</Text>
                  <TextInput 
                    value={clientLimit} 
                    onChangeText={setClientLimit} 
                    placeholder="e.g. Up to 500 Clients" 
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Driver Limit</Text>
                  <TextInput 
                    value={driverLimit} 
                    onChangeText={setDriverLimit} 
                    placeholder="e.g. 5 Drivers" 
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput} 
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Features (1 per line)</Text>
              <TextInput 
                value={featuresText} 
                onChangeText={setFeaturesText} 
                multiline 
                numberOfLines={4} 
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3" 
                placeholderTextColor="#94A3B8"
                style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]} 
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              {editingPlan && (
                <TouchableOpacity 
                  onPress={() => handleDeletePlan(editingPlan)} 
                  style={[styles.cancelBtn, { backgroundColor: '#FEE2E2' }]}
                >
                  <Text style={[styles.cancelBtnText, { color: '#DC2626', fontWeight: '800' }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSavePlan} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    elevation: 2,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  banner: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  bannerText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardDisabled: {
    opacity: 0.55,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  limitsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  limitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  limitText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0284C7',
  },
  planInterval: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  featureBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 7,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#E0F2FE',
  },
  toggleBtnInactive: {
    backgroundColor: '#F1F5F9',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
