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
  StyleSheet
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

        {/* 3. Center Elevated Floating Action (+) Button */}
        <Tabs.Screen 
          name="scan-action" 
          options={{ 
            title: '',
            tabBarIcon: () => (
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -14,
                shadowColor: '#0D9488',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 6,
                elevation: 8,
              }}>
                <LinearGradient
                  colors={['#0D9488', '#14B8A6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2.5,
                    borderColor: isDark ? '#0B132B' : '#FFFFFF',
                  }}
                >
                  <Ionicons name="bicycle" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push(ROUTES.HELPER.DASHBOARD);
            }
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

      {/* Modern Curved Sidebar Drawer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <View style={{
            width: '82%',
            maxWidth: 320,
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            height: '100%',
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            overflow: 'hidden',
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 16,
          }}>
            {/* Sidebar Header with LinearGradient Card */}
            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
                elevation: 3,
                shadowColor: '#0D9488',
                shadowOpacity: 0.2,
                shadowRadius: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#99F6E4',
                }}>
                  <Ionicons name="bicycle" size={24} color="#0D9488" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }} numberOfLines={1}>
                    {user?.displayName || 'Driver Staff'}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#CCFBF1' }} numberOfLines={1}>
                    {user?.businessName || 'Abhiraj Water Plant'}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 3,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignSelf: 'flex-start',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#A7F3D0' }} />
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase' }}>
                      On Duty • Logistics
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Sidebar Navigation Items */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 }}>
                Driver Operations
              </Text>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push(ROUTES.HELPER.DASHBOARD); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 6,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="bicycle" size={18} color="#0D9488" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Active Delivery Runs</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>View assigned drop stops</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push(ROUTES.HELPER.DELIVERIES); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 6,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="receipt" size={18} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Delivery History</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Completed drops & cash</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); router.push(ROUTES.HELPER.PROFILE); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  marginBottom: 6,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="person" size={18} color="#9333EA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A' }}>Staff Profile & Shift</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Vehicle & driver credentials</Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: isDark ? '#334155' : '#E2E8F0', marginVertical: 12 }} />

              <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 }}>
                Plant Emergency & Helpline
              </Text>

              <TouchableOpacity
                onPress={() => { setSidebarVisible(false); Linking.openURL('tel:8485877633').catch(() => {}); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: '#ECFDF5',
                  borderWidth: 1,
                  borderColor: '#A7F3D0',
                  marginBottom: 6,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={18} color="#059669" />
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
                  gap: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#15803D' }}>WhatsApp Plant Desk</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Logout Button in Rectangular Format */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                height: 40,
                borderRadius: 8,
                backgroundColor: '#FFF1F2',
                borderWidth: 1,
                borderColor: '#FECDD3',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 12,
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="power" size={16} color="#E11D48" />
              <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#E11D48' }}>
                End Shift & Log Out
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </>
  );
}

