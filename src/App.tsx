import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { AppProvider, useApp } from './context/AppContext';
import { OwnerDashboardScreen } from './screens/OwnerDashboardScreen';
import { HelperDeliveryScreen } from './screens/HelperDeliveryScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { CustomerScreen } from './screens/CustomerScreen';
import { BottleLedgerScreen } from './screens/BottleLedgerScreen';

const MainNavigator: React.FC = () => {
  const { currentUser, switchRole, currentTenant } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return currentUser.role === 'delivery' ? (
          <HelperDeliveryScreen />
        ) : (
          <OwnerDashboardScreen onNavigateTab={setActiveTab} />
        );
      case 'deliveries':
        return <HelperDeliveryScreen />;
      case 'customers':
        return <CustomerScreen />;
      case 'subscription':
        return <SubscriptionScreen />;
      case 'bottles':
        return <BottleLedgerScreen />;
      default:
        return <OwnerDashboardScreen onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Top Universal App Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Text style={styles.logoIcon}>💧</Text>
          <View>
            <Text style={styles.brandTitle}>HydroSaaS Mobile</Text>
            <Text style={styles.plantNameText}>{currentTenant.name}</Text>
          </View>
        </View>

        {/* 1-Tap Role Toggle: Owner <-> Helper */}
        <TouchableOpacity
          style={[
            styles.rolePill,
            currentUser.role === 'owner' ? styles.rolePillOwner : styles.rolePillHelper
          ]}
          onPress={() => switchRole(currentUser.role === 'owner' ? 'delivery' : 'owner')}
        >
          <Text style={styles.rolePillText}>
            {currentUser.role === 'owner' ? '👑 Owner' : '🚚 Helper'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Screen Body */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation Tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.navLabelActive]}>
            {currentUser.role === 'delivery' ? 'My Route' : 'Dashboard'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('deliveries')}
        >
          <Text style={styles.navIcon}>🚚</Text>
          <Text style={[styles.navLabel, activeTab === 'deliveries' && styles.navLabelActive]}>
            Deliveries
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('customers')}
        >
          <Text style={styles.navIcon}>👥</Text>
          <Text style={[styles.navLabel, activeTab === 'customers' && styles.navLabelActive]}>
            Customers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('bottles')}
        >
          <Text style={styles.navIcon}>🔄</Text>
          <Text style={[styles.navLabel, activeTab === 'bottles' && styles.navLabelActive]}>
            Jars
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('subscription')}
        >
          <Text style={styles.navIcon}>✨</Text>
          <Text style={[styles.navLabel, activeTab === 'subscription' && styles.navLabelActive]}>
            Plans
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  topHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 24 },
  brandTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  plantNameText: { color: '#94a3b8', fontSize: 11 },
  rolePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  rolePillOwner: { backgroundColor: '#451a03', borderColor: '#d97706' },
  rolePillHelper: { backgroundColor: '#082f49', borderColor: '#0284c7' },
  rolePillText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  screenContainer: { flex: 1 },
  bottomNav: {
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 18 },
  navLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', marginTop: 2 },
  navLabelActive: { color: '#38bdf8', fontWeight: 'bold' }
});
