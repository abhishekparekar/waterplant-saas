import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { pickImageFromGallery } from '@/utils/imagePicker';

export default function CustomerProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const router = useRouter();

  const [photoUploading, setPhotoUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || 'Customer');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || 'Flat 302, Green Valley Apartments');
  const [saving, setSaving] = useState(false);

  const handlePickGalleryPhoto = async () => {
    try {
      setPhotoUploading(true);
      const uri = await pickImageFromGallery();
      if (uri) {
        await updateProfile({ photoURL: uri });
        Alert.alert('Success', 'Profile photo updated from gallery!');
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
        address: address.trim(),
      });
      Alert.alert('Profile Saved', 'Delivery address & profile details updated.');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Sign out of your customer water account?', [
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
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3 py-2.5" 
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Customer Profile Header Card with LinearGradient */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs mb-2.5">
        <LinearGradient
          colors={['#0284C7', '#0369A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-16 w-full"
        />
        <View className="items-center px-4 pb-4 -mt-8">
          <View className="relative mb-2">
            <View className="w-18 h-18 rounded-full bg-sky-600 justify-center items-center shadow-md overflow-hidden border-3 border-white dark:border-slate-800">
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text className="text-2xl font-black text-white">
                  {user?.displayName?.substring(0, 2).toUpperCase() || 'CU'}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handlePickGalleryPhoto}
              disabled={photoUploading}
              className="absolute bottom-0 right-0 bg-sky-700 w-6 h-6 rounded-full justify-center items-center border-2 border-white dark:border-slate-800 shadow-sm active:opacity-75"
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={11} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text className="text-[16px] font-black text-slate-900 dark:text-slate-50 text-center leading-tight">
            {user?.displayName || 'Customer'}
          </Text>

          <Text className="text-[12px] font-bold text-sky-600 dark:text-sky-400 mt-0.5 text-center">
            {user?.phoneNumber || 'Customer Phone'}
          </Text>

          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60 mt-2">
            <Ionicons name="water" size={12} color="#0284c7" />
            <Text className="text-[9.5px] font-black text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              Active Water Consumer
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Customer Delivery Address & Details Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 shadow-2xs mb-2.5">
        <View className="flex-row justify-between items-center mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Delivery Location & Contact
          </Text>

          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="flex-row items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 active:opacity-75"
          >
            <Ionicons name="create-outline" size={12} color="#0284C7" />
            <Text className="text-[10px] font-black text-sky-600">Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Address */}
        <View className="flex-row items-center gap-2.5 py-1">
          <View className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/50 justify-center items-center">
            <Ionicons name="location" size={12} color="#D97706" />
          </View>
          <View className="flex-1">
            <Text className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Drop Address
            </Text>
            <Text className="text-[12px] font-medium text-slate-800 dark:text-slate-100 mt-0.5">
              {user?.address || 'Flat 302, Green Valley Apartments'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        {/* Support Hotline */}
        <View className="flex-row items-center justify-between py-1">
          <View className="flex-row items-center gap-2.5 flex-1 pr-2">
            <View className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/50 justify-center items-center">
              <Ionicons name="call" size={12} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Plant Support Helpline
              </Text>
              <Text className="text-[12px] font-extrabold text-emerald-600">
                8485877633
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
            className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 items-center justify-center"
          >
            <Ionicons name="call-outline" size={12} color="#059669" />
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
        <Text className="text-[11.5px] font-black text-rose-600">Sign Out Account</Text>
      </TouchableOpacity>

      {/* Edit Customer Profile Modal */}
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
                Edit Delivery Info
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Full Name *"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Rahul Sharma"
              />

              <Input
                label="Mobile Phone Number *"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="e.g. 9876543210"
              />

              <Input
                label="Complete Delivery Address *"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                placeholder="e.g. Flat 302, Sector 4"
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
