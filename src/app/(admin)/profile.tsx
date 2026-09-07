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
  Linking,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { pickImageFromGallery } from '@/utils/imagePicker';
import { ROUTES } from '@/constants/routes';

export default function SuperAdminProfileScreen() {
  const { user, signOut, updateProfile, setUser } = useAuthStore();
  const router = useRouter();

  const [photoUploading, setPhotoUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || 'Super Administrator');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '8485877633');
  const [helpline, setHelpline] = useState('8485877633');
  const [saving, setSaving] = useState(false);

  const handlePickGalleryPhoto = async () => {
    try {
      setPhotoUploading(true);
      const uri = await pickImageFromGallery();
      if (uri) {
        await updateProfile({ photoURL: uri });
        Alert.alert('Success', 'Super Admin profile photo updated!');
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
      Alert.alert('Profile Saved', 'Super Admin master profile updated.');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchRole = (targetRole: 'owner' | 'helper' | 'customer') => {
    Alert.alert(
      'Switch Preview Mode',
      `Jump directly into ${targetRole.toUpperCase()} mode?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch Now',
          onPress: () => {
            if (user) {
              setUser({ ...user, role: targetRole });
            }
            if (targetRole === 'owner') router.replace(ROUTES.OWNER.DASHBOARD);
            else if (targetRole === 'helper') router.replace(ROUTES.HELPER.DASHBOARD);
            else if (targetRole === 'customer') router.replace(ROUTES.CUSTOMER.DASHBOARD);
          }
        }
      ]
    );
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
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Super Admin Profile Header with LinearGradient */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.profileBanner}
        />
        <View style={styles.profileContent}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarBox}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>SA</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handlePickGalleryPhoto}
              disabled={photoUploading}
              style={styles.cameraBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.adminName}>
            {user?.displayName || 'Super Administrator'}
          </Text>

          <Text style={styles.adminEmail}>
            {user?.email || 'icoded@gmail.com'}
          </Text>

          <View style={styles.rootBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#0284C7" />
            <Text style={styles.rootBadgeText}>
              ROOT SAAS MASTER ACCESS
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Master Platform Info Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Master Account Information</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editPill}>
            <Text style={styles.editPillText}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="mail" size={15} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Master Cloud Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'icoded@gmail.com'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="call" size={15} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Direct Contact Mobile</Text>
            <Text style={styles.infoValue}>+91 {phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="headset" size={15} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Platform 24/7 Helpline</Text>
            <Text style={styles.infoValue}>+91 {helpline}</Text>
          </View>
        </View>
      </View>

      {/* 3. Testing & Mode Switcher */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Platform Preview</Text>
        <Text style={styles.cardSub}>Jump directly into other roles for end-to-end testing:</Text>

        <View style={styles.switcherGrid}>
          <TouchableOpacity 
            onPress={() => handleSwitchRole('owner')}
            style={styles.switcherBtn}
            activeOpacity={0.7}
          >
            <View style={[styles.switcherIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="business" size={18} color="#0284C7" />
            </View>
            <Text style={styles.switcherText}>Owner App</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleSwitchRole('helper')}
            style={styles.switcherBtn}
            activeOpacity={0.7}
          >
            <View style={[styles.switcherIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="bicycle" size={18} color="#10B981" />
            </View>
            <Text style={styles.switcherText}>Staff App</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleSwitchRole('customer')}
            style={styles.switcherBtn}
            activeOpacity={0.7}
          >
            <View style={[styles.switcherIcon, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="water" size={18} color="#EC4899" />
            </View>
            <Text style={styles.switcherText}>Customer App</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Log Out Button */}
      <TouchableOpacity 
        onPress={handleSignOut}
        style={styles.logoutBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
        <Text style={styles.logoutBtnText}>Log Out Master Console</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Master Credentials</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Admin Full Name</Text>
            <TextInput 
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Super Administrator"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Admin Mobile Number</Text>
            <TextInput 
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="8485877633"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Platform Helpline Number</Text>
            <TextInput 
              value={helpline}
              onChangeText={setHelpline}
              keyboardType="phone-pad"
              placeholder="8485877633"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  profileBanner: {
    height: 70,
    width: '100%',
  },
  profileContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -38,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0284C7',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  adminName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  adminEmail: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2,
  },
  rootBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  rootBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    marginBottom: 12,
  },
  editPill: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  editPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  switcherGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  switcherBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switcherIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  switcherText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
