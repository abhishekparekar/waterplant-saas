import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  useColorScheme, 
  TouchableOpacity, 
  Image, 
  View, 
  Text, 
  Platform, 
  Modal, 
  ScrollView, 
  Linking,
  Alert,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';

export default function OwnerLayout() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [generatedPin, setGeneratedPin] = useState('8492');

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of NextWater?', [
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

  const handleGeneratePin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(randomPin);
    setPinModalVisible(true);
  };

  // Top App Bar Left (☰ Hamburger + Plant Logo + Business Name + Tagline)
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

      {/* Business Name & Tagline (Never truncated artificially) */}
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
          {user?.businessName || 'Abhiraj Water Plant'}
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
            Water Plant Management
          </Text>
        </View>
      </View>
    </View>
  );

  // Top App Bar Right (Compact Icon Buttons: QR Scan, Notify, Help)
  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {/* QR Scan Button */}
      <TouchableOpacity 
        onPress={() => Alert.alert('QR Scanner', 'Scanner active for Customer Jar QR codes & delivery confirmation.')}
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
        <Ionicons name="qr-code-outline" size={17} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>

      {/* Notifications Button with Active Ping Badge */}
      <TouchableOpacity 
        onPress={() => router.push(ROUTES.OWNER.ORDERS)}
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
        <View style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 6.5,
          height: 6.5,
          borderRadius: 3.5,
          backgroundColor: '#E11D48',
          borderWidth: 1.2,
          borderColor: isDark ? '#16223F' : '#FFFFFF'
        }} />
      </TouchableOpacity>

      {/* Help Hotline Button */}
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

  const renderBackButton = (title?: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 10 }}>
      <TouchableOpacity 
        onPress={() => {
          try {
            router.replace('/(owner)/dashboard');
          } catch (e) {}
        }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1,
          borderColor: isDark ? '#23355C' : '#E0F2FE',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>
      {title ? (
        <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A', letterSpacing: 0.2 }}>
          {title}
        </Text>
      ) : null}
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
        {/* 1. Home (Menu & Dashboard) */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'Home',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "home" : "home-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 2. Orders */}
        <Tabs.Screen 
          name="orders" 
          options={{ 
            title: 'Orders',
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

        {/* 3. Center Elevated Floating Action (+) Button */}
        <Tabs.Screen 
          name="billing" 
          options={{ 
            title: '',
            tabBarIcon: () => (
              <View style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -16,
                shadowColor: '#0284C7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 6,
                elevation: 8,
              }}>
                <LinearGradient
                  colors={['#0284C7', '#0EA5E9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 3,
                    borderColor: isDark ? '#0B132B' : '#FFFFFF',
                  }}
                >
                  <Ionicons name="add" size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>
            ),
          }} 
        />

        {/* 4. Customers */}
        <Tabs.Screen 
          name="customers" 
          options={{ 
            title: 'Customers',
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 26 }}>
                <Ionicons 
                  name={focused ? "people" : "people-outline"} 
                  size={23} 
                  color={color} 
                />
              </View>
            ),
          }} 
        />

        {/* 5. Profile */}
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

        {/* Sub-screens */}
        <Tabs.Screen 
          name="deliveries" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Delivery Routes'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="inventory" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('20L Inventory'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="expenses" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Payment & Expense Entry'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="reports" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Reports & P&L'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="add-helper" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Staff Management'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="load-unload" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Truck Load / Unload'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="monthly-cards" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Digital Monthly Cards'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="event-orders" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Event & Bulk Bookings'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="transactions" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Financial Transactions'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="products-in-use" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Products in Use (Field Jars)'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="locate-live" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Live Driver Fleet GPS'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="recharge" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Plant Plan & Wallet'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="tutorials" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Help & Operations Guides'),
            headerRight: () => null
          }} 
        />
        <Tabs.Screen 
          name="plant-settings" 
          options={{ 
            href: null, 
            headerLeft: () => renderBackButton('Plant Master Settings'),
            headerRight: () => null
          }} 
        />
      </Tabs>      {/* SIDEBAR DRAWER MODAL (SEAMLESS PREMIUM ENTERPRISE DRAWER) */}
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
            {/* Header with Plant Branding & Profile Details with LinearGradient */}
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
              {/* Top Row: Branded Plant Logo, Name & Close Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, paddingRight: 6 }}>
                  {/* Plant Logo Badge Frame */}
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
                      {user?.businessName || 'Abhiraj Water Plant'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Ionicons name="shield-checkmark" size={13} color="#0284C7" />
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: isDark ? '#38BDF8' : '#0284C7' }}>
                        {user?.displayName || 'Abhishek'}
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
                          Owner
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

              {/* Compact Pro License Status Banner */}
              <TouchableOpacity
                onPress={() => {
                  setSidebarVisible(false);
                  router.push(ROUTES.OWNER.RECHARGE);
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
                      Pro Enterprise (Active)
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#64748B', marginTop: 1 }}>
                    Cloud Synced • Auto-Ledger Safe
                  </Text>
                </View>

                <LinearGradient
                  colors={['#0284C7', '#0EA5E9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ 
                    paddingHorizontal: 11, 
                    paddingVertical: 5, 
                    borderRadius: 9,
                    elevation: 2,
                    shadowColor: '#0284C7',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    Recharge
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Quick Action Owner Utility Chips */}
              <View style={{ flexDirection: 'row', gap: 7 }}>
                {/* Staff PIN Button */}
                <TouchableOpacity
                  onPress={() => {
                    setSidebarVisible(false);
                    handleGeneratePin();
                  }}
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
                  <Ionicons name="key" size={13} color="#D97706" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: isDark ? '#FBBF24' : '#B45309' }}>
                    Staff Auth PIN
                  </Text>
                </TouchableOpacity>

                {/* Helpline Button */}
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
                  <Ionicons name="call" size={13} color="#059669" />
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: isDark ? '#34D399' : '#047857' }}>
                    Plant Helpline
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Scrollable Grouped Menu List */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 10 }}>
              
              {/* SECTION 1: LOGISTICS & FLEET */}
              <View style={{ paddingTop: 8, paddingBottom: 2 }}>
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, paddingLeft: 6 }}>
                  Logistics & Fleet Dispatch
                </Text>

                {[
                  { label: 'Delivery Routes', icon: 'map-outline', color: '#0D9488', route: ROUTES.OWNER.DELIVERIES, badge: 'Live' },
                  { label: 'Truck Load / Unload', icon: 'bus-outline', color: '#EA580C', route: ROUTES.OWNER.LOAD_UNLOAD },
                  { label: 'Locate Live Fleet GPS', icon: 'navigate-circle-outline', color: '#0284C7', route: ROUTES.OWNER.LOCATE, badge: 'GPS' },
                  { label: 'Products in Field (Jars)', icon: 'albums-outline', color: '#D97706', route: ROUTES.OWNER.PRODUCTS_IN_USE },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      gap: 10,
                      marginBottom: 2.5
                    }}
                    onPress={() => {
                      setSidebarVisible(false);
                      router.push(item.route as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${item.color}16`, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name={item.icon as any} size={16.5} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#E2E8F0' : '#1E293B', flex: 1 }}>
                      {item.label}
                    </Text>
                    {item.badge ? (
                      <View style={{ backgroundColor: `${item.color}20`, paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 }}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: item.color }}>{item.badge}</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 1, backgroundColor: isDark ? '#1E293B' : '#F1F5F9', marginVertical: 4 }} />

              {/* SECTION 2: PLANT & OPERATIONS */}
              <View style={{ paddingVertical: 2 }}>
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, paddingLeft: 6 }}>
                  Plant Orders & Operations
                </Text>

                {[
                  { label: 'Customer Directory', icon: 'people-outline', color: '#0284C7', route: ROUTES.OWNER.CUSTOMERS },
                  { label: 'Monthly Punch Cards', icon: 'calendar-outline', color: '#0D9488', route: ROUTES.OWNER.MONTHLY_CARDS },
                  { label: 'Event & Bulk Orders', icon: 'gift-outline', color: '#E11D48', route: ROUTES.OWNER.EVENT_ORDERS },
                  { label: 'New Order Entry', icon: 'cart-outline', color: '#059669', route: ROUTES.ORDER.CREATE },
                  { label: 'Plant Inventory Catalog', icon: 'cube-outline', color: '#2563EB', route: ROUTES.OWNER.INVENTORY },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      gap: 10,
                      marginBottom: 2.5
                    }}
                    onPress={() => {
                      setSidebarVisible(false);
                      router.push(item.route as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${item.color}16`, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name={item.icon as any} size={16.5} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#E2E8F0' : '#1E293B', flex: 1 }}>
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 1, backgroundColor: isDark ? '#1E293B' : '#F1F5F9', marginVertical: 4 }} />

              {/* SECTION 3: FINANCE & ACCOUNTS */}
              <View style={{ paddingVertical: 2 }}>
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, paddingLeft: 6 }}>
                  Finance & Accounts
                </Text>

                {[
                  { label: 'Customer Billing & Dues', icon: 'receipt-outline', color: '#0284C7', route: ROUTES.OWNER.BILLING },
                  { label: 'Operating Costs & Expenses', icon: 'wallet-outline', color: '#E11D48', route: ROUTES.OWNER.EXPENSES },
                  { label: 'Financial Passbook', icon: 'calculator-outline', color: '#059669', route: ROUTES.OWNER.TRANSACTIONS },
                  { label: 'Business Reports & P&L', icon: 'stats-chart-outline', color: '#6366F1', route: ROUTES.OWNER.REPORTS },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      gap: 10,
                      marginBottom: 2.5
                    }}
                    onPress={() => {
                      setSidebarVisible(false);
                      router.push(item.route as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${item.color}16`, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name={item.icon as any} size={16.5} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#E2E8F0' : '#1E293B', flex: 1 }}>
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 1, backgroundColor: isDark ? '#1E293B' : '#F1F5F9', marginVertical: 4 }} />

              {/* SECTION 4: STAFF & ADMINISTRATION */}
              <View style={{ paddingVertical: 2 }}>
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, paddingLeft: 6 }}>
                  Staff & Administration
                </Text>

                {[
                  { label: 'Staff & Delivery Drivers', icon: 'bicycle-outline', color: '#EA580C', route: ROUTES.OWNER.STAFF },
                  { label: 'Plant Master Settings', icon: 'settings-outline', color: '#475569', route: ROUTES.OWNER.PLANT_SETTINGS },
                  { label: 'Help Tutorials & Guide', icon: 'play-circle-outline', color: '#0284C7', route: ROUTES.OWNER.TUTORIALS },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      gap: 10,
                      marginBottom: 2.5
                    }}
                    onPress={() => {
                      setSidebarVisible(false);
                      router.push(item.route as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${item.color}16`, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name={item.icon as any} size={16.5} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#E2E8F0' : '#1E293B', flex: 1 }}>
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#CBD5E1'} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer with LinearGradient Log Out Button */}
            <View style={{ 
              paddingHorizontal: 14, 
              paddingTop: 10, 
              paddingBottom: Platform.OS === 'android' ? 12 : Math.max(insets.bottom, 12), 
              borderTopWidth: 1, 
              borderTopColor: isDark ? '#1E293B' : '#F1F5F9',
              backgroundColor: isDark ? '#0F172A' : '#F8FAFC'
            }}>
              <TouchableOpacity 
                onPress={handleLogout}
                activeOpacity={0.85}
                style={{ 
                  borderRadius: 14,
                  overflow: 'hidden',
                  marginBottom: 6,
                  elevation: 3,
                  shadowColor: '#E11D48',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4
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
                    height: 44,
                    gap: 8,
                  }}
                >
                  <Ionicons name="power" size={17} color="#FFFFFF" />
                  <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 }}>
                    Log Out Account
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Ionicons name="lock-closed" size={10} color="#10B981" />
                <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#94A3B8', textAlign: 'center' }}>
                  NextWater Enterprise OS • v2.4 (Encrypted)
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

      {/* GENERATE AUTH PIN MODAL */}
      <Modal
        visible={pinModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 340, backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 10 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(217, 119, 6, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="key" size={26} color="#D97706" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A', textAlign: 'center' }}>
              Driver Quick Auth PIN
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              Provide this one-time PIN to your logistics helper to sign in without email password.
            </Text>

            <View style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderWidth: 2, borderColor: '#D97706', borderStyle: 'dashed', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, marginVertical: 20 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#D97706', letterSpacing: 8 }}>
                {generatedPin}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => setPinModalVisible(false)}
              style={{ 
                width: '100%', 
                height: 48, 
                backgroundColor: '#0284C7', 
                borderRadius: 14, 
                justifyContent: 'center', 
                alignItems: 'center',
                elevation: 3,
                shadowColor: '#0284C7',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFF' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
