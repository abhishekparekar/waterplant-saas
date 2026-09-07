import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  useColorScheme, 
  Alert, 
  Modal, 
  ScrollView, 
  Platform, 
  Linking, 
  StyleSheet 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { signOut, setUser, user } = useAuthStore();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Super Admin Logout',
      'Do you want to log out of the Super Admin Master Console?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            setSidebarVisible(false);
            await signOut();
            router.replace(ROUTES.LOGIN);
          }
        }
      ]
    );
  };

  const handleSwitchMode = (targetRole: 'owner' | 'helper' | 'customer') => {
    Alert.alert(
      'Switch Preview Mode',
      `Preview platform interface as ${targetRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch Now',
          onPress: () => {
            setSidebarVisible(false);
            if (user) {
              setUser({ ...user, role: targetRole });
            }
            if (targetRole === 'owner') router.replace(ROUTES.OWNER.DASHBOARD);
            else if (targetRole === 'helper') router.replace(ROUTES.HELPER.DASHBOARD);
            else if (targetRole === 'customer') router.replace(ROUTES.CUSTOMER.DASHBOARD);
          }
        }
      ]
    );
  };

  // Top App Bar Left
  const renderHeaderLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
      {/* ☰ Hamburger Drawer Trigger Button */}
      <TouchableOpacity 
        onPress={() => setSidebarVisible(true)}
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1.2,
          borderColor: isDark ? '#23355C' : '#BAE6FD',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 2,
          shadowColor: '#0284C7',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
        }}
      >
        <Ionicons name="menu" size={21} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>

      {/* Branded Logo Badge Frame */}
      <View style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: isDark ? '#23355C' : '#BAE6FD',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        padding: 3,
      }}>
        <Image 
          source={require('../../../assets/images/logo1_transparent.png')} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="contain"
        />
      </View>

      {/* Platform Name & Tagline */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text 
          style={{ 
            fontSize: 14.5, 
            fontWeight: '900', 
            color: isDark ? '#F8FAFC' : '#0F172A', 
            letterSpacing: -0.1,
            lineHeight: 18,
          }} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          NextWater SaaS Master
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4.5, marginTop: 1 }}>
          <View style={{ width: 5.5, height: 5.5, borderRadius: 3, backgroundColor: '#10B981' }} />
          <Text 
            style={{ 
              fontSize: 9.5, 
              fontWeight: '800', 
              color: isDark ? '#38BDF8' : '#0284C7', 
              letterSpacing: 0.2 
            }}
            numberOfLines={1}
          >
            SUPER ADMIN PLATFORM
          </Text>
        </View>
      </View>
    </View>
  );

  // Top App Bar Right
  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {/* Cloud Diagnostics */}
      <TouchableOpacity 
        onPress={() => Alert.alert('Cloud Diagnostics', 'All microservices & Firestore databases operating at 100% health.')}
        style={{
          width: 35,
          height: 35,
          borderRadius: 11,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1.2,
          borderColor: isDark ? '#23355C' : '#BAE6FD',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="notifications-outline" size={17} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>

      {/* Helpline Hotline */}
      <TouchableOpacity 
        onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
        style={{
          width: 35,
          height: 35,
          borderRadius: 11,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1.2,
          borderColor: isDark ? '#23355C' : '#BAE6FD',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="call-outline" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          headerBackground: () => (
            <LinearGradient
              colors={isDark ? ['#0B132B', '#111D42', '#0B132B'] : ['#FFFFFF', '#F8FAFC', '#F1F5F9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                StyleSheet.absoluteFill,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
                }
              ]}
            />
          ),
          tabBarBackground: () => (
            <LinearGradient
              colors={isDark ? ['#0B132B', '#111D42', '#0B132B'] : ['#FFFFFF', '#F8FAFC', '#F1F5F9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                StyleSheet.absoluteFill,
                {
                  borderTopWidth: 1,
                  borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
                }
              ]}
            />
          ),
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 6,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 6,
          },
          tabBarActiveTintColor: isDark ? '#38BDF8' : '#0284C7',
          tabBarInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
          tabBarLabelStyle: {
            fontSize: 10.5,
            fontWeight: '800',
            marginTop: 2,
            letterSpacing: 0.1,
          },
          headerStyle: {
            backgroundColor: 'transparent',
            shadowColor: 'transparent',
            borderBottomWidth: 0,
            elevation: 2,
          },
          headerTitle: () => null,
          headerLeftContainerStyle: { flex: 1, paddingLeft: 10 },
          headerRightContainerStyle: { paddingRight: 10 },
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      >
        {/* 1. Plants */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'Plants',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "business" : "business-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 2. Plans */}
        <Tabs.Screen 
          name="plans" 
          options={{ 
            title: 'Plans',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "card" : "card-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 3. Reports */}
        <Tabs.Screen 
          name="reports" 
          options={{ 
            title: 'Reports',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "document-text" : "document-text-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* Hidden Analytics Screen (kept for backward deep link compatibility) */}
        <Tabs.Screen 
          name="analytics" 
          options={{ 
            href: null,
          }} 
        />

        {/* 4. Profile */}
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "person-circle" : "person-circle-outline"} 
                  size={24} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />
      </Tabs>

      {/* SIDEBAR DRAWER MODAL (MATCHING BUSINESS OWNER'S EXACT UI & UX DESIGN) */}
      <Modal
        visible={sidebarVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          {/* Drawer Content */}
          <View style={{
            width: '84%',
            maxWidth: 325,
            backgroundColor: isDark ? '#0B132B' : '#FFFFFF',
            height: '100%',
            borderTopRightRadius: 28,
            borderBottomRightRadius: 28,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 8, height: 0 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 25
          }}>
            {/* Header with Platform Branding & Profile Details with LinearGradient */}
            <LinearGradient
              colors={isDark ? ['#0F1E3D', '#0B132B'] : ['#E0F2FE', '#F0F9FF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ 
                paddingHorizontal: 16, 
                paddingTop: Platform.OS === 'android' ? 16 : Math.max(insets.top, 16), 
                paddingBottom: 14, 
                borderBottomWidth: 1, 
                borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
              }}
            >
              {/* Top Row: Branded Platform Logo, Name & Close Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, paddingRight: 6 }}>
                  {/* Platform Logo Badge Frame */}
                  <View style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: isDark ? '#23355C' : '#BAE6FD',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 3,
                    shadowColor: '#0284C7',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    padding: 3,
                  }}>
                    <Image 
                      source={require('../../../assets/images/logo1_transparent.png')} 
                      style={{ width: '100%', height: '100%' }} 
                      resizeMode="contain"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text 
                      style={{ 
                        fontSize: 15.5, 
                        fontWeight: '900', 
                        color: isDark ? '#F8FAFC' : '#0F172A', 
                        letterSpacing: -0.2 
                      }} 
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      NextWater SaaS Master
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Ionicons name="shield-checkmark" size={13} color="#0284C7" />
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: isDark ? '#38BDF8' : '#0284C7' }}>
                        {user?.displayName || 'Super Admin'}
                      </Text>
                      <View style={{ 
                        backgroundColor: isDark ? '#0284C725' : '#E0F2FE', 
                        paddingHorizontal: 6, 
                        paddingVertical: 1, 
                        borderRadius: 6, 
                        borderWidth: 0.5, 
                        borderColor: '#0284C750' 
                      }}>
                        <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#0284C7', textTransform: 'uppercase' }}>
                          Root
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Close Drawer Button */}
                <TouchableOpacity
                  onPress={() => setSidebarVisible(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color={isDark ? '#94A3B8' : '#475569'} />
                </TouchableOpacity>
              </View>

              {/* Compact Cloud Telemetry Status Banner */}
              <TouchableOpacity
                onPress={() => {
                  setSidebarVisible(false);
                  router.push('/(admin)/reports');
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isDark ? '#16223F' : '#FFFFFF',
                  borderRadius: 14,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#23355C' : '#BAE6FD',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 3,
                  marginBottom: 8,
                }}
              >
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981' }} />
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#10B981' }}>
                      Revenue Engine (100% Live)
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#64748B', marginTop: 1 }}>
                    SaaS Collections & Plant Ledger
                  </Text>
                </View>

                <LinearGradient
                  colors={['#0284C7', '#0EA5E9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ 
                    paddingHorizontal: 11, 
                    paddingVertical: 5, 
                    borderRadius: 9,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    Reports
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Quick Action Utility Chips */}
              <View style={{ flexDirection: 'row', gap: 7 }}>
                {/* 24/7 Helpline Hotline */}
                <TouchableOpacity
                  onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
                  activeOpacity={0.75}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    backgroundColor: isDark ? '#1E293B' : '#ECFDF5',
                    borderWidth: 1,
                    borderColor: isDark ? '#334155' : '#A7F3D0',
                    borderRadius: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons name="call" size={13} color="#10B981" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: isDark ? '#34D399' : '#059669' }}>
                    SaaS Helpline
                  </Text>
                </TouchableOpacity>

                {/* Cloud Diagnostics */}
                <TouchableOpacity
                  onPress={() => Alert.alert('Cloud Diagnostics', 'Firestore databases, Auth Engine, and Push Notifications all running normally.')}
                  activeOpacity={0.75}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    backgroundColor: isDark ? '#1E293B' : '#FEF3C7',
                    borderWidth: 1,
                    borderColor: isDark ? '#334155' : '#FDE68A',
                    borderRadius: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons name="pulse" size={13} color="#D97706" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: isDark ? '#FBBF24' : '#B45309' }}>
                    Cloud Health
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Nav Menu Items List (Same clean grouping as Business Owner) */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* SECTION 1: SAAS PLATFORM MANAGEMENT */}
              <Text style={{ 
                fontSize: 10, 
                fontWeight: '900', 
                color: isDark ? '#64748B' : '#94A3B8', 
                textTransform: 'uppercase', 
                letterSpacing: 1, 
                marginLeft: 8, 
                marginBottom: 6,
                marginTop: 4
              }}>
                Platform Management
              </Text>

              {/* Registered Plants */}
              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(admin)/dashboard'); }}
                style={[styles.menuItem, { backgroundColor: isDark ? '#16223F' : '#F0F9FF' }]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#0F172A' : '#E0F2FE' }]}>
                    <Ionicons name="business" size={17} color="#0284C7" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Registered Plants
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Subscription Tiers */}
              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(admin)/plans'); }}
                style={[styles.menuItem, { backgroundColor: isDark ? '#16223F' : '#F8FAFC' }]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#0F172A' : '#DCFCE7' }]}>
                    <Ionicons name="card" size={17} color="#10B981" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Subscription Tiers & Plans
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Platform Revenue & Reports */}
              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(admin)/reports'); }}
                style={[styles.menuItem, { backgroundColor: isDark ? '#16223F' : '#F8FAFC' }]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#0F172A' : '#E0F2FE' }]}>
                    <Ionicons name="document-text" size={17} color="#0284C7" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Platform Revenue & Reports
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Master Settings */}
              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(admin)/profile'); }}
                style={[styles.menuItem, { backgroundColor: isDark ? '#16223F' : '#F8FAFC' }]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#0F172A' : '#FEF3C7' }]}>
                    <Ionicons name="settings-sharp" size={17} color="#D97706" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Master Console Settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94A3B8'} />
              </TouchableOpacity>

              {/* SECTION 2: INSTANT PREVIEW & TESTING */}
              <Text style={{ 
                fontSize: 10, 
                fontWeight: '900', 
                color: isDark ? '#64748B' : '#94A3B8', 
                textTransform: 'uppercase', 
                letterSpacing: 1, 
                marginLeft: 8, 
                marginBottom: 6,
                marginTop: 14
              }}>
                Instant Preview & Mode Switch
              </Text>

              {/* Preview Owner */}
              <TouchableOpacity
                onPress={() => handleSwitchMode('owner')}
                style={[styles.menuItem, { backgroundColor: isDark ? '#16223F' : '#F8FAFC' }]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#0F172A' : '#E0F2FE' }]}>
                    <Ionicons name="business" size={17} color="#0284C7" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Preview Business Owner
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Preview Staff */}
              <TouchableOpacity
                onPress={() => handleSwitchMode('helper')}
                style={[styles.menuItem, { backgroundColor: isDark ? '#16223F' : '#F8FAFC' }]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#0F172A' : '#DCFCE7' }]}>
                    <Ionicons name="bicycle" size={17} color="#10B981" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Preview Staff / Driver
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Preview Customer */}
              <TouchableOpacity
                onPress={() => handleSwitchMode('customer')}
                style={[styles.menuItem, { backgroundColor: isDark ? '#16223F' : '#F8FAFC' }]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#0F172A' : '#FCE7F3' }]}>
                    <Ionicons name="water" size={17} color="#EC4899" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Preview Customer Portal
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94A3B8'} />
              </TouchableOpacity>
            </ScrollView>

            {/* Drawer Bottom Safe Log Out (Identical to Business Owner) */}
            <View style={{
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
              borderTopWidth: 1,
              borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
              backgroundColor: isDark ? '#0B132B' : '#FFFFFF',
            }}>
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: isDark ? '#31141B' : '#FFF1F2',
                  borderWidth: 1,
                  borderColor: isDark ? '#4C1D24' : '#FECDD3',
                  borderRadius: 14,
                  paddingVertical: 11,
                }}
              >
                <Ionicons name="log-out-outline" size={18} color="#E11D48" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#E11D48', letterSpacing: 0.2 }}>
                  Log Out Master Console
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Backdrop Tap to Dismiss */}
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setSidebarVisible(false)} 
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.4)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
});
