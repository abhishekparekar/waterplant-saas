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
import { Customer, CustomerType } from '../types';

export const CustomerScreen: React.FC = () => {
  const { customers, addCustomer } = useApp();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [price, setPrice] = useState<string>('35');
  const [customerType, setCustomerType] = useState<CustomerType>('Home');

  const handleSaveCustomer = () => {
    if (!name.trim() || !mobile.trim()) {
      Alert.alert('Required Fields', 'Please enter customer name and mobile number.');
      return;
    }

    addCustomer({
      name,
      mobile,
      customerType,
      address,
      city: 'Pune',
      pincode: '411045',
      defaultProductId: 'prod_20l_jar',
      defaultPrice: parseFloat(price) || 35,
      bottleDeposit: 150,
      creditLimit: 2000,
      paymentTerms: 'Weekly / Cash',
      status: 'Active'
    });

    setShowAddModal(false);
    setName('');
    setMobile('');
    setAddress('');
    Alert.alert('Customer Added', `${name} registered successfully.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>👥 Customer Management</Text>
          <Text style={styles.subtitle}>{customers.length} Registered Water Plant Accounts</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addBtnText}>+ Add Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <View style={styles.list}>
        {customers.map(cust => (
          <View key={cust.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.custName}>{cust.name}</Text>
                <Text style={styles.custMobile}>📞 {cust.mobile} • {cust.customerType}</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{cust.status}</Text>
              </View>
            </View>

            <Text style={styles.custAddress}>{cust.address}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Jar Holding:</Text>
                <Text style={[styles.statValue, { color: '#38bdf8' }]}>{cust.bottleBalance} Jars</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Unpaid Dues:</Text>
                <Text style={[styles.statValue, { color: cust.outstandingBalance > 0 ? '#ef4444' : '#22c55e' }]}>
                  ₹{cust.outstandingBalance}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Rate/Jar:</Text>
                <Text style={styles.statValue}>₹{cust.defaultPrice}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Add Customer Modal */}
      {showAddModal && (
        <Modal transparent animationType="slide" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Register New Customer</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={{ color: '#94a3b8', fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Customer Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rajesh Patil"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Mobile Number:</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="e.g. 9876543210"
                placeholderTextColor="#64748b"
                value={mobile}
                onChangeText={setMobile}
              />

              <Text style={styles.label}>Delivery Address:</Text>
              <TextInput
                style={styles.input}
                placeholder="Flat / Shop No, Street, Landmark"
                placeholderTextColor="#64748b"
                value={address}
                onChangeText={setAddress}
              />

              <Text style={styles.label}>Agreed Rate per 20L Jar (₹):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveCustomer}
              >
                <Text style={styles.saveBtnText}>Save & Create Customer</Text>
              </TouchableOpacity>
            </View>
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
  addBtn: { backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  list: { gap: 10 },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8
  },
  custName: { color: '#f8fafc', fontSize: 15, fontWeight: '900' },
  custMobile: { color: '#64748b', fontSize: 11, marginTop: 2 },
  typeBadge: { backgroundColor: '#082f49', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { color: '#38bdf8', fontSize: 10, fontWeight: 'bold' },
  custAddress: { color: '#94a3b8', fontSize: 11 },
  statsRow: { flexDirection: 'row', gap: 6, backgroundColor: '#020617', padding: 8, borderRadius: 8 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 10 },
  statValue: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.85)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#0f172a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
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
  saveBtn: { backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' }
});
