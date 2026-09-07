import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  useColorScheme, 
  TouchableOpacity, 
  Image, 
  View, 
  Text, 
  Linking,
  Alert,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';

export default function HelperLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of NextWater Driver App?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setSidebarVisible(false);
          await authService.signOut();
          router.replace(ROUTES.LOGIN);
        }
      }
    ]);
  };

  // Top App Bar Left (☰ Hamburger + 38x38 Logo + Full Flex Plant Name)
  const renderHeaderLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
      <TouchableOpacity 
        onPress={() => setSidebarVisible(true)}
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: isDark ? '#132E2E' : '#F0FDFA',
          borderWidth: 1,
          borderColor: isDark ? '#134E4A' : '#CCFBF1',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="menu" size={20} color={isDark ? '#2DD4BF' : '#0D9488'} />
      </TouchableOpacity>

      <View style={{
        width: 38,
        height: 38,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#0D9488',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}>
        <Image 
          source={require('../../../assets/images/logo1_transparent.png')} 
          style={{ width: 28, height: 28 }} 
          resizeMode="contain"
        />
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text 
          style={{ 
            fontSize: 15, 
            fontWeight: '900', 
            color: isDark ? '#F8FAFC' : '#0F172A', 
            letterSpacing: 0.1,
          }} 
          numberOfLines={1}
        >
          {user?.businessName || 'Abhiraj Water Plant'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
          <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#0D9488', letterSpacing: 0.3 }} numberOfLines={1}>
            Logistics Fleet Staff
          </Text>
        </View>
      </View>
    </View>
  );

  // Top App Bar Right (Notify, QR Scan, Help)
  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <TouchableOpacity 
        onPress={() => Alert.alert('Notifications', 'No pending dispatch alerts.')}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: isDark ? '#132E2E' : '#F0FDFA',
          borderWidth: 1,
          borderColor: isDark ? '#134E4A' : '#CCFBF1',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="notifications" size={16} color={isDark ? '#2DD4BF' : '#0D9488'} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Alert.alert('QR Scanner', 'Scan Customer Jar QR to confirm delivery.')}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: isDark ? '#132E2E' : '#F0FDFA',
          borderWidth: 1,
          borderColor: isDark ? '#134E4A' : '#CCFBF1',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="qr-code-outline" size={16} color={isDark ? '#2DD4BF' : '#0D9488'} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: isDark ? '#132E2E' : '#F0FDFA',
          borderWidth: 1,
          borderColor: isDark ? '#134E4A' : '#CCFBF1',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="help-circle-outline" size={17} color={isDark ? '#2DD4BF' : '#0D9488'} />
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
          tabBarActiveTintColor: isDark ? '#2DD4BF' : '#0D9488',
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
        {/* 1. Home / Runs */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'Delivery Runs',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "bicycle" : "bicycle-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 2. Deliveries History */}
        <Tabs.Screen 
          name="deliveries" 
          options={{ 
            title: 'Drop History',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "receipt" : "receipt-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 3. + Add Client */}
        <Tabs.Screen 
          name="add-customer" 
          options={{ 
            title: '+ Add Client',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "person-add" : "person-add-outline"} 
                  size={22} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 4. Profile */}
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Driver Profile',
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

      {/* Modern Curved Sidebar Drawer with Owner-Styled Top Header */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <View style={{
            width: '82%',
            maxWidth: 330,
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            height: '100%',
            borderTopRightRadius: 28,
            borderBottomRightRadius: 28,
            overflow: 'hidden',
            paddingTop: Platform.OS === 'android' ? insets.top + 8 : insets.top,
          }}>
            {/* Sidebar Top Header with LinearGradient Card matching Owner Design */}
            <LinearGradient
              colors={isDark ? ['#111D42', '#0B132B'] : ['#F0FDFA', '#E6FFFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
              }}
            >
              {/* Top Row: Branded Plant Logo Frame + Business Name + Staff Name + Close Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, paddingRight: 6 }}>
                  {/* Plant Logo Badge Frame */}
                  <View style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: isDark ? '#134E4A' : '#99F6E4',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 3,
                    shadowColor: '#0D9488',
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
                      {user?.businessName || 'Abhiraj Water Plant'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Ionicons name="shield-checkmark" size={13} color="#0D9488" />
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: isDark ? '#2DD4BF' : '#0D9488' }} numberOfLines={1}>
                        {user?.displayName || 'Driver Staff'}
                      </Text>
                      <View style={{ 
                        backgroundColor: isDark ? '#0D948825' : '#CCFBF1', 
                        paddingHorizontal: 6, 
                        paddingVertical: 1, 
                        borderRadius: 6, 
                        borderWidth: 0.5, 
                        borderColor: '#0D948850' 
                      }}>
                        <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#0D9488', textTransform: 'uppercase' }}>
                          Staff
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

              {/* Compact Shift & Fleet Status Banner */}
              <View
                style={{
                  backgroundColor: isDark ? '#132E2E' : '#FFFFFF',
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#134E4A' : '#CCFBF1',
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
                      Shift Active • Ready for Route
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#64748B', marginTop: 1 }}>
                    Cloud Synced • Real-time Owner Ledger
                  </Text>
                </View>

                <View style={{
                  backgroundColor: '#0D9488',
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderRadius: 7,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF' }}>On Duty</Text>
                </View>
              </View>

              {/* Quick Action Utility Chips */}
              <View style={{ flexDirection: 'row', gap: 7 }}>
                {/* + Add Client Button */}
                <TouchableOpacity
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.HELPER.ADD_CUSTOMER);
                  }}
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
                  <Ionicons name="person-add" size={13} color="#059669" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: isDark ? '#34D399' : '#047857' }}>
                    + Add Client
                  </Text>
                </TouchableOpacity>

                {/* Plant Helpline Button */}
                <TouchableOpacity
                  onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
                  activeOpacity={0.75}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    backgroundColor: isDark ? '#1E293B' : '#E0F2FE',
                    borderWidth: 1,
                    borderColor: isDark ? '#334155' : '#BAE6FD',
                    borderRadius: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons name="call" size={13} color="#0284C7" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: isDark ? '#38BDF8' : '#0284C7' }}>
                    Plant Helpline
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Sidebar Navigation Items */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, paddingLeft: 6 }}>
                Staff Route Operations
              </Text>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push(ROUTES.HELPER.DASHBOARD); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 4,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="bicycle" size={17} color="#0D9488" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Active Delivery Runs</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>View assigned drop stops</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push(ROUTES.HELPER.DELIVERIES); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 4,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="receipt" size={17} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Delivery History</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Completed drops & cash</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push(ROUTES.HELPER.ADD_CUSTOMER); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#ECFDF5',
                  borderWidth: 1,
                  borderColor: isDark ? '#134E4A' : '#A7F3D0',
                  marginBottom: 4,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#A7F3D0', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="person-add" size={17} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#047857' }}>+ Register New Client</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#059669' }}>Add customer on route</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#059669" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push(ROUTES.HELPER.PROFILE); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 4,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="person" size={17} color="#9333EA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Staff Profile & Shift</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Vehicle & driver details</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: isDark ? '#1E293B' : '#E2E8F0', marginVertical: 8 }} />

              <Text style={{ fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, paddingLeft: 6 }}>
                Plant Emergency & Helpline
              </Text>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); Linking.openURL('tel:8485877633').catch(() => {}); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: '#ECFDF5',
                  borderWidth: 1,
                  borderColor: '#A7F3D0',
                  marginBottom: 4,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={16} color="#059669" />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#047857' }}>Call Plant Desk (8485877633)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSidebarVisible(false);
                  Linking.openURL(`https://wa.me/918485877633?text=Hi%20Plant%20Manager%2C%20driver%20update`).catch(() => {});
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  marginBottom: 4,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#15803D' }}>WhatsApp Plant Desk</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Logout Button in Rectangular Format matching Owner design */}
            <View style={{ 
              paddingHorizontal: 14, 
              paddingTop: 10, 
              paddingBottom: Platform.OS === 'android' ? 14 : Math.max(insets.bottom, 12), 
              borderTopWidth: 1, 
              borderTopColor: isDark ? '#1E293B' : '#F1F5F9',
              backgroundColor: isDark ? '#0F172A' : '#F8FAFC'
            }}>
              <TouchableOpacity 
                onPress={handleLogout}
                activeOpacity={0.85}
                style={{ 
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 6,
                  elevation: 3,
                  shadowColor: '#E11D48',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
              >
                <LinearGradient
                  colors={['#E11D48', '#BE123C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 42,
                    gap: 8,
                  }}
                >
                  <Ionicons name="power" size={17} color="#FFFFFF" />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 }}>
                    End Shift & Log Out
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Ionicons name="lock-closed" size={10} color="#10B981" />
                <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#94A3B8', textAlign: 'center' }}>
                  NextWater Fleet Logistics • v2.4 (Encrypted)
                </Text>
              </View>
            </View>
          </View>

          {/* Backdrop Touch to Close */}
          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </>
  );
}


