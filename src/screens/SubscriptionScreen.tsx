import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useApp } from '../context/AppContext';
import { SubscriptionPlan, SubscriptionDuration, PaymentMethod, SubscriptionRecord } from '../types';

export const SubscriptionScreen: React.FC = () => {
  const { currentTenant, renewSubscription, subscriptionHistory } = useApp();

  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(6);
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  // Checkout modal
  const [checkoutPlan, setCheckoutPlan] = useState<{ plan: SubscriptionPlan; name: string; price: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedRecord, setCompletedRecord] = useState<SubscriptionRecord | null>(null);

  const monthlyRates: Record<SubscriptionPlan, number> = {
    Starter: 1499,
    Growth: 3499,
    Business: 7999,
    Enterprise: 14999
  };

  const getPricing = (plan: SubscriptionPlan) => {
    const base = monthlyRates[plan] || 3499;
    const rawTotal = base * selectedDuration;
    let disc = 0;
    if (selectedDuration === 6) disc = 0.15;
    if (selectedDuration === 12) disc = 0.25;

    const discountAmount = Math.round(rawTotal * disc);
    const finalTotal = rawTotal - discountAmount;
    const effectiveMonthly = Math.round(finalTotal / selectedDuration);

    return { rawTotal, discountAmount, finalTotal, effectiveMonthly, discPct: disc * 100 };
  };

  const plans = [
    {
      plan: 'Starter' as SubscriptionPlan,
      name: 'Starter Plan',
      target: '1 Delivery Van / Small Plant',
      features: ['Up to 300 Customers', 'Daily Route Sheet', 'Jar Ledger', 'Basic Stock Inventory']
    },
    {
      plan: 'Growth' as SubscriptionPlan,
      name: 'Growth Plan',
      popular: true,
      target: '2–6 Vans / Growing Plant',
      features: ['Unlimited Customers & Orders', 'Recurring Subscriptions', 'Driver Mobile App + Offline Sync', 'RO Batch Logs & TDS Purity', 'UPI QR & WhatsApp Invoice']
    },
    {
      plan: 'Business' as SubscriptionPlan,
      name: 'Business Plant',
      target: '7–20 Vans / Large Bottling',
      features: ['Multi-Route GPS Tracking', 'Owner & Helper Role Permissions', 'Full Audit Trail & Day Closing', 'Raw Material (Caps/Labels) Ledger', '24/7 Priority Support']
    },
    {
      plan: 'Enterprise' as SubscriptionPlan,
      name: 'Enterprise Hub',
      target: 'Multi-Branch Chains',
      features: ['Multi-Branch Plant Federation', 'Dedicated Firestore Instance', 'IoT Flow Meter Sensors', 'Custom SLA & Onboarding']
    }
  ];

  const handleOpenCheckout = (plan: SubscriptionPlan, name: string) => {
    const p = getPricing(plan);
    setCheckoutPlan({ plan, name, price: p.finalTotal });
    setCompletedRecord(null);
    setPaymentRef(`UPI-APW-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmPayment = () => {
    if (!checkoutPlan) return;
    setIsProcessing(true);
    setTimeout(() => {
      const res = renewSubscription(checkoutPlan.plan, selectedDuration, paymentMethod, paymentRef);
      setIsProcessing(false);
      if (res.success) {
        setCompletedRecord(res.record);
      }
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>✨ SaaS Subscription Plans</Text>
        <Text style={styles.bannerSubtitle}>
          Choose 1, 6 or 12 month billing cycle for {currentTenant.name}
        </Text>
        <View style={styles.activePlanBadge}>
          <Text style={styles.activePlanText}>
            Current Plan: <Text style={{ fontWeight: '900', color: '#38bdf8' }}>{currentTenant.plan}</Text> ({currentTenant.trialDaysLeft > 0 ? `${currentTenant.trialDaysLeft}d Trial` : 'Active'})
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'plans' && styles.tabButtonActive]}
          onPress={() => setActiveTab('plans')}
        >
          <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>⚡ Plans & Pricing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            📜 Invoices ({subscriptionHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'plans' ? (
        <View style={styles.plansSection}>
          {/* Duration Selector */}
          <View style={styles.durationSelector}>
            <Text style={styles.durationLabel}>Billing Duration:</Text>
            <View style={styles.durationButtons}>
              <TouchableOpacity
                style={[styles.durBtn, selectedDuration === 1 && styles.durBtnActive]}
                onPress={() => setSelectedDuration(1)}
              >
                <Text style={[styles.durBtnText, selectedDuration === 1 && styles.durBtnTextActive]}>1 Month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.durBtn, selectedDuration === 6 && styles.durBtnActiveHighlight]}
                onPress={() => setSelectedDuration(6)}
              >
                <Text style={[styles.durBtnText, selectedDuration === 6 && styles.durBtnTextActive]}>6 Mo (15% OFF)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.durBtn, selectedDuration === 12 && styles.durBtnActiveGold]}
                onPress={() => setSelectedDuration(12)}
              >
                <Text style={[styles.durBtnText, selectedDuration === 12 && { color: '#020617', fontWeight: '900' }]}>
                  12 Mo (25% OFF) 🔥
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plan Cards */}
          {plans.map(item => {
            const pricing = getPricing(item.plan);
            const isCurrent = currentTenant.plan === item.plan;

            return (
              <View
                key={item.plan}
                style={[
                  styles.planCard,
                  item.popular && styles.planCardPopular,
                  isCurrent && styles.planCardCurrent
                ]}
              >
                {item.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>⭐ MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{item.name}</Text>
                    <Text style={styles.planTarget}>{item.target}</Text>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentPill}>
                      <Text style={styles.currentPillText}>Active</Text>
                    </View>
                  )}
                </View>

                {/* Pricing Box */}
                <View style={styles.priceBox}>
                  <Text style={styles.priceAmount}>₹{pricing.finalTotal.toLocaleString('en-IN')}</Text>
                  <Text style={styles.pricePeriod}>/ {selectedDuration} Month{selectedDuration > 1 ? 's' : ''}</Text>
                  {selectedDuration > 1 && (
                    <Text style={styles.savingsText}>Save ₹{pricing.discountAmount.toLocaleString('en-IN')} ({pricing.discPct}% OFF)</Text>
                  )}
                </View>

                {/* Features */}
                <View style={styles.featureList}>
                  {item.features.map((feat, idx) => (
                    <Text key={idx} style={styles.featureItem}>
                      ✓ {feat}
                    </Text>
                  ))}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[styles.actionBtn, item.popular && styles.actionBtnPopular]}
                  onPress={() => handleOpenCheckout(item.plan, item.name)}
                >
                  <Text style={styles.actionBtnText}>
                    {isCurrent ? `Renew for ${selectedDuration} Month(s)` : `Upgrade to ${item.name}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : (
        /* History Section */
        <View style={styles.historySection}>
          {subscriptionHistory.map(sub => (
            <View key={sub.id} style={styles.historyCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.historyInvoice}>{sub.invoiceNumber}</Text>
                <Text style={styles.historyStatus}>{sub.status}</Text>
              </View>
              <Text style={styles.historyPlan}>{sub.plan} Plan • {sub.durationMonths} Month(s)</Text>
              <Text style={styles.historyDates}>Valid: {sub.startDate} to {sub.expiryDate}</Text>
              <View style={styles.historyFooter}>
                <Text style={styles.historyAmount}>₹{sub.amountPaid.toLocaleString('en-IN')}</Text>
                <Text style={styles.historyMethod}>{sub.paymentMethod} • {sub.paymentReference}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Checkout Modal */}
      {checkoutPlan && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {completedRecord ? (
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 40 }}>🎉</Text>
                  <Text style={styles.modalSuccessTitle}>Subscription Active!</Text>
                  <Text style={styles.modalSuccessSubtitle}>
                    {completedRecord.plan} Plan activated for {completedRecord.durationMonths} Month(s)
                  </Text>

                  <View style={styles.receiptBox}>
                    <Text style={styles.receiptLine}>Invoice: <Text style={{ fontWeight: 'bold' }}>{completedRecord.invoiceNumber}</Text></Text>
                    <Text style={styles.receiptLine}>Amount Paid: <Text style={{ fontWeight: 'bold', color: '#22c55e' }}>₹{completedRecord.amountPaid}</Text></Text>
                    <Text style={styles.receiptLine}>Valid Until: <Text style={{ fontWeight: 'bold' }}>{completedRecord.expiryDate}</Text></Text>
                    <Text style={styles.receiptLine}>Ref ID: <Text style={{ fontFamily: 'monospace' }}>{completedRecord.paymentReference}</Text></Text>
                  </View>

                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => {
                      setCheckoutPlan(null);
                      setCompletedRecord(null);
                    }}
                  >
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Checkout & Activate</Text>
                    <TouchableOpacity onPress={() => setCheckoutPlan(null)}>
                      <Text style={{ color: '#94a3b8', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.checkoutTotalBox}>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>Payable Total ({selectedDuration} Mo):</Text>
                    <Text style={styles.checkoutTotalAmount}>₹{checkoutPlan.price.toLocaleString('en-IN')}</Text>
                  </View>

                  <Text style={styles.inputLabel}>Select Payment Method:</Text>
                  <View style={styles.methodRow}>
                    {(['UPI', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.methodBtn, paymentMethod === m && styles.methodBtnActive]}
                        onPress={() => setPaymentMethod(m)}
                      >
                        <Text style={[styles.methodBtnText, paymentMethod === m && styles.methodBtnTextActive]}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Transaction Reference ID:</Text>
                  <TextInput
                    style={styles.input}
                    value={paymentRef}
                    onChangeText={setPaymentRef}
                    placeholder="e.g. UPI-APW-992019"
                    placeholderTextColor="#64748b"
                  />

                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={handleConfirmPayment}
                    disabled={isProcessing}
                  >
                    <Text style={styles.payBtnText}>
                      {isProcessing ? 'Processing Payment...' : `Confirm & Pay ₹${checkoutPlan.price.toLocaleString('en-IN')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 60 },
  banner: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16
  },
  bannerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  bannerSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  activePlanBadge: {
    backgroundColor: '#082f49',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#0284c7'
  },
  activePlanText: { color: '#e0f2fe', fontSize: 12 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  tabButtonActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  tabTextActive: { color: '#ffffff' },
  plansSection: { gap: 16 },
  durationSelector: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  durationLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  durationButtons: { flexDirection: 'row', gap: 6 },
  durBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center'
  },
  durBtnActive: { backgroundColor: '#334155', borderWidth: 1, borderColor: '#64748b' },
  durBtnActiveHighlight: { backgroundColor: '#4f46e5', borderWidth: 1, borderColor: '#818cf8' },
  durBtnActiveGold: { backgroundColor: '#f59e0b', borderWidth: 1, borderColor: '#fbbf24' },
  durBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  durBtnTextActive: { color: '#ffffff' },
  planCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative'
  },
  planCardPopular: { borderColor: '#6366f1', borderWidth: 2 },
  planCardCurrent: { borderColor: '#0284c7' },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  popularBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  planTarget: { color: '#64748b', fontSize: 11, marginTop: 2 },
  currentPill: { backgroundColor: '#082f49', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  currentPillText: { color: '#38bdf8', fontSize: 10, fontWeight: 'bold' },
  priceBox: {
    backgroundColor: '#020617',
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  priceAmount: { color: '#f8fafc', fontSize: 22, fontWeight: '900' },
  pricePeriod: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  savingsText: { color: '#22c55e', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  featureList: { gap: 6, marginBottom: 16 },
  featureItem: { color: '#cbd5e1', fontSize: 12 },
  actionBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  actionBtnPopular: { backgroundColor: '#4f46e5' },
  actionBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  historySection: { gap: 10 },
  historyCard: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 4
  },
  historyInvoice: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  historyStatus: { color: '#22c55e', fontSize: 11, fontWeight: 'bold' },
  historyPlan: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold' },
  historyDates: { color: '#64748b', fontSize: 11 },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 6 },
  historyAmount: { color: '#f8fafc', fontSize: 14, fontWeight: '900' },
  historyMethod: { color: '#94a3b8', fontSize: 11 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  checkoutTotalBox: {
    backgroundColor: '#020617',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  checkoutTotalAmount: { color: '#f8fafc', fontSize: 24, fontWeight: '900', marginTop: 2 },
  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  methodRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#020617',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  methodBtnActive: { borderColor: '#0284c7', backgroundColor: '#082f49' },
  methodBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  methodBtnTextActive: { color: '#38bdf8' },
  input: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16
  },
  payBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  payBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  modalSuccessTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '900', marginTop: 8 },
  modalSuccessSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  receiptBox: {
    backgroundColor: '#020617',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginVertical: 14,
    gap: 6
  },
  receiptLine: { color: '#cbd5e1', fontSize: 12 },
  doneBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  doneBtnText: { color: '#020617', fontSize: 13, fontWeight: '900' }
});
