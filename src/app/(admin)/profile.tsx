import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { pickImageFromGallery } from '@/utils/imagePicker';
import { ROUTES } from '@/constants/routes';

export default function SuperAdminProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const router = useRouter();

  const [photoUploading, setPhotoUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || 'Super Administrator');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '8485877633');
  const [saving, setSaving] = useState(false);

  const handlePickGalleryPhoto = async () => {
    try {
      setPhotoUploading(true);
      const uri = await pickImageFromGallery();
      if (uri) {
        await updateProfile({ photoURL: uri });
        Alert.alert('Success', 'Super Admin profile photo updated from gallery!');
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e.message || 'Failed to update photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      Alert.alert('Profile Saved', 'Super Admin details saved successfully.');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Sign out of Super Admin Master Console?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace(ROUTES.LOGIN);
        }
      }
    ]);
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3.5 py-3" 
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Super Admin Profile Header with LinearGradient */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs mb-3">
        <LinearGradient
          colors={['#4F46E5', '#3730A3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-16 w-full"
        />
        <View className="items-center px-4 pb-4 -mt-8">
          <View className="relative mb-2">
            <View className="w-18 h-18 rounded-full bg-slate-900 justify-center items-center shadow-md overflow-hidden border-3 border-white dark:border-slate-800">
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text className="text-2xl font-black text-white">SA</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handlePickGalleryPhoto}
              disabled={photoUploading}
              className="absolute bottom-0 right-0 bg-indigo-700 w-6 h-6 rounded-full justify-center items-center border-2 border-white dark:border-slate-800 shadow-sm active:opacity-75"
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={11} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text className="text-[16px] font-black text-slate-900 dark:text-slate-50 text-center">
            {user?.displayName || 'Super Administrator'}
          </Text>

          <Text className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 text-center">
            icoded@gmail.com
          </Text>

          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 mt-2">
            <Ionicons name="shield-checkmark" size={12} color="#6366F1" />
            <Text className="text-[9.5px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              Root SaaS Super Admin Access
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Platform Information Section */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs mb-3">
        <View className="flex-row justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Master Console Information
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-md">
            <Text className="text-3xs font-black text-indigo-600">Edit Info</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 justify-center items-center">
            <Ionicons name="mail" size={14} color="#6366F1" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Root Email</Text>
            <Text className="text-[13.5px] font-black text-slate-800 dark:text-slate-100 mt-0.5">icoded@gmail.com</Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 justify-center items-center">
            <Ionicons name="call" size={14} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Helpline Hotline</Text>
            <Text className="text-[13.5px] font-black text-emerald-600 mt-0.5">{user?.phoneNumber || '8485877633'}</Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 justify-center items-center">
            <Ionicons name="server" size={14} color="#0284C7" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Database Node</Text>
            <Text className="text-[13.5px] font-black text-sky-600 mt-0.5">Google Cloud Firestore (Production)</Text>
          </View>
        </View>
      </View>

      {/* 3. Support & Hotline Contact */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs mb-4">
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50 uppercase tracking-wider">
          Helpline Contact Center
        </Text>

        <TouchableOpacity 
          onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
          className="bg-emerald-600 py-3 rounded-xl flex-row justify-center items-center gap-2 active:opacity-80 mb-2"
        >
          <Ionicons name="call" size={16} color="#FFF" />
          <Text className="text-xs font-black text-white">Call Support (8485877633)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Linking.openURL('https://wa.me/918485877633?text=SuperAdmin%20Support').catch(() => {})}
          className="bg-slate-800 py-3 rounded-xl flex-row justify-center items-center gap-2 active:opacity-80"
        >
          <Ionicons name="logo-whatsapp" size={16} color="#10B981" />
          <Text className="text-xs font-black text-white">WhatsApp Helpline</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity 
        onPress={handleSignOut}
        className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 h-11 rounded-xl flex-row justify-center items-center gap-2 active:opacity-75"
        activeOpacity={0.8}
      >
        <Ionicons name="power" size={16} color="#E11D48" />
        <Text className="text-xs font-black text-rose-600">Sign Out Super Admin</Text>
      </TouchableOpacity>

      {/* EDIT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                Edit Super Admin Details
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text className="text-3xs font-bold text-slate-400 uppercase mb-1">Display Name</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 mb-3"
              />

              <Text className="text-3xs font-bold text-slate-400 uppercase mb-1">Support Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 mb-4"
              />

              <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 items-center">
                  <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveProfile} className="flex-1 py-3 rounded-xl bg-indigo-600 items-center">
                  <Text className="text-xs font-black text-white">{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
