import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useApp } from '../context/AppContext';

export const BottleLedgerScreen: React.FC = () => {
  const { bottleLedger, metrics } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 Bottle Movement & Asset Ledger</Text>
        <Text style={styles.subtitle}>Audit every filled and empty jar movement</Text>
      </View>

      {/* Asset Pool Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Live Bottle Distribution:</Text>
        <View style={styles.grid}>
          <View style={styles.box}>
            <Text style={styles.num}>{metrics.totalFilledStock}</Text>
            <Text style={styles.lbl}>Plant Filled</Text>
          </View>
          <View style={styles.box}>
            <Text style={[styles.num, { color: '#38bdf8' }]}>{metrics.totalEmptyStock}</Text>
            <Text style={styles.lbl}>Plant Empty</Text>
          </View>
          <View style={styles.box}>
            <Text style={[styles.num, { color: '#fbbf24' }]}>{metrics.totalBottlesWithCustomers}</Text>
            <Text style={styles.lbl}>With Customers</Text>
          </View>
        </View>
      </View>

      {/* Ledger History List */}
      <Text style={styles.sectionHeading}>📜 Recent Movements</Text>
      <View style={styles.list}>
        {bottleLedger.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.moveType}>{item.movementType}</Text>
              <Text style={[
                styles.qty,
                item.quantity > 0 ? { color: '#22c55e' } : { color: '#f59e0b' }
              ]}>
                {item.quantity > 0 ? `+${item.quantity}` : item.quantity} Jars
              </Text>
            </View>
            <Text style={styles.notes}>{item.notes}</Text>
            <View style={styles.footer}>
              <Text style={styles.cat}>{item.balanceCategory}</Text>
              <Text style={styles.time}>{item.timestamp?.split('T')[0]}</Text>
            </View>
          </View>
        ))}
      </View>
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
    borderColor: '#1e293b'
  },
  title: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  subtitle: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  summaryCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10
  },
  summaryTitle: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold' },
  grid: { flexDirection: 'row', gap: 6 },
  box: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  num: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  lbl: { color: '#64748b', fontSize: 10, marginTop: 2 },
  sectionHeading: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold', marginVertical: 4 },
  list: { gap: 8 },
  card: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 4
  },
  moveType: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold' },
  qty: { fontSize: 13, fontWeight: '900' },
  notes: { color: '#94a3b8', fontSize: 11 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 4, marginTop: 4 },
  cat: { color: '#38bdf8', fontSize: 10, fontWeight: 'bold' },
  time: { color: '#64748b', fontSize: 10 }
});
