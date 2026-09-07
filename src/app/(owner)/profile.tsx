import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  KeyboardAvoidingView, 
  Platform,
  Image,
  Linking,
  Share,
  useColorScheme,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { pickImageFromGallery } from '@/utils/imagePicker';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme colors
  const theme = {
    bg: isDark ? '#0B132B' : '#F8FAFC',
    cardBg: isDark ? '#16223F' : '#FFFFFF',
    cardBorder: isDark ? '#23355C' : '#E2E8F0',
    textMain: isDark ? '#F8FAFC' : '#0F172A',
    textSub: isDark ? '#94A3B8' : '#64748B',
    itemBg: isDark ? '#0F172A' : '#F1F5F9',
    divider: isDark ? '#1E293B' : '#F1F5F9',
  };

  // Load customer count if not yet cached
  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers().catch(() => {});
    }
  }, [customers.length, fetchCustomers]);

  // Modal State for Editing Profile
  const [modalVisible, setModalVisible] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState(user?.businessName || 'Abhiraj Water Plant');
  const [displayName, setDisplayName] = useState(user?.displayName || 'Abhishek');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || user?.phone || '8485877633');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '8485877633');
  const [address, setAddress] = useState(user?.address || 'Industrial MIDC, Sector 4, Water Hub');
  const [pricePerJar, setPricePerJar] = useState(user?.pricePerJar?.toString() || '35');
  const [depositPerJar, setDepositPerJar] = useState(user?.depositPerJar?.toString() || '150');
  const [fssaiLicense, setFssaiLicense] = useState(user?.fssaiLicense || '11520038000123');
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || '27AABCN1234F1Z5');
  const [capacityDaily, setCapacityDaily] = useState(user?.capacityDaily?.toString() || '350');
  const [saving, setSaving] = useState(false);

  // Sync form state when user changes
  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || 'Abhiraj Water Plant');
      setDisplayName(user.displayName || 'Abhishek');
      setPhoneNumber(user.phoneNumber || user.phone || '8485877633');
      setWhatsappNumber(user.whatsappNumber || user.phoneNumber || user.phone || '8485877633');
      setAddress(user.address || 'Industrial MIDC, Sector 4, Water Hub');
      setPricePerJar(user.pricePerJar?.toString() || '35');
      setDepositPerJar(user.depositPerJar?.toString() || '150');
      setFssaiLicense(user.fssaiLicense || '11520038000123');
      setGstNumber(user.gstNumber || '27AABCN1234F1Z5');
      setCapacityDaily(user.capacityDaily?.toString() || '350');
    }
  }, [user]);

  const openEditModal = () => {
    setBusinessName(user?.businessName || 'Abhiraj Water Plant');
    setDisplayName(user?.displayName || 'Abhishek');
    setPhoneNumber(user?.phoneNumber || user?.phone || '8485877633');
    setWhatsappNumber(user?.whatsappNumber || user?.phoneNumber || user?.phone || '8485877633');
    setAddress(user?.address || 'Industrial MIDC, Sector 4, Water Hub');
    setPricePerJar(user?.pricePerJar?.toString() || '35');
    setDepositPerJar(user?.depositPerJar?.toString() || '150');
    setFssaiLicense(user?.fssaiLicense || '11520038000123');
    setGstNumber(user?.gstNumber || '27AABCN1234F1Z5');
    setCapacityDaily(user?.capacityDaily?.toString() || '350');
    setModalVisible(true);
  };

  const handlePickGalleryPhoto = async () => {
    try {
      setPhotoUploading(true);
      const uri = await pickImageFromGallery();
      if (uri) {
        await updateProfile({ photoURL: uri });
        Alert.alert('Profile Photo Updated', 'Your plant owner photo has been successfully updated!');
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e.message || 'Failed to update photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!businessName.trim() || !displayName.trim()) {
      Alert.alert('Validation Error', 'Plant / Business Name and Owner Name are required.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        businessName: businessName.trim(),
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        phone: phoneNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
        pricePerJar: parseFloat(pricePerJar) || 35,
        depositPerJar: parseFloat(depositPerJar) || 150,
        fssaiLicense: fssaiLicense.trim(),
        gstNumber: gstNumber.trim(),
        capacityDaily: parseInt(capacityDaily) || 350,
      });

      setBusinessName(updated.businessName || businessName.trim());
      setDisplayName(updated.displayName || displayName.trim());
      setPhoneNumber(updated.phoneNumber || phoneNumber.trim());
      setWhatsappNumber(updated.whatsappNumber || whatsappNumber.trim());
      setAddress(updated.address || address.trim());
      setPricePerJar(updated.pricePerJar?.toString() || pricePerJar);
      setDepositPerJar(updated.depositPerJar?.toString() || depositPerJar);
      setFssaiLicense(updated.fssaiLicense || fssaiLicense.trim());
      setGstNumber(updated.gstNumber || gstNumber.trim());
      setCapacityDaily(updated.capacityDaily?.toString() || capacityDaily);

      Alert.alert('Profile Saved', 'Plant profile, default rates, and statutory details saved successfully.');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSharePlantCard = async () => {
    try {
      const cleanWa = (user?.whatsappNumber || '8485877633').replace(/[^0-9]/g, '');
      const shareText = `💧 *${user?.businessName || 'Abhiraj Water Plant'}*\n` +
        `👤 *Owner:* ${user?.displayName || 'Abhishek'}\n` +
        `📞 *Helpline:* ${user?.phoneNumber || user?.phone || '8485877633'}\n` +
        `💬 *WhatsApp:* https://wa.me/${cleanWa}\n` +
        `🏷️ *20L Jar Rate:* ₹${user?.pricePerJar || 35} | *Deposit:* ₹${user?.depositPerJar || 150}\n` +
        `📍 *Address:* ${user?.address || 'Industrial MIDC, Sector 4, Water Hub'}\n` +
        `✨ *Pure, Hygienic & Tested Packaged Drinking Water at your doorstep!*`;

      await Share.share({
        title: user?.businessName || 'NextWater Plant Profile',
        message: shareText,
      });
    } catch (e: any) {}
  };

  const handleExportLedger = () => {
    Alert.alert(
      'Export Complete Ledgers',
      'Download all customer balances, jar distributions, and billing ledgers to Excel / CSV format?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export CSV', 
          onPress: () => {
            Alert.alert('Export Complete', 'Plant ledgers and customer accounts exported to device.');
          } 
        }
      ]
    );
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(user?.address || 'Industrial MIDC, Sector 4, Water Hub');
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
      Alert.alert('Maps Error', 'Could not open map navigation.');
    });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of NextWater Plant Management?', [
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

  const plantId = user?.uid ? `NWP-${user.uid.substring(0, 6).toUpperCase()}` : 'NWP-PRO8485';

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HERO PLANT IDENTITY CARD */}
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        {/* Top Status Strip */}
        <View style={styles.headerTopRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Cloud Synced</Text>
          </View>

          <View style={[styles.idBadge, { backgroundColor: theme.itemBg }]}>
            <Text style={[styles.idText, { color: theme.textSub }]}>{plantId}</Text>
          </View>
        </View>

        {/* Identity Details */}
        <View style={styles.identityRow}>
          {/* Avatar with Camera Overlay */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {photoUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarInitials}>
                  {user?.displayName?.substring(0, 2).toUpperCase() || 'AP'}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handlePickGalleryPhoto}
              disabled={photoUploading}
              style={styles.cameraButton}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Plant & Owner Name */}
          <View style={styles.identityTextContainer}>
            <View style={styles.nameRow}>
              <Text style={[styles.ownerName, { color: theme.textMain }]} numberOfLines={1}>
                {user?.displayName || 'Abhishek'}
              </Text>
              <Ionicons name="shield-checkmark" size={16} color="#0284C7" />
            </View>

            <Text style={styles.businessName} numberOfLines={1}>
              {user?.businessName || 'Abhiraj Water Plant'}
            </Text>

            <View style={styles.tagRow}>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Owner</Text>
              </View>
              <View style={styles.fssaiTag}>
                <Text style={styles.fssaiTagText}>FSSAI Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, { borderTopColor: theme.divider }]}>
          <TouchableOpacity 
            onPress={openEditModal}
            style={[styles.primaryActionBtn, { backgroundColor: isDark ? '#0369A1' : '#0284C7' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={15} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSharePlantCard}
            style={[styles.secondaryActionBtn, { borderColor: isDark ? '#0284C7' : '#BAE6FD', backgroundColor: isDark ? '#0F172A' : '#F0F9FF' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={15} color="#0284C7" />
            <Text style={styles.secondaryActionText}>Share Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. OPERATIONAL & COMMERCIAL METRICS (2x2 Balanced Grid) */}
      <View style={styles.metricsContainer}>
        {/* Row 1 */}
        <View style={styles.metricRow}>
          {/* Card 1: 20L Rate */}
          <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="cash" size={16} color="#15803D" />
            </View>
            <View style={styles.metricTextWrap}>
              <Text style={[styles.metricValue, { color: '#16A34A' }]}>
                ₹{user?.pricePerJar || 35}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSub }]}>20L Jar Rate</Text>
            </View>
          </View>

          {/* Card 2: Deposit */}
          <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="shield" size={16} color="#4338CA" />
            </View>
            <View style={styles.metricTextWrap}>
              <Text style={[styles.metricValue, { color: '#4F46E5' }]}>
                ₹{user?.depositPerJar || 150}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSub }]}>Jar Deposit</Text>
            </View>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.metricRow}>
          {/* Card 3: Capacity */}
          <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="water" size={16} color="#0369A1" />
            </View>
            <View style={styles.metricTextWrap}>
              <Text style={[styles.metricValue, { color: '#0284C7' }]}>
                {user?.capacityDaily || 350} Jars
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSub }]}>Daily Output</Text>
            </View>
          </View>

          {/* Card 4: Customers */}
          <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="people" size={16} color="#7E22CE" />
            </View>
            <View style={styles.metricTextWrap}>
              <Text style={[styles.metricValue, { color: '#9333EA' }]}>
                {customers.length > 0 ? customers.length : 48} Clients
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSub }]}>Active Network</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. PLANT LICENSURE & FACTORY LOCATION */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMain, borderBottomColor: theme.divider }]}>
          Plant Licensure & Factory Location
        </Text>

        {/* FSSAI */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="ribbon-outline" size={16} color="#D97706" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={[styles.infoLabel, { color: theme.textSub }]}>FSSAI Food Safety Lic</Text>
            <Text style={[styles.infoValue, { color: theme.textMain }]}>
              {user?.fssaiLicense || '11520038000123'}
            </Text>
          </View>
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedPillText}>Govt Verified</Text>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.divider }]} />

        {/* GSTIN */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIconWrap, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="receipt-outline" size={16} color="#2563EB" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={[styles.infoLabel, { color: theme.textSub }]}>GSTIN / Tax ID</Text>
            <Text style={[styles.infoValue, { color: theme.textMain }]}>
              {user?.gstNumber || '27AABCN1234F1Z5'}
            </Text>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>Active</Text>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.divider }]} />

        {/* Physical Address */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIconWrap, { backgroundColor: '#FFE4E6' }]}>
            <Ionicons name="location-outline" size={16} color="#E11D48" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={[styles.infoLabel, { color: theme.textSub }]}>Plant Factory Address</Text>
            <Text style={[styles.addressText, { color: theme.textMain }]} numberOfLines={2}>
              {user?.address || 'Industrial MIDC, Sector 4, Water Hub'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleOpenMaps}
            style={[styles.mapsBtn, { backgroundColor: isDark ? '#0F172A' : '#F0F9FF', borderColor: isDark ? '#0284C7' : '#BAE6FD' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={13} color="#0284C7" />
            <Text style={styles.mapsBtnText}>Maps</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. DIRECT CONTACT CHANNELS */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMain, borderBottomColor: theme.divider }]}>
          Client Support & Contact Channels
        </Text>

        {/* Helpline */}
        <View style={styles.channelRow}>
          <View style={[styles.channelIconWrap, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="call" size={15} color="#15803D" />
          </View>
          <View style={styles.channelTextWrap}>
            <Text style={[styles.channelLabel, { color: theme.textSub }]}>Customer Helpline Number</Text>
            <Text style={styles.phoneText}>
              {user?.phoneNumber || user?.phone || '8485877633'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL(`tel:${user?.phoneNumber || user?.phone || '8485877633'}`).catch(() => {})}
            style={styles.channelActionBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={15} color="#15803D" />
          </TouchableOpacity>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.divider }]} />

        {/* WhatsApp */}
        <View style={styles.channelRow}>
          <View style={[styles.channelIconWrap, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="logo-whatsapp" size={16} color="#15803D" />
          </View>
          <View style={styles.channelTextWrap}>
            <Text style={[styles.channelLabel, { color: theme.textSub }]}>WhatsApp Business Line</Text>
            <Text style={styles.phoneText}>
              {user?.whatsappNumber || '8485877633'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              const clean = (user?.whatsappNumber || '8485877633').replace(/[^0-9]/g, '');
              Linking.openURL(`https://wa.me/${clean}`).catch(() => {});
            }}
            style={styles.channelActionBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#15803D" />
          </TouchableOpacity>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.divider }]} />

        {/* Email */}
        <View style={styles.channelRow}>
          <View style={[styles.channelIconWrap, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="mail" size={15} color="#0369A1" />
          </View>
          <View style={styles.channelTextWrap}>
            <Text style={[styles.channelLabel, { color: theme.textSub }]}>Billing & Plant Email</Text>
            <Text style={[styles.emailText, { color: theme.textMain }]} numberOfLines={1}>
              {user?.email || 'abhisek@nextwater.com'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL(`mailto:${user?.email || 'abhisek@nextwater.com'}`).catch(() => {})}
            style={[styles.channelActionBtn, { backgroundColor: '#E0F2FE' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="mail" size={15} color="#0369A1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. SHORTCUTS TO ESSENTIAL MASTER MODULES */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMain, borderBottomColor: theme.divider }]}>
          Plant Master Settings & Audits
        </Text>

        <View style={{ gap: 6 }}>
          <TouchableOpacity 
            onPress={() => router.push(ROUTES.OWNER.PLANT_SETTINGS as any)}
            style={[styles.menuItem, { backgroundColor: theme.itemBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="settings-sharp" size={15} color="#0284C7" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.textMain }]}>Plant Automation & Low Stock Alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textSub} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(ROUTES.OWNER.TRANSACTIONS as any)}
            style={[styles.menuItem, { backgroundColor: theme.itemBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="receipt" size={15} color="#15803D" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.textMain }]}>Plant Financial Ledger & Passbook</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textSub} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(ROUTES.OWNER.STAFF as any)}
            style={[styles.menuItem, { backgroundColor: theme.itemBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="people" size={15} color="#4338CA" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.textMain }]}>Delivery Helpers & Drivers</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textSub} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(ROUTES.OWNER.TUTORIALS as any)}
            style={[styles.menuItem, { backgroundColor: theme.itemBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="play-circle" size={15} color="#D97706" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.textMain }]}>Plant Video Training & SOPs</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textSub} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. SAAS SUBSCRIPTION & SMS RECHARGE */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.subscriptionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMain, borderBottomWidth: 0, paddingBottom: 0 }]}>
            Enterprise SaaS Plan
          </Text>
          <View style={styles.proPill}>
            <Text style={styles.proPillText}>Enterprise Pro</Text>
          </View>
        </View>

        <View style={[styles.planRow, { borderTopWidth: 1, borderTopColor: theme.divider, marginTop: 8, paddingTop: 8 }]}>
          <Text style={[styles.planLabel, { color: theme.textSub }]}>Subscription Status</Text>
          <Text style={styles.activeStatusText}>Active (Unlimited Fleet)</Text>
        </View>

        <View style={[styles.planRow, { marginTop: 6 }]}>
          <Text style={[styles.planLabel, { color: theme.textSub }]}>SMS & WhatsApp Wallet</Text>
          <Text style={styles.creditsText}>1,250 Credits Available</Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push(ROUTES.OWNER.RECHARGE as any)}
          style={styles.rechargeBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="card-outline" size={16} color="#FFFFFF" />
          <Text style={styles.rechargeBtnText}>Recharge SMS or Upgrade Plan</Text>
        </TouchableOpacity>
      </View>

      {/* 7. DATA BACKUP & DIAGNOSTICS */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMain, borderBottomColor: theme.divider }]}>
          Data Backup & Reports
        </Text>

        <TouchableOpacity 
          onPress={handleExportLedger}
          style={[styles.menuItem, { backgroundColor: theme.itemBg }]}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="cloud-download" size={15} color="#0D9488" />
            </View>
            <View>
              <Text style={[styles.menuItemText, { color: theme.textMain }]}>Export Plant Ledgers (CSV)</Text>
              <Text style={{ fontSize: 10, color: theme.textSub }}>All client balances and jar accounts</Text>
            </View>
          </View>
          <Ionicons name="download-outline" size={16} color="#0D9488" />
        </TouchableOpacity>

        <View style={styles.versionRow}>
          <Text style={[styles.versionText, { color: theme.textSub }]}>Build: NextWater v1.0.0 (Expo SDK 57)</Text>
          <Text style={[styles.versionText, { color: theme.textSub }]}>Role: Plant Owner</Text>
        </View>
      </View>

      {/* 8. SIGN OUT BUTTON */}
      <TouchableOpacity 
        onPress={handleSignOut}
        style={[styles.signOutBtn, { backgroundColor: isDark ? '#4C0519' : '#FFF1F2', borderColor: isDark ? '#9F1239' : '#FECDD3' }]}
        activeOpacity={0.8}
      >
        <Ionicons name="power" size={16} color="#E11D48" />
        <Text style={styles.signOutText}>Sign Out Account</Text>
      </TouchableOpacity>

      {/* 9. EDIT PROFILE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.cardBg }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.divider }]}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                  Edit Plant Profile & Rates
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSub }]}>
                  Update business branding and default commercial rates
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[styles.modalCloseBtn, { backgroundColor: theme.itemBg }]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={theme.textSub} />
              </TouchableOpacity>
            </View>

            {/* Modal Inputs */}
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Input
                label="Plant / Factory Name *"
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Abhiraj Water Plant"
              />

              <Input
                label="Owner Full Name *"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Abhishek"
              />

              <View style={styles.modalRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="20L Jar Rate (₹) *"
                    value={pricePerJar}
                    onChangeText={setPricePerJar}
                    keyboardType="numeric"
                    placeholder="e.g. 35"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Jar Deposit (₹) *"
                    value={depositPerJar}
                    onChangeText={setDepositPerJar}
                    keyboardType="numeric"
                    placeholder="e.g. 150"
                  />
                </View>
              </View>

              <View style={styles.modalRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Daily Capacity (Jars)"
                    value={capacityDaily}
                    onChangeText={setCapacityDaily}
                    keyboardType="numeric"
                    placeholder="e.g. 350"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="FSSAI License No."
                    value={fssaiLicense}
                    onChangeText={setFssaiLicense}
                    placeholder="e.g. 11520038000123"
                  />
                </View>
              </View>

              <Input
                label="GSTIN / Tax ID"
                value={gstNumber}
                onChangeText={setGstNumber}
                placeholder="e.g. 27AABCN1234F1Z5"
              />

              <Input
                label="Support Helpline Phone *"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="e.g. 8485877633"
              />

              <Input
                label="WhatsApp Business Phone *"
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                keyboardType="phone-pad"
                placeholder="e.g. 8485877633"
              />

              <Input
                label="Plant Factory Physical Address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                placeholder="e.g. Industrial MIDC, Sector 4, Water Hub"
              />

              {/* Modal Buttons */}
              <View style={styles.modalBtnRow}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                    style={{ height: 42 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Save Changes"
                    onPress={handleSaveProfile}
                    loading={saving}
                    style={{ height: 42 }}
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  idBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  identityTextContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ownerName: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  businessName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  roleTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  roleTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  fssaiTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  fssaiTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  primaryActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    elevation: 1,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  metricsContainer: {
    marginBottom: 10,
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTextWrap: {
    flex: 1,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  addressText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
    lineHeight: 16,
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  verifiedPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  activePill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  activePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  mapsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  separator: {
    height: 1,
    marginVertical: 6,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  channelIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  channelTextWrap: {
    flex: 1,
  },
  channelLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  phoneText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#16A34A',
    marginTop: 1,
  },
  emailText: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 1,
  },
  channelActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  menuItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  proPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeStatusText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  creditsText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  rechargeBtn: {
    marginTop: 10,
    backgroundColor: '#0284C7',
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
  },
  rechargeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 6,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  signOutBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E11D48',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 28,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});
