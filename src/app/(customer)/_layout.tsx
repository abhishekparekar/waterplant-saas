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
  StyleSheet
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
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
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

  // Top App Bar Left
  const renderHeaderLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 10 }}>
      <TouchableOpacity 
        onPress={() => setSidebarVisible(true)}
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
          borderWidth: 1,
          borderColor: isDark ? '#312E81' : '#E0E7FF',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="menu" size={20} color={isDark ? '#818CF8' : '#4F46E5'} />
      </TouchableOpacity>

      <Image 
        source={require('../../../assets/images/logo1_transparent.png')} 
        style={{ width: 30, height: 30 }} 
        resizeMode="contain"
      />

      <View style={{ maxWidth: 160 }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: 0.1 }} numberOfLines={1}>
          {user?.businessName || 'Abhiraj Water Plant'}
        </Text>
        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#4F46E5', letterSpacing: 0.3 }}>
          Customer Portal & Delivery
        </Text>
      </View>
    </View>
  );

  // Top App Bar Right
  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 14, gap: 8 }}>
      <TouchableOpacity 
        onPress={() => Alert.alert('Notifications', 'Your water deliveries are active and on track!')}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          paddingVertical: 5,
          borderRadius: 10,
          backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
          borderWidth: 1,
          borderColor: isDark ? '#312E81' : '#E0E7FF',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="notifications" size={16} color={isDark ? '#818CF8' : '#4F46E5'} />
        <Text style={{ fontSize: 7.5, fontWeight: '900', color: isDark ? '#94A3B8' : '#64748B', marginTop: 1, letterSpacing: 0.2 }}>Notify</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Alert.alert('Jar QR', 'Show this QR to delivery driver during jar drop-off.')}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          paddingVertical: 5,
          borderRadius: 10,
          backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
          borderWidth: 1,
          borderColor: isDark ? '#312E81' : '#E0E7FF',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="qr-code-outline" size={16} color={isDark ? '#818CF8' : '#4F46E5'} />
        <Text style={{ fontSize: 7.5, fontWeight: '900', color: isDark ? '#94A3B8' : '#64748B', marginTop: 1, letterSpacing: 0.2 }}>QR Scan</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          paddingVertical: 5,
          borderRadius: 10,
          backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
          borderWidth: 1,
          borderColor: isDark ? '#312E81' : '#E0E7FF',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="help-circle-outline" size={16} color={isDark ? '#818CF8' : '#4F46E5'} />
        <Text style={{ fontSize: 7.5, fontWeight: '900', color: isDark ? '#94A3B8' : '#64748B', marginTop: 1, letterSpacing: 0.2 }}>Help</Text>
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
          tabBarActiveTintColor: isDark ? '#818CF8' : '#4F46E5',
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
          headerTitle: '',
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      >
        {/* 1. Home */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'My Jars & Orders',
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

        {/* 2. Elevated Floating (+) Button */}
        <Tabs.Screen 
          name="order-fab" 
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
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 6,
                elevation: 8,
              }}>
                <LinearGradient
                  colors={['#4F46E5', '#6366F1']}
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
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push('/(customer)/dashboard');
            }
          }}
        />

        {/* 3. Customer Profile */}
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Account',
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

      {/* Customer Sidebar Drawer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ width: '80%', maxWidth: 320, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', height: '100%', padding: 20, paddingTop: insets.top + 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#E2E8F0' }}>
              <Image source={require('../../../assets/images/logo1_transparent.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
              <View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  {user?.displayName || 'Customer'}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>
                  Water Customer Account
                </Text>
              </View>
            </View>

            <ScrollView style={{ marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(customer)/dashboard'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="water" size={20} color="#0284C7" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' }}>Order Water Jars</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(customer)/profile'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="person" size={20} color="#4F46E5" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' }}>My Profile & Address</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); Linking.openURL('tel:8485877633'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="call" size={20} color="#10B981" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' }}>Plant Support (8485877633)</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, marginTop: 20 }}>
                <Ionicons name="power" size={20} color="#EF4444" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>Log Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </>
  );
}
