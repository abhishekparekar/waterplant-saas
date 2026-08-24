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
import { Delivery, PaymentMethod } from '../types';

export const HelperDeliveryScreen: React.FC = () => {
  const { deliveries, startDelivery, completeDelivery, recordFailedDelivery, switchRole } = useApp();

  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [deliveredQty, setDeliveredQty] = useState<string>('0');
  const [collectedBottles, setCollectedBottles] = useState<string>('0');
  const [collectedAmount, setCollectedAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending' || d.status === 'In Transit');
  const completedDeliveries = deliveries.filter(d => d.status === 'Delivered' || d.status === 'Partially Delivered' || d.status === 'Failed');

  const openCompletion = (del: Delivery) => {
    setActiveDelivery(del);
    setDeliveredQty(String(del.orderedQuantity));
    setCollectedBottles(String(del.expectedEmptyBottles || del.orderedQuantity));
    setCollectedAmount(String(del.amountToCollect));
    setPaymentMethod('Cash');
    setDeliveryNotes('');
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = () => {
    if (!activeDelivery) return;
    const res = completeDelivery(
      activeDelivery.id,
      parseInt(deliveredQty, 10) || 0,
      parseInt(collectedBottles, 10) || 0,
      parseFloat(collectedAmount) || 0,
      paymentMethod,
      `DEL-COLL-${Date.now().toString().slice(-4)}`,
      deliveryNotes
    );

    if (res.success) {
      setShowCompleteModal(false);
      setActiveDelivery(null);
      Alert.alert('✅ Delivery Recorded', res.message);
    } else {
      Alert.alert('⚠️ Validation Warning', res.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🚚 Delivery Driver Route</Text>
          <Text style={styles.subtitle}>
            {pendingDeliveries.length} Stops Pending • {completedDeliveries.length} Completed Today
          </Text>
        </View>
        <TouchableOpacity
          style={styles.switchRoleBtn}
          onPress={() => switchRole('owner')}
        >
          <Text style={styles.switchRoleText}>Switch to 👑 Owner</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Deliveries List */}
      <Text style={styles.sectionHeading}>📍 Today's Route Stops</Text>
      {pendingDeliveries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>🎉 All route deliveries completed for today!</Text>
        </View>
      ) : (
        pendingDeliveries.map((del, idx) => (
          <View key={del.id} style={styles.deliveryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.stopPill}>
                <Text style={styles.stopPillText}>Stop #{idx + 1}</Text>
              </View>
              <Text style={[styles.statusText, del.status === 'In Transit' && { color: '#38bdf8' }]}>
                {del.status}
              </Text>
            </View>

            <Text style={styles.custName}>{del.customerName}</Text>
            <Text style={styles.addressText}>{del.customerAddress}</Text>

            <View style={styles.orderSummary}>
              <Text style={styles.summaryText}>📦 Jars: <Text style={{ fontWeight: 'bold', color: '#f8fafc' }}>{del.orderedQuantity}</Text></Text>
              <Text style={styles.summaryText}>💰 Amount: <Text style={{ fontWeight: 'bold', color: '#22c55e' }}>₹{del.amountToCollect}</Text></Text>
              <Text style={styles.summaryText}>🔄 Return Exp: <Text style={{ fontWeight: 'bold', color: '#38bdf8' }}>{del.expectedEmptyBottles}</Text></Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              {del.status === 'Pending' ? (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => startDelivery(del.id)}
                >
                  <Text style={styles.startBtnText}>Start Delivery Route</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => openCompletion(del)}
                >
                  <Text style={styles.completeBtnText}>✓ Mark Delivered & Collect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}

      {/* Completed Deliveries */}
      {completedDeliveries.length > 0 && (
        <>
          <Text style={[styles.sectionHeading, { marginTop: 14 }]}>✓ Completed Today</Text>
          {completedDeliveries.map(del => (
            <View key={del.id} style={styles.completedCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.custName}>{del.customerName}</Text>
                <Text style={styles.completedDetail}>
                  Delivered {del.deliveredQuantity} • Collected {del.collectedEmptyBottles} Empties • ₹{del.collectedAmount}
                </Text>
              </View>
              <Text style={styles.completedBadge}>{del.status}</Text>
            </View>
          ))}
        </>
      )}

      {/* Completion Modal */}
      {showCompleteModal && activeDelivery && (
        <Modal transparent animationType="slide" visible={true}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Complete Delivery</Text>
                <TouchableOpacity onPress={() => setShowCompleteModal(false)}>
                  <Text style={{ color: '#94a3b8', fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalCust}>{activeDelivery.customerName}</Text>

              {/* Delivered Qty */}
              <Text style={styles.label}>1. Water Jars Delivered:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={deliveredQty}
                onChangeText={setDeliveredQty}
              />

              {/* Empties Collected */}
              <Text style={styles.label}>2. Empty Bottles Collected Back:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={collectedBottles}
                onChangeText={setCollectedBottles}
              />

              {/* Amount Collected */}
              <Text style={styles.label}>3. Amount Collected (₹):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={collectedAmount}
                onChangeText={setCollectedAmount}
              />

              {/* Payment Mode */}
              <Text style={styles.label}>4. Payment Method:</Text>
              <View style={styles.paymentRow}>
                {(['Cash', 'UPI', 'Bank Transfer'] as PaymentMethod[]).map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.payModeBtn, paymentMethod === m && styles.payModeBtnActive]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text style={[styles.payModeText, paymentMethod === m && { color: '#38bdf8' }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Delivery Notes */}
              <Text style={styles.label}>5. Notes / Proof (Optional):</Text>
              <TextInput
                style={styles.input}
                value={deliveryNotes}
                onChangeText={setDeliveryNotes}
                placeholder="e.g. Handed to security"
                placeholderTextColor="#64748b"
              />

              <TouchableOpacity
                style={styles.confirmSaveBtn}
                onPress={handleConfirmComplete}
              >
                <Text style={styles.confirmSaveText}>Confirm & Save Record</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 60, gap: 12 },
  header: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  subtitle: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  switchRoleBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  switchRoleText: { color: '#38bdf8', fontSize: 11, fontWeight: 'bold' },
  sectionHeading: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold', marginVertical: 4 },
  emptyCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#22c55e', fontSize: 13, fontWeight: 'bold' },
  deliveryCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stopPill: { backgroundColor: '#082f49', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stopPillText: { color: '#38bdf8', fontSize: 10, fontWeight: 'bold' },
  statusText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  custName: { color: '#f8fafc', fontSize: 15, fontWeight: '900' },
  addressText: { color: '#64748b', fontSize: 11 },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    padding: 8,
    borderRadius: 8
  },
  summaryText: { color: '#94a3b8', fontSize: 11 },
  actionRow: { marginTop: 4 },
  startBtn: { backgroundColor: '#0284c7', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  startBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  completeBtn: { backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  completeBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  completedCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  completedDetail: { color: '#64748b', fontSize: 11, marginTop: 2 },
  completedBadge: { color: '#22c55e', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.85)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#0f172a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  modalCust: { color: '#38bdf8', fontSize: 13, fontWeight: 'bold', marginVertical: 6 },
  label: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  paymentRow: { flexDirection: 'row', gap: 6 },
  payModeBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#020617', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  payModeBtnActive: { borderColor: '#0284c7', backgroundColor: '#082f49' },
  payModeText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  confirmSaveBtn: { backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  confirmSaveText: { color: '#ffffff', fontSize: 13, fontWeight: '900' }
});
