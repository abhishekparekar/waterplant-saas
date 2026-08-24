import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useApp } from '../context/AppContext';

interface OwnerDashboardScreenProps {
  onNavigateTab: (tab: string) => void;
}

export const OwnerDashboardScreen: React.FC<OwnerDashboardScreenProps> = ({ onNavigateTab }) => {
  const { currentTenant, metrics, deliveries, switchRole } = useApp();

  const totalDel = deliveries.length;
  const completedDel = deliveries.filter(d => d.status === 'Delivered').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.plantName}>{currentTenant.name}</Text>
          <Text style={styles.plantSubtitle}>👑 Owner Operations Console</Text>
        </View>
        <TouchableOpacity
          style={styles.switchRoleBtn}
          onPress={() => switchRole('delivery')}
        >
          <Text style={styles.switchRoleText}>Switch to 🚚 Helper Mode</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { borderColor: '#0284c7' }]}>
          <Text style={styles.kpiLabel}>Today's Sales</Text>
          <Text style={styles.kpiValue}>₹{metrics.todaySales.toLocaleString('en-IN')}</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#22c55e' }]}>
          <Text style={styles.kpiLabel}>Collections</Text>
          <Text style={styles.kpiValue}>₹{metrics.todayCollections.toLocaleString('en-IN')}</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#f59e0b' }]}>
          <Text style={styles.kpiLabel}>Customer Dues</Text>
          <Text style={styles.kpiValue}>₹{metrics.totalOutstanding.toLocaleString('en-IN')}</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#818cf8' }]}>
          <Text style={styles.kpiLabel}>Deliveries</Text>
          <Text style={styles.kpiValue}>{completedDel} / {totalDel}</Text>
        </View>
      </View>

      {/* Bottle Intelligence Box (Solves Water Plant Problem #1: Lost Jars) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔄 Bottle Asset Intelligence</Text>
          <TouchableOpacity onPress={() => onNavigateTab('bottles')}>
            <Text style={styles.linkText}>View Ledger →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottleRow}>
          <View style={styles.bottleBox}>
            <Text style={styles.bottleNum}>{metrics.totalFilledStock}</Text>
            <Text style={styles.bottleLabel}>Filled at Plant</Text>
          </View>
          <View style={styles.bottleBox}>
            <Text style={[styles.bottleNum, { color: '#38bdf8' }]}>{metrics.totalEmptyStock}</Text>
            <Text style={styles.bottleLabel}>Empties at Plant</Text>
          </View>
          <View style={styles.bottleBox}>
            <Text style={[styles.bottleNum, { color: '#fbbf24' }]}>{metrics.totalBottlesWithCustomers}</Text>
            <Text style={styles.bottleLabel}>With Customers</Text>
          </View>
        </View>

        <View style={styles.totalAssetRow}>
          <Text style={styles.totalAssetText}>Total Plant Asset Pool:</Text>
          <Text style={styles.totalAssetNum}>
            {metrics.totalFilledStock + metrics.totalEmptyStock + metrics.totalBottlesWithCustomers} Jars
          </Text>
        </View>
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => onNavigateTab('customers')}
          >
            <Text style={styles.quickBtnText}>👥 Add Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => onNavigateTab('deliveries')}
          >
            <Text style={styles.quickBtnText}>🚚 Route Deliveries</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => onNavigateTab('subscription')}
          >
            <Text style={styles.quickBtnText}>💳 Renew Plan (1/6/12m)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => onNavigateTab('bottles')}
          >
            <Text style={styles.quickBtnText}>📦 Jar Ledger</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Active Route Deliveries */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚚 Today's Live Route Stops</Text>
          <TouchableOpacity onPress={() => onNavigateTab('deliveries')}>
            <Text style={styles.linkText}>Manage →</Text>
          </TouchableOpacity>
        </View>

        {deliveries.slice(0, 4).map(del => (
          <View key={del.id} style={styles.deliveryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.delCustName}>{del.customerName}</Text>
              <Text style={styles.delAddress} numberOfLines={1}>{del.customerAddress}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.delQty}>{del.orderedQuantity} Jars • ₹{del.amountToCollect}</Text>
              <Text style={[
                styles.delStatus,
                del.status === 'Delivered' && { color: '#22c55e' },
                del.status === 'In Transit' && { color: '#38bdf8' }
              ]}>
                {del.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 60, gap: 14 },
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
  plantName: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  plantSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  switchRoleBtn: {
    backgroundColor: '#082f49',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284c7'
  },
  switchRoleText: { color: '#38bdf8', fontSize: 11, fontWeight: 'bold' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4
  },
  kpiLabel: { color: '#94a3b8', fontSize: 11 },
  kpiValue: { color: '#f8fafc', fontSize: 18, fontWeight: '900', marginTop: 4 },
  sectionCard: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#f8fafc', fontSize: 14, fontWeight: 'bold' },
  linkText: { color: '#38bdf8', fontSize: 11, fontWeight: 'bold' },
  bottleRow: { flexDirection: 'row', gap: 8 },
  bottleBox: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  bottleNum: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  bottleLabel: { color: '#64748b', fontSize: 10, marginTop: 2, textAlign: 'center' },
  totalAssetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#082f49',
    padding: 8,
    borderRadius: 8
  },
  totalAssetText: { color: '#e0f2fe', fontSize: 11, fontWeight: 'bold' },
  totalAssetNum: { color: '#38bdf8', fontSize: 11, fontWeight: '900' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  quickBtnText: { color: '#f8fafc', fontSize: 11, fontWeight: 'bold' },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  delCustName: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' },
  delAddress: { color: '#64748b', fontSize: 10, marginTop: 2 },
  delQty: { color: '#cbd5e1', fontSize: 11, fontWeight: 'bold' },
  delStatus: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginTop: 2 }
});
