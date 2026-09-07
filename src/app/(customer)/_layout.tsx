import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  Image, 
  Linking, 
  Alert, 
  Modal, 
  ScrollView, 
  TouchableWithoutFeedback,
  useColorScheme,
  StyleSheet,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export default function CustomerLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your water customer account?', [
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
    ]);
  };

  // Top App Bar Left: ☰ Hamburger + Branded Logo + Plant Business Name
  const renderHeaderLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingLeft: 6 }}>
      {/* ☰ Hamburger Drawer Trigger Button */}
      <TouchableOpacity 
        onPress={() => setSidebarVisible(true)}
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1.2,
          borderColor: isDark ? '#23355C' : '#BAE6FD',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="menu" size={20} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>

      {/* Branded Logo Badge Frame */}
      <View style={{
        width: 38,
        height: 38,
        borderRadius: 10,
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

      {/* Business Name (Always shows connected plant business name) */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text 
          style={{ 
            fontSize: 14.5, 
            fontWeight: '900', 
            color: isDark ? '#F8FAFC' : '#0F172A', 
            letterSpacing: 0.1 
          }} 
          numberOfLines={1}
        >
          {user?.businessName || 'Abhiraj Water Plant'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
          <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#0284C7', letterSpacing: 0.3 }} numberOfLines={1}>
            Customer Portal & Delivery
          </Text>
        </View>
      </View>
    </View>
  );

  // Top App Bar Right (Notify, QR Scanner, Support Helpline)
  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 6 }}>
      <TouchableOpacity 
        onPress={() => Alert.alert('Notifications', 'Your water deliveries are active and on schedule!')}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1,
          borderColor: isDark ? '#23355C' : '#BAE6FD',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="notifications" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Alert.alert('Customer QR Code', 'Show this digital jar pass to your route driver during drop-off.')}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1,
          borderColor: isDark ? '#23355C' : '#BAE6FD',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="qr-code-outline" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1,
          borderColor: isDark ? '#23355C' : '#BAE6FD',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="help-circle-outline" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
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
            elevation: 8,
          },
          tabBarActiveTintColor: '#0284C7',
          tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '800',
            marginTop: 2,
            letterSpacing: 0.2,
          },
          headerTitle: () => null,
          headerLeftContainerStyle: { flex: 1, paddingLeft: 10 },
          headerRightContainerStyle: { paddingRight: 10 },
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      >
        {/* 1. Dashboard / Jars */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'My Jars',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "water" : "water-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 2. History */}
        <Tabs.Screen 
          name="history" 
          options={{ 
            title: 'History',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "receipt" : "receipt-outline"} 
                  size={22} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 3. Customer Profile / Account */}
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

      {/* Customer Modern Curved Sidebar Drawer */}
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
          }}>
            {/* Sidebar Top Header with LinearGradient */}
            <LinearGradient
              colors={isDark ? ['#111D42', '#0B132B'] : ['#F0F9FF', '#E0F2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 16,
                paddingTop: Platform.OS === 'android' ? 14 : Math.max(insets.top, 14),
                paddingBottom: 13,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
              }}
            >
              {/* Top Row: Branded Plant Logo + Business Name + Close Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, paddingRight: 6 }}>
                  {/* Plant Logo Badge Frame */}
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
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
                        fontSize: 15, 
                        fontWeight: '900', 
                        color: isDark ? '#F8FAFC' : '#0F172A', 
                        letterSpacing: -0.2 
                      }} 
                      numberOfLines={1}
                    >
                      {user?.businessName || 'Abhiraj Water Plant'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Ionicons name="shield-checkmark" size={13} color="#0284C7" />
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: isDark ? '#38BDF8' : '#0284C7' }} numberOfLines={1}>
                        {user?.displayName || 'Customer'}
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
                          Client
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
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color={isDark ? '#94A3B8' : '#475569'} />
                </TouchableOpacity>
              </View>

              {/* Status Banner */}
              <View
                style={{
                  backgroundColor: isDark ? '#16223F' : '#FFFFFF',
                  borderRadius: 10,
                  paddingVertical: 7,
                  paddingHorizontal: 11,
                  borderWidth: 1,
                  borderColor: isDark ? '#23355C' : '#BAE6FD',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                    <Text style={{ fontSize: 11, fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A' }}>
                      Active Water Consumer
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#64748B', marginTop: 1 }}>
                    Daily RO Jar Supply & Empty Tracker
                  </Text>
                </View>

                <View style={{
                  backgroundColor: '#0284C7',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}>
                  <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF' }}>Connected</Text>
                </View>
              </View>

              {/* Fast Action Chips */}
              <View style={{ flexDirection: 'row', gap: 7 }}>
                <TouchableOpacity
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/(customer)/dashboard');
                  }}
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
                    borderRadius: 9,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons name="water" size={13} color="#0284C7" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#0284C7' }}>
                    Order Jars
                  </Text>
                </TouchableOpacity>

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
                    borderRadius: 9,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons name="call" size={13} color="#059669" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#059669' }}>
                    Plant Helpline
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Customer Navigation List */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, paddingLeft: 6 }}>
                Customer Features
              </Text>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(customer)/dashboard'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#F0F9FF',
                  borderWidth: 1,
                  borderColor: isDark ? '#23355C' : '#BAE6FD',
                  marginBottom: 5,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#BAE6FD', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="water" size={17} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#0284C7' }}>Order 20L Water Jars</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Book fresh RO chilled jars</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#0284C7" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(customer)/dashboard'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 5,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="bicycle" size={17} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Live Delivery Tracker</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Track driver route & drop status</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(customer)/profile'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 5,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="cube" size={17} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Jar & Deposit Ledger</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>View bottles held & empty dues</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push('/(customer)/profile'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 5,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="person" size={17} color="#475569" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Delivery Address & Info</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Manage delivery destination</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
              </TouchableOpacity>

              <Text style={{ fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 6, paddingLeft: 6 }}>
                Direct Plant Help
              </Text>

              <TouchableOpacity
                onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
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
                  marginBottom: 5,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={16} color="#059669" />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#047857' }}>
                  Call Plant Desk (8485877633)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://wa.me/918485877633?text=Hello%20Plant%20Manager%2C%20customer%20water%20order%20inquiry').catch(() => {})}
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
                  marginBottom: 10,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#15803D' }}>
                  WhatsApp Plant Desk
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer: Log Out Button */}
            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: isDark ? '#1E293B' : '#E2E8F0' }}>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  height: 42,
                  borderRadius: 10,
                  overflow: 'hidden',
                  elevation: 2,
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                  }}
                >
                  <Ionicons name="power" size={16} color="#FFFFFF" />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    Log Out Customer Account
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={{ fontSize: 9.5, color: '#94A3B8', textAlign: 'center', marginTop: 6, fontWeight: '700' }}>
                {user?.businessName || 'Abhiraj Water Plant'} • Consumer App
              </Text>
            </View>
          </View>

          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </>
  );
}
