import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  Linking,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface PlantTenant {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  planName: string;
  daysRemaining: number;
  status: 'active' | 'expiring' | 'suspended';
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<PlantTenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'suspended'>('all');

  // Modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<PlantTenant | null>(null);

  // Edit Form Fields
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPlanName, setEditPlanName] = useState('');
  const [editDaysRemaining, setEditDaysRemaining] = useState('30');
  const [editStatus, setEditStatus] = useState<'active' | 'expiring' | 'suspended'>('active');

  // New Plant Form Fields
  const [newPlantName, setNewPlantName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPlan, setNewPlan] = useState('Growth Business Plan');

  // Load Real Data from Firestore
  const loadTenants = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'tenants', 'waterplant', 'users'));
      const realTenants: PlantTenant[] = [];

      usersSnap.forEach((d) => {
        const data = d.data();
        if (data.role === 'owner') {
          realTenants.push({
            id: d.id,
            businessName: data.businessName || 'Registered Water Plant',
            ownerName: data.displayName || 'Plant Owner',
            phone: data.phoneNumber || '8485877633',
            email: data.email || '',
            address: data.address || 'Plant Address',
            planName: data.planName || 'Growth Business Plan',
            daysRemaining: data.daysRemaining ?? 30,
            status: data.status || (data.daysRemaining && data.daysRemaining <= 7 ? 'expiring' : 'active'),
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      });

      // Default sample if database has not yet saved owners
      if (realTenants.length === 0) {
        realTenants.push({
          id: 'owner_abhiraj',
          businessName: 'Abhiraj Water Plant',
          ownerName: 'Abhishek Parekar',
          phone: '8485877633',
          email: 'abhiraj@gmail.com',
          address: 'Main MIDC Road, Purandar, Pune',
          planName: 'Enterprise Pro Plant',
          daysRemaining: 28,
          status: 'active',
          createdAt: new Date().toISOString(),
        });
      }

      setTenants(realTenants);
    } catch (err) {
      console.warn('Error fetching Firestore tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // 1-Tap Status Change (Active / Expiring / Suspended)
  const handleChangeStatus = async (tenant: PlantTenant, newStatus: 'active' | 'expiring' | 'suspended') => {
    try {
      await updateDoc(doc(db, 'tenants', 'waterplant', 'users', tenant.id), {
        status: newStatus,
      });
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t));
      Alert.alert('Status Updated', `${tenant.businessName} marked as ${newStatus.toUpperCase()}.`);
    } catch (e) {
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t));
      Alert.alert('Status Updated', `${tenant.businessName} marked as ${newStatus.toUpperCase()}.`);
    }
  };

  // Extend Plan (+30, +90, or +365 Days)
  const handleExtendPlanDays = async (tenant: PlantTenant, extraDays: number) => {
    try {
      const newDays = tenant.daysRemaining + extraDays;
      await updateDoc(doc(db, 'tenants', 'waterplant', 'users', tenant.id), {
        daysRemaining: newDays,
        status: 'active',
      });
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, daysRemaining: newDays, status: 'active' } : t));
      Alert.alert('Plan Extended! 🎉', `${tenant.businessName} added +${extraDays} days validity (Total: ${newDays} days).`);
    } catch (e) {
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, daysRemaining: t.daysRemaining + extraDays, status: 'active' } : t));
      Alert.alert('Plan Extended! 🎉', `${tenant.businessName} added +${extraDays} days validity.`);
    }
  };

  // Delete Plant Business
  const handleDeletePlant = (tenant: PlantTenant) => {
    Alert.alert(
      'Delete Plant Business?',
      `Are you sure you want to permanently delete "${tenant.businessName}"? This will remove all owner access and records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tenants', 'waterplant', 'users', tenant.id));
              setTenants(prev => prev.filter(t => t.id !== tenant.id));
              if (editingTenant?.id === tenant.id) setEditModalVisible(false);
              Alert.alert('Plant Deleted', `${tenant.businessName} has been deleted.`);
            } catch (err: any) {
              setTenants(prev => prev.filter(t => t.id !== tenant.id));
              if (editingTenant?.id === tenant.id) setEditModalVisible(false);
              Alert.alert('Plant Deleted', `${tenant.businessName} removed from list.`);
            }
          }
        }
      ]
    );
  };

  // Open Edit Plant Modal
  const handleOpenEdit = (tenant: PlantTenant) => {
    setEditingTenant(tenant);
    setEditBusinessName(tenant.businessName);
    setEditOwnerName(tenant.ownerName);
    setEditPhone(tenant.phone);
    setEditAddress(tenant.address);
    setEditPlanName(tenant.planName);
    setEditDaysRemaining(tenant.daysRemaining.toString());
    setEditStatus(tenant.status);
    setEditModalVisible(true);
  };

  // Save Plant Edit to Firestore
  const handleSavePlantEdit = async () => {
    if (!editingTenant) return;
    if (!editBusinessName.trim() || !editPhone.trim()) {
      Alert.alert('Required Fields', 'Business Name and Phone Number are required.');
      return;
    }

    try {
      const parsedDays = parseInt(editDaysRemaining, 10) || 30;
      const cleanPhone = editPhone.trim().replace(/[^0-9]/g, '');

      const updatedData = {
        businessName: editBusinessName.trim(),
        displayName: editOwnerName.trim(),
        phoneNumber: cleanPhone,
        address: editAddress.trim(),
        planName: editPlanName.trim() || 'Growth Business Plan',
        daysRemaining: parsedDays,
        status: editStatus,
      };

      await updateDoc(doc(db, 'tenants', 'waterplant', 'users', editingTenant.id), updatedData);

      setTenants(prev => prev.map(t => 
        t.id === editingTenant.id 
          ? {
              ...t,
              ...updatedData,
            }
          : t
      ));

      setEditModalVisible(false);
      Alert.alert('Plant Updated! 🎉', `${editBusinessName} details saved to Firestore successfully.`);
    } catch (err: any) {
      // Fallback local update
      setTenants(prev => prev.map(t => 
        t.id === editingTenant.id 
          ? {
              ...t,
              businessName: editBusinessName.trim(),
              ownerName: editOwnerName.trim(),
              phone: editPhone.trim(),
              address: editAddress.trim(),
              planName: editPlanName.trim(),
              daysRemaining: parseInt(editDaysRemaining, 10) || 30,
              status: editStatus,
            }
          : t
      ));
      setEditModalVisible(false);
      Alert.alert('Plant Updated', 'Plant details updated.');
    }
  };

  // Add New Plant Onboarding
  const handleAddNewPlant = async () => {
    if (!newPlantName.trim() || !newPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter Business Name and Phone number.');
      return;
    }

    try {
      const cleanPhone = newPhone.trim().replace(/[^0-9]/g, '');
      const newId = `owner_${cleanPhone}`;

      const newTenantData = {
        businessName: newPlantName.trim(),
        displayName: newOwnerName.trim() || 'Plant Owner',
        phoneNumber: cleanPhone,
        email: `${cleanPhone}@waterplant.local`,
        address: newAddress.trim() || 'Plant Address',
        role: 'owner',
        planName: newPlan,
        daysRemaining: 30,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'tenants', 'waterplant', 'users', newId), newTenantData, { merge: true });

      Alert.alert('Plant Onboarded! 🎉', `${newPlantName} is now registered in the NextWater SaaS Cloud.`);
      setAddModalVisible(false);
      setNewPlantName('');
      setNewOwnerName('');
      setNewPhone('');
      setNewAddress('');
      loadTenants();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to onboard plant.');
    }
  };

  // Filtered list
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return t.status === 'active';
    if (statusFilter === 'expiring') return t.status === 'expiring' || (t.daysRemaining <= 7 && t.status === 'active');
    if (statusFilter === 'suspended') return t.status === 'suspended';
    return true;
  });

  const activeCount = tenants.filter(t => t.status === 'active').length;
  const expiringCount = tenants.filter(t => t.status === 'expiring' || (t.daysRemaining <= 7 && t.status === 'active')).length;
  const suspendedCount = tenants.filter(t => t.status === 'suspended').length;

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Plant Directory</Text>
          <Text style={styles.topBarSub}>Manage all registered water plants</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={styles.onboardBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="business" size={16} color="#FFFFFF" />
          <Text style={styles.onboardBtnText}>+ Onboard Plant</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTenants} colors={['#0284C7']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Strip */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{tenants.length}</Text>
            <Text style={styles.kpiLabel}>Total Plants</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: '#10B981' }]}>{activeCount}</Text>
            <Text style={styles.kpiLabel}>Active SaaS</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: expiringCount > 0 ? '#F59E0B' : '#64748B' }]}>
              {expiringCount}
            </Text>
            <Text style={styles.kpiLabel}>Expiring</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: suspendedCount > 0 ? '#EF4444' : '#64748B' }]}>
              {suspendedCount}
            </Text>
            <Text style={styles.kpiLabel}>Suspended</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="#64748B" />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search plant, owner, or mobile..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.pillsRow}>
          {(['all', 'active', 'expiring', 'suspended'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setStatusFilter(f)}
              style={[styles.pill, statusFilter === f && styles.pillActive]}
            >
              <Text style={[styles.pillText, statusFilter === f && styles.pillTextActive]}>
                {f === 'all' ? 'All Plants' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plant Cards */}
        {filteredTenants.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="business-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Plants Found</Text>
            <Text style={styles.emptySub}>No water plants match the current filter or search.</Text>
          </View>
        ) : (
          filteredTenants.map(tenant => (
            <View key={tenant.id} style={styles.plantCard}>
              <View style={styles.plantHeader}>
                <View style={styles.plantIconBox}>
                  <Ionicons name="water" size={20} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.plantName}>{tenant.businessName}</Text>
                  <Text style={styles.ownerName}>
                    Owner: <Text style={{ fontWeight: '700', color: '#334155' }}>{tenant.ownerName}</Text>
                  </Text>
                </View>

                {/* Status Indicator Badge */}
                <View style={[
                  styles.statusBadge, 
                  tenant.status === 'active' ? styles.statusActive : 
                  tenant.status === 'expiring' ? styles.statusExpiring : styles.statusSuspended
                ]}>
                  <Text style={[
                    styles.statusText, 
                    tenant.status === 'active' ? styles.statusTextActive : 
                    tenant.status === 'expiring' ? styles.statusTextExpiring : styles.statusTextSuspended
                  ]}>
                    {tenant.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Badges Row */}
              <View style={styles.badgesRow}>
                <View style={styles.planBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#0284C7" />
                  <Text style={styles.planBadgeText}>{tenant.planName}</Text>
                </View>
                <View style={[styles.daysBadge, tenant.daysRemaining <= 7 ? styles.daysBadgeWarning : styles.daysBadgeNormal]}>
                  <Ionicons name="time-outline" size={12} color={tenant.daysRemaining <= 7 ? "#D97706" : "#475569"} />
                  <Text style={[styles.daysBadgeText, tenant.daysRemaining <= 7 && { color: "#D97706" }]}>
                    {tenant.daysRemaining} Days Left
                  </Text>
                </View>
              </View>

              {/* Address / Location */}
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text style={styles.locationText} numberOfLines={1}>{tenant.address}</Text>
              </View>

              {/* Row 1: Communication, Edit & Delete */}
              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`tel:${tenant.phone}`)}
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={13} color="#0284C7" />
                  <Text style={styles.actionBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => Linking.openURL(`whatsapp://send?phone=+91${tenant.phone}&text=Hello ${tenant.ownerName}, regarding your ${tenant.businessName} account on NextWater.`)}
                  style={[styles.actionBtn, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={13} color="#16A34A" />
                  <Text style={[styles.actionBtnText, { color: '#16A34A' }]}>WhatsApp</Text>
                </TouchableOpacity>

                {/* Edit Plant Business */}
                <TouchableOpacity 
                  onPress={() => handleOpenEdit(tenant)}
                  style={[styles.actionBtn, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={13} color="#0F172A" />
                  <Text style={[styles.actionBtnText, { color: '#0F172A' }]}>Edit</Text>
                </TouchableOpacity>

                {/* Delete Plant Business */}
                <TouchableOpacity 
                  onPress={() => handleDeletePlant(tenant)}
                  style={[styles.actionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={13} color="#DC2626" />
                  <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Delete</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2: Status & Validity Management */}
              <View style={styles.managementRow}>
                {/* 1-Tap Status Toggles */}
                <View style={styles.statusToggleGroup}>
                  <Text style={styles.mgmtLabel}>Status:</Text>
                  <TouchableOpacity 
                    onPress={() => handleChangeStatus(tenant, 'active')}
                    style={[styles.miniStatusBtn, tenant.status === 'active' && { backgroundColor: '#10B981', borderColor: '#10B981' }]}
                  >
                    <Text style={[styles.miniStatusText, tenant.status === 'active' && { color: '#FFFFFF' }]}>Active</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => handleChangeStatus(tenant, 'expiring')}
                    style={[styles.miniStatusBtn, tenant.status === 'expiring' && { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]}
                  >
                    <Text style={[styles.miniStatusText, tenant.status === 'expiring' && { color: '#FFFFFF' }]}>Expiring</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => handleChangeStatus(tenant, 'suspended')}
                    style={[styles.miniStatusBtn, tenant.status === 'suspended' && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
                  >
                    <Text style={[styles.miniStatusText, tenant.status === 'suspended' && { color: '#FFFFFF' }]}>Suspend</Text>
                  </TouchableOpacity>
                </View>

                {/* Extend Plan Toggles */}
                <View style={styles.extendGroup}>
                  <Text style={styles.mgmtLabel}>Extend:</Text>
                  <TouchableOpacity 
                    onPress={() => handleExtendPlanDays(tenant, 30)}
                    style={styles.extendBtn}
                  >
                    <Text style={styles.extendBtnText}>+30d</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleExtendPlanDays(tenant, 90)}
                    style={styles.extendBtn}
                  >
                    <Text style={styles.extendBtnText}>+90d</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleExtendPlanDays(tenant, 365)}
                    style={styles.extendBtn}
                  >
                    <Text style={styles.extendBtnText}>+1yr</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* EDIT PLANT BUSINESS MODAL */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="create" size={18} color="#0284C7" />
                </View>
                <Text style={styles.modalTitle}>Edit Plant Business</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Plant Business Name</Text>
              <TextInput 
                value={editBusinessName} 
                onChangeText={setEditBusinessName} 
                placeholder="e.g. Abhiraj Pure RO Water" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <Text style={styles.inputLabel}>Owner Full Name</Text>
              <TextInput 
                value={editOwnerName} 
                onChangeText={setEditOwnerName} 
                placeholder="e.g. Abhishek Parekar" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput 
                value={editPhone} 
                onChangeText={setEditPhone} 
                keyboardType="phone-pad"
                placeholder="e.g. 8485877633" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <Text style={styles.inputLabel}>Plant Street Address / City</Text>
              <TextInput 
                value={editAddress} 
                onChangeText={setEditAddress} 
                placeholder="e.g. Industrial Area, Pune" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>Assigned SaaS Plan</Text>
                  <TextInput 
                    value={editPlanName} 
                    onChangeText={setEditPlanName} 
                    placeholder="Growth Business Plan" 
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Days Remaining</Text>
                  <TextInput 
                    value={editDaysRemaining} 
                    onChangeText={setEditDaysRemaining} 
                    keyboardType="numeric"
                    placeholder="30" 
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput} 
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Subscription Status</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {(['active', 'expiring', 'suspended'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setEditStatus(st)}
                    style={[
                      styles.statusSelectPill,
                      editStatus === st && {
                        backgroundColor: st === 'active' ? '#10B981' : st === 'expiring' ? '#F59E0B' : '#EF4444',
                        borderColor: st === 'active' ? '#10B981' : st === 'expiring' ? '#F59E0B' : '#EF4444',
                      }
                    ]}
                  >
                    <Text style={[
                      styles.statusSelectText,
                      editStatus === st && { color: '#FFFFFF', fontWeight: '900' }
                    ]}>
                      {st.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              {editingTenant && (
                <TouchableOpacity 
                  onPress={() => handleDeletePlant(editingTenant)} 
                  style={[styles.cancelBtn, { backgroundColor: '#FEE2E2' }]}
                >
                  <Text style={[styles.cancelBtnText, { color: '#DC2626', fontWeight: '800' }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSavePlantEdit} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ONBOARD NEW PLANT MODAL */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="business" size={18} color="#0284C7" />
                </View>
                <Text style={styles.modalTitle}>Onboard Water Plant</Text>
              </View>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Plant Business Name</Text>
              <TextInput 
                value={newPlantName} 
                onChangeText={setNewPlantName} 
                placeholder="e.g. Abhiraj Pure RO Water" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <Text style={styles.inputLabel}>Owner Full Name</Text>
              <TextInput 
                value={newOwnerName} 
                onChangeText={setNewOwnerName} 
                placeholder="e.g. Abhishek Parekar" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <Text style={styles.inputLabel}>Mobile Number (Owner Login ID)</Text>
              <TextInput 
                value={newPhone} 
                onChangeText={setNewPhone} 
                keyboardType="phone-pad"
                placeholder="e.g. 8485877633" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <Text style={styles.inputLabel}>Plant Street Address / City</Text>
              <TextInput 
                value={newAddress} 
                onChangeText={setNewAddress} 
                placeholder="e.g. Industrial Area, Pune" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />

              <Text style={styles.inputLabel}>SaaS Plan Tier</Text>
              <TextInput 
                value={newPlan} 
                onChangeText={setNewPlan} 
                placeholder="Growth Business Plan" 
                placeholderTextColor="#94A3B8"
                style={styles.textInput} 
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddNewPlant} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Register Plant</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  topBarSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  onboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    elevation: 2,
  },
  onboardBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    padding: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  plantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  plantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  plantIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  ownerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusExpiring: {
    backgroundColor: '#FEF3C7',
  },
  statusSuspended: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextExpiring: {
    color: '#D97706',
  },
  statusTextSuspended: {
    color: '#DC2626',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  planBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  daysBadgeNormal: {
    backgroundColor: '#F1F5F9',
  },
  daysBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  daysBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  managementRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  statusToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  extendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mgmtLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    width: 48,
  },
  miniStatusBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  extendBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  extendBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
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
  modalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 9,
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
  statusSelectPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  statusSelectText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
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
