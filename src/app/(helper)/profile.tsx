import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Linking,
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { pickImageFromGallery } from '@/utils/imagePicker';

export default function HelperProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || 'Driver Staff');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '9822001122');
  const [address, setAddress] = useState(user?.address || 'Near Plant Staff Quarters');
  const [saving, setSaving] = useState(false);

  const handlePickGalleryPhoto = async () => {
    try {
      setPhotoUploading(true);
      const uri = await pickImageFromGallery();
      if (uri) {
        await updateProfile({ photoURL: uri });
        Alert.alert('Profile Photo Updated', 'Staff photo updated successfully!');
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e.message || 'Failed to update photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName || !phoneNumber) {
      Alert.alert('Validation Error', 'Name and Phone Number are required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
      Alert.alert('Profile Updated', 'Staff credentials saved successfully.');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Log Out', 'End helper delivery shift and log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
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
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3 py-2.5" 
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Helper Profile Card with LinearGradient */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs mb-2.5">
        <LinearGradient
          colors={['#0D9488', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-16 w-full"
        />
        <View className="items-center px-4 pb-4 -mt-8">
          <View className="relative mb-2">
            <View className="w-18 h-18 rounded-full bg-teal-600 justify-center items-center shadow-md overflow-hidden border-3 border-white dark:border-slate-800">
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text className="text-2xl font-black text-white">
                  {user?.displayName?.substring(0, 2).toUpperCase() || 'DR'}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handlePickGalleryPhoto}
              disabled={photoUploading}
              className="absolute bottom-0 right-0 bg-teal-700 w-6 h-6 rounded-full justify-center items-center border-2 border-white dark:border-slate-800 shadow-sm active:opacity-75"
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={11} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text className="text-[16px] font-black text-slate-900 dark:text-slate-50 text-center leading-tight">
            {user?.displayName || 'Driver Staff'}
          </Text>

          <Text className="text-[12px] font-bold text-teal-600 dark:text-teal-400 mt-0.5 text-center">
            {user?.businessName || 'Abhiraj Water Plant'} Logistics
          </Text>

          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 mt-2">
            <Ionicons name="bicycle" size={12} color="#0D9488" />
            <Text className="text-[9.5px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider">
              Verified Plant Logistics Driver
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Staff Details Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 shadow-2xs mb-2.5">
        <View className="flex-row justify-between items-center mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Driver & Shift Details
          </Text>

          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="flex-row items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 active:opacity-75"
          >
            <Ionicons name="create-outline" size={12} color="#0D9488" />
            <Text className="text-[10px] font-black text-teal-600">Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Number */}
        <View className="flex-row items-center gap-2.5 py-1">
          <View className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/50 justify-center items-center">
            <Ionicons name="call" size={12} color="#0D9488" />
          </View>
          <View className="flex-1">
            <Text className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Staff Mobile
            </Text>
            <Text className="text-[12.5px] font-extrabold text-slate-800 dark:text-slate-100">
              {user?.phoneNumber || '9822001122'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        {/* Plant Owner Hotline */}
        <View className="flex-row items-center justify-between py-1">
          <View className="flex-row items-center gap-2.5 flex-1 pr-2">
            <View className="w-6 h-6 rounded-md bg-sky-50 dark:bg-sky-950/50 justify-center items-center">
              <Ionicons name="shield" size={12} color="#0284C7" />
            </View>
            <View className="flex-1">
              <Text className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Plant Manager Support
              </Text>
              <Text className="text-[12.5px] font-extrabold text-sky-600">
                8485877633
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
            className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 items-center justify-center"
          >
            <Ionicons name="call-outline" size={12} color="#0284C7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Sign Out Button */}
      <TouchableOpacity 
        onPress={handleSignOut}
        className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 h-10 rounded-xl flex-row justify-center items-center gap-2 active:opacity-75"
        activeOpacity={0.8}
      >
        <Ionicons name="power" size={14} color="#E11D48" />
        <Text className="text-[11.5px] font-black text-rose-600">End Shift & Sign Out</Text>
      </TouchableOpacity>

      {/* Edit Helper Modal */}
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
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
              <Text className="text-[14px] font-black text-slate-900 dark:text-slate-100">
                Edit Staff Information
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Driver / Helper Full Name *"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Ramesh Kumar"
              />

              <Input
                label="Registered Mobile Number *"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="e.g. 9822001122"
              />

              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. Staff Quarters"
              />

              <View className="flex-row gap-2.5 mt-2">
                <View className="flex-1">
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                    style={{ height: 38 }}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Save Changes"
                    onPress={handleSaveProfile}
                    loading={saving}
                    style={{ height: 38 }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
