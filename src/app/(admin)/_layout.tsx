import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Image, useColorScheme, Alert, Modal, ScrollView, TouchableWithoutFeedback, Linking, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthStore();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Super Admin Logout',
      'Do you want to log out of the Super Admin SaaS platform?',
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
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1,
          borderColor: isDark ? '#23355C' : '#E0F2FE',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="menu" size={20} color={isDark ? '#38BDF8' : '#0284C7'} />
      </TouchableOpacity>

      <Image 
        source={require('../../../assets/images/logo1_transparent.png')} 
        style={{ width: 32, height: 32 }} 
        resizeMode="contain"
      />

      <View>
        <Text style={{ fontSize: 15, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: 0.1 }}>
          NextWater SaaS
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
          <Text style={{ fontSize: 9, fontWeight: '800', color: '#0284C7', letterSpacing: 0.5 }}>
            SUPER ADMIN PLATFORM
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 14, gap: 8 }}>
      <TouchableOpacity 
        onPress={() => Alert.alert('Platform Notifications', 'All cloud database microservices operating normally.')}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          paddingVertical: 5,
          borderRadius: 10,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1,
          borderColor: isDark ? '#23355C' : '#E0F2FE',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="notifications" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
        <Text style={{ fontSize: 7.5, fontWeight: '900', color: isDark ? '#94A3B8' : '#64748B', marginTop: 1, letterSpacing: 0.2 }}>Notify</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          paddingVertical: 5,
          borderRadius: 10,
          backgroundColor: isDark ? '#16223F' : '#F0F9FF',
          borderWidth: 1,
          borderColor: isDark ? '#23355C' : '#E0F2FE',
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="help-circle-outline" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
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
          headerTitle: '',
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      >
        {/* 1. Dashboard (Plants & Plans) */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'Plants Network',
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

        {/* 2. Super Admin Profile */}
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Admin Control',
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

      {/* Sidebar Drawer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ width: '80%', maxWidth: 320, backgroundColor: '#0F172A', height: '100%', padding: 20, paddingTop: insets.top + 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
              <Image source={require('../../../assets/images/logo1_transparent.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
              <View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                  Super Admin
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#38BDF8' }}>
                  icoded@gmail.com
                </Text>
              </View>
            </View>

            <ScrollView style={{ marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(admin)/dashboard'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="business" size={20} color="#38BDF8" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#F1F5F9' }}>Registered Plants</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(admin)/profile'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="person" size={20} color="#818CF8" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#F1F5F9' }}>Super Admin Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); Linking.openURL('tel:8485877633'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="call" size={20} color="#10B981" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#F1F5F9' }}>Helpline (8485877633)</Text>
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
