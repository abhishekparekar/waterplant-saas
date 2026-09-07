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

  const [onDuty, setOnDuty] = useState(true);

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3 py-2.5" 
      contentContainerStyle={{ paddingBottom: 85 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Helper Profile Card with LinearGradient */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mb-3">
        <LinearGradient
          colors={['#0D9488', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 60, width: '100%' }}
        />
        <View className="items-center px-4 pb-4 -mt-8">
          <View className="relative mb-2">
            <View className="w-16 h-16 rounded-2xl bg-teal-600 justify-center items-center shadow-md overflow-hidden border-2 border-white dark:border-slate-800">
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
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#0F766E',
                borderWidth: 2,
                borderColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={11} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text className="text-base font-black text-slate-900 dark:text-slate-50 text-center">
            {user?.displayName || 'Driver Staff'}
          </Text>

          <Text className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5 text-center">
            {user?.businessName || 'Abhiraj Water Plant'} Logistics
          </Text>

          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 mt-2">
            <Ionicons name="shield-checkmark" size={13} color="#0D9488" />
            <Text className="text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider">
              Verified Logistics Fleet Driver
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Shift Working Status Toggle */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm mb-3">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs font-black text-slate-900 dark:text-slate-50">
              Driver Duty Status
            </Text>
            <Text className="text-[10.5px] font-semibold text-slate-400 mt-0.5">
              {onDuty ? 'Currently active and receiving runs' : 'On break / Not taking deliveries'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setOnDuty(!onDuty);
              Alert.alert('Shift Status', onDuty ? 'You are now ON BREAK' : 'You are now ON DUTY');
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: onDuty ? '#ECFDF5' : '#FFF1F2',
              borderWidth: 1,
              borderColor: onDuty ? '#10B981' : '#F43F5E',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
            activeOpacity={0.8}
          >
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: onDuty ? '#10B981' : '#F43F5E' }} />
            <Text style={{ fontSize: 11, fontWeight: '900', color: onDuty ? '#047857' : '#BE123C', textTransform: 'uppercase' }}>
              {onDuty ? 'On Duty' : 'On Break'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Vehicle & Assignment Details */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm mb-3">
        <View className="flex-row justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Vehicle & Route Details
          </Text>

          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: '#F0FDFA',
              borderWidth: 1,
              borderColor: '#CCFBF1',
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={13} color="#0D9488" />
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#0D9488' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Assigned Vehicle */}
        <View className="flex-row items-center justify-between py-1.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="bus-outline" size={16} color="#0D9488" />
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">Assigned Vehicle</Text>
          </View>
          <Text className="text-xs font-black text-slate-800 dark:text-slate-100">Plant Delivery Tempo</Text>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        {/* Mobile Number */}
        <View className="flex-row items-center justify-between py-1.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="call-outline" size={16} color="#0D9488" />
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">Driver Phone</Text>
          </View>
          <Text className="text-xs font-black text-slate-800 dark:text-slate-100">{user?.phoneNumber || '9822001122'}</Text>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

        {/* Plant Helpline Hotline */}
        <View className="flex-row items-center justify-between py-1.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="shield-outline" size={16} color="#0284C7" />
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">Plant Manager Desk</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-black text-sky-600">8485877633</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: '#E0F2FE',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="call" size={13} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4. Quick Help Buttons */}
      <View className="flex-row gap-2 mb-3">
        <TouchableOpacity
          onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
          style={{
            flex: 1,
            height: 38,
            borderRadius: 8,
            backgroundColor: '#ECFDF5',
            borderWidth: 1,
            borderColor: '#A7F3D0',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          activeOpacity={0.75}
        >
          <Ionicons name="call" size={15} color="#059669" />
          <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#047857' }}>Call Helpline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://wa.me/918485877633?text=Hi%20Plant%20Support').catch(() => {})}
          style={{
            flex: 1,
            height: 38,
            borderRadius: 8,
            backgroundColor: '#F0FDF4',
            borderWidth: 1,
            borderColor: '#BBF7D0',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          activeOpacity={0.75}
        >
          <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
          <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#15803D' }}>WhatsApp Support</Text>
        </TouchableOpacity>
      </View>

      {/* 5. End Shift & Sign Out Button in Rectangular Format */}
      <TouchableOpacity 
        onPress={handleSignOut}
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
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="power" size={16} color="#E11D48" />
        <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#E11D48' }}>End Shift & Sign Out</Text>
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

              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F1F5F9',
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={saving}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#0D9488',
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                    <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                      Save Changes
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
