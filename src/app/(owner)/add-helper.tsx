import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStaffStore } from '@/store/staffStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { StaffMember, StaffStatus } from '@/types/staff';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function StaffManagementScreen() {
  const { staffList, loading, fetchStaff, addStaff, updateStaff, toggleStaffStatus, deleteStaff } = useStaffStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Create Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('water123');
  const [role, setRole] = useState<'driver' | 'helper'>('driver');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [assignedRoute, setAssignedRoute] = useState('');
  const [salaryOrCommission, setSalaryOrCommission] = useState('₹14,000 / mo');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'driver' | 'helper' | 'manager'>('driver');
  const [editVehicle, setEditVehicle] = useState('');
  const [editRoute, setEditRoute] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editStatus, setEditStatus] = useState<StaffStatus>('active');
  const [savingEdit, setSavingEdit] = useState(false);

  // PIN Modal
  const [pinModalStaff, setPinModalStaff] = useState<StaffMember | null>(null);
  const [generatedPin, setGeneratedPin] = useState('8492');

  // Filter & Search State
  const [filterTab, setFilterTab] = useState<'all' | 'driver' | 'helper' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const activeCount = staffList.filter(s => s.status === 'active').length;
  const stoppedCount = staffList.filter(s => s.status === 'inactive').length;
  const driversCount = staffList.filter(s => s.role === 'driver').length;
  const helpersCount = staffList.filter(s => s.role === 'helper').length;
  const totalTodayDeliveries = staffList.reduce((acc, s) => acc + (s.todayDeliveries || 0), 0);

  const filteredStaffList = staffList.filter((s) => {
    if (filterTab === 'driver' && s.role !== 'driver') return false;
    if (filterTab === 'helper' && s.role !== 'helper') return false;
    if (filterTab === 'inactive' && s.status !== 'inactive') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (s.name || '').toLowerCase().includes(q) ||
                    (s.phone || '').includes(q) ||
                    (s.vehicleNumber || '').toLowerCase().includes(q) ||
                    (s.assignedRoute || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('water123');
    setRole('driver');
    setVehicleNumber('');
    setAssignedRoute('');
    setSalaryOrCommission('₹14,000 / mo');
    setAddress('');
    setCreateModalVisible(true);
  };

  const handleCreateStaff = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Name, Mobile, Login Email, and Password are required.');
      return;
    }

    setSubmitting(true);
    try {
      await addStaff({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        status: 'active',
        vehicleNumber: vehicleNumber.trim() || 'Plant Tempo',
        assignedRoute: assignedRoute.trim() || 'All Plant Routes',
        salaryOrCommission: salaryOrCommission.trim(),
        address: address.trim(),
        ownerId: user?.uid || 'owner_1',
        businessName: user?.businessName || 'Abhiraj Water Plant',
        totalDeliveriesCompleted: 0,
        todayDeliveries: 0,
      });

      Alert.alert('Staff Created', `Logistics ${role} ${name} added successfully!`);
      setCreateModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditName(staff.name);
    setEditPhone(staff.phone);
    setEditEmail(staff.email);
    setEditPassword(staff.password || 'water123');
    setEditRole(staff.role || 'driver');
    setEditVehicle(staff.vehicleNumber || '');
    setEditRoute(staff.assignedRoute || '');
    setEditSalary(staff.salaryOrCommission || '');
    setEditStatus(staff.status);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    if (!editName.trim() || !editPhone.trim() || !editEmail.trim()) {
      Alert.alert('Validation Error', 'Name, Mobile, and Email are required.');
      return;
    }

    setSavingEdit(true);
    try {
      await updateStaff(selectedStaff.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim().toLowerCase(),
        password: editPassword.trim(),
        role: editRole,
        vehicleNumber: editVehicle.trim(),
        assignedRoute: editRoute.trim(),
        salaryOrCommission: editSalary.trim(),
        status: editStatus,
      });

      Alert.alert('Updated', 'Staff credentials and details updated successfully.');
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update staff.');
    } finally {
      setSavingEdit(false);
    }
  };


  const handleToggleStatus = (staff: StaffMember) => {
    const nextStatus = staff.status === 'active' ? 'inactive' : 'active';
    toggleStaffStatus(staff.id, nextStatus);
    Alert.alert('Status Updated', `${staff.name} is now ${nextStatus === 'active' ? 'ACTIVE (On Duty)' : 'STOPPED (Inactive)'}.`);
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${staff.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => deleteStaff(staff.id)
        }
      ]
    );
  };

  // Generate Quick Driver Auth PIN
  const handleGenerateDriverPin = (staff: StaffMember) => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(randomPin);
    setPinModalStaff(staff);
  };

  // WhatsApp Credentials Slip Share
  const handleShareCredentialsWhatsApp = (staff: StaffMember) => {
    const cleanPhone = staff.phone.replace(/[^0-9]/g, '');
    const plantName = user?.businessName || 'NextWater Plant';
    const text = 
      `*🚚 ${plantName.toUpperCase()} - DRIVER LOGIN CREDENTIALS*\n\n` +
      `Hello ${staff.name},\n` +
      `Here are your official login details for the NextWater Driver App:\n\n` +
      `👤 *Staff Name:* ${staff.name}\n` +
      `📱 *Login Email:* ${staff.email}\n` +
      `🔑 *Login Password:* ${staff.password || 'water123'}\n` +
      `🚐 *Vehicle:* ${staff.vehicleNumber || 'Plant Tempo'}\n` +
      `📍 *Assigned Route:* ${staff.assignedRoute || 'Main Area'}\n\n` +
      `_Download NextWater App and sign in to access your daily delivery runs._`;

    Linking.openURL(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    });
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP STAFF METRICS BAR */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3.5 pt-2.5 pb-3">
        <View className="flex-row gap-2 mb-2.5">
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-2.5">
            <Text className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">Total Staff</Text>
            <Text className="text-xl font-black text-sky-950 dark:text-sky-100 mt-0.5">{staffList.length}</Text>
            <Text className="text-[10px] text-sky-600 dark:text-sky-400 font-bold mt-0.5">{activeCount} On Duty</Text>
          </View>

          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2.5">
            <Text className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Drivers</Text>
            <Text className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">{driversCount}</Text>
            <Text className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Assigned Fleet</Text>
          </View>

          <View className="flex-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl p-2.5">
            <Text className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">Helpers</Text>
            <Text className="text-xl font-black text-teal-950 dark:text-teal-100 mt-0.5">{helpersCount}</Text>
            <Text className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-0.5">Route Helpers</Text>
          </View>

          <View className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-2.5">
            <Text className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Paused</Text>
            <Text className="text-xl font-black text-rose-950 dark:text-rose-100 mt-0.5">{stoppedCount}</Text>
            <Text className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">Inactive</Text>
          </View>
        </View>

        {/* Add Staff Header Action with Rectangular LinearGradient Button */}
        <TouchableOpacity
          onPress={handleOpenCreate}
          style={{
            height: 40,
            borderRadius: 8,
            overflow: 'hidden',
            elevation: 3,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            marginBottom: 8,
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#0284C7', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
          >
            <Ionicons name="person-add" size={16} color="#FFF" />
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 }}>
              + Add New Delivery Staff / Driver
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Search Staff Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          borderRadius: 8,
          paddingHorizontal: 10,
          height: 38,
          marginBottom: 8,
        }}>
          <Ionicons name="search" size={16} color="#64748B" style={{ marginRight: 6 }} />
          <TextInput
            style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#0F172A', paddingVertical: 0 }}
            placeholder="Search staff by name, phone, vehicle, or route..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs Row */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[
            { key: 'all', label: `All (${staffList.length})` },
            { key: 'driver', label: `Drivers (${driversCount})` },
            { key: 'helper', label: `Helpers (${helpersCount})` },
            { key: 'inactive', label: `Paused (${stoppedCount})` },
          ].map((tab) => {
            const isSelected = filterTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilterTab(tab.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#0284C7' : '#F1F5F9',
                  borderWidth: 1,
                  borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                }}
                activeOpacity={0.75}
              >
                <Text style={{
                  fontSize: 10.5,
                  fontWeight: '900',
                  color: isSelected ? '#FFFFFF' : '#64748B',
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. STAFF LISTING */}
      <ScrollView 
        className="flex-1 px-3.5 py-3" 
        contentContainerStyle={{ paddingBottom: 85 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStaff} colors={['#0284c7']} />}
      >
        <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
          Plant Delivery Staff & Logistics ({filteredStaffList.length})
        </Text>

        <View className="gap-3">
          {filteredStaffList.map((staff) => {
            const isActive = staff.status === 'active';

            return (
              <View 
                key={staff.id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm"
              >
                {/* Header Row */}
                <View className="flex-row justify-between items-start mb-2.5">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 justify-center items-center mr-2.5">
                      <Ionicons name={staff.role === 'driver' ? "bus" : "person"} size={22} color="#0D9488" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">
                          {staff.name}
                        </Text>
                        <View className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80">
                          <Text className="text-[9.5px] font-black text-teal-800 dark:text-teal-300 uppercase">
                            {staff.role}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        📞 {staff.phone} • {staff.email}
                      </Text>
                    </View>
                  </View>

                  {/* Active / Stop Toggle Switch */}
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(staff)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className={`px-3 py-1.5 rounded-lg flex-row items-center gap-1 border ${
                      isActive 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : 'bg-rose-600 border-rose-600'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={isActive ? "checkmark-circle" : "pause-circle"} 
                      size={13} 
                      color="#FFFFFF" 
                    />
                    <Text className="text-[10px] font-black uppercase text-white tracking-wide">
                      {isActive ? 'Active (ON)' : 'Stopped (OFF)'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Assignment & Salary Details Box */}
                <View className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl mb-2.5 border border-slate-100 dark:border-slate-800 gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</Text>
                    <Text className="text-xs font-black text-slate-800 dark:text-slate-200">{staff.vehicleNumber || 'Tempo 1'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Route</Text>
                    <Text className="text-xs font-bold text-sky-600 dark:text-sky-400">{staff.assignedRoute || 'Main Area'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary / Pay</Text>
                    <Text className="text-xs font-black text-emerald-600">{staff.salaryOrCommission || '₹14,000 / mo'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Drops</Text>
                    <Text className="text-xs font-black text-sky-600">{staff.todayDeliveries || 0} Jars Completed</Text>
                  </View>
                </View>

                {/* Action Buttons in Rectangular Format */}
                <View className="flex-row items-center gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                  {/* WhatsApp Credentials with Rectangular LinearGradient */}
                  <TouchableOpacity
                    onPress={() => handleShareCredentialsWhatsApp(staff)}
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 7,
                      overflow: 'hidden',
                      elevation: 2,
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}
                    activeOpacity={0.82}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}
                    >
                      <Ionicons name="logo-whatsapp" size={14} color="#FFF" />
                      <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>Share Login</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Auth PIN with Rectangular LinearGradient */}
                  <TouchableOpacity
                    onPress={() => handleGenerateDriverPin(staff)}
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 7,
                      overflow: 'hidden',
                      elevation: 2,
                      shadowColor: '#D97706',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}
                    activeOpacity={0.82}
                  >
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}
                    >
                      <Ionicons name="key-outline" size={14} color="#FFF" />
                      <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>Auth PIN</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Edit */}
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(staff)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 7,
                      backgroundColor: '#E0F2FE',
                      borderWidth: 1,
                      borderColor: '#BAE6FD',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="create-outline" size={16} color="#0284C7" />
                  </TouchableOpacity>

                  {/* Call */}
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${staff.phone}`).catch(() => {})}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 7,
                      backgroundColor: '#ECFDF5',
                      borderWidth: 1,
                      borderColor: '#A7F3D0',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="call" size={15} color="#059669" />
                  </TouchableOpacity>

                  {/* Delete */}
                  <TouchableOpacity
                    onPress={() => handleDeleteStaff(staff)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 7,
                      backgroundColor: '#FFE4E6',
                      borderWidth: 1,
                      borderColor: '#FECDD3',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="trash-outline" size={15} color="#E11D48" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* CREATE STAFF MODAL */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">Register Delivery Staff Member</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Staff / Driver Full Name *"
                placeholder="e.g. Ramesh Driver"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Mobile Phone Number *"
                placeholder="e.g. 9822001122"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="Staff Login Email Address *"
                placeholder="e.g. ramesh@driver.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Staff Login Password *"
                placeholder="set login password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {/* Role Selection */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Role *
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { key: 'driver', label: 'Driver', icon: 'bicycle' },
                  { key: 'helper', label: 'Route Helper', icon: 'person' },
                  { key: 'manager', label: 'Supervisor', icon: 'shield-checkmark' }
                ].map((r) => {
                  const isSel = role === r.key;
                  return (
                    <TouchableOpacity
                      key={r.key}
                      onPress={() => setRole(r.key as any)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: isSel ? '#0284C7' : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: isSel ? '#0284C7' : '#CBD5E1',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                      activeOpacity={0.75}
                    >
                      <Ionicons name={r.icon as any} size={14} color={isSel ? '#FFF' : '#64748B'} />
                      <Text style={{ fontSize: 11, fontWeight: '900', color: isSel ? '#FFF' : '#475569' }}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Assigned Vehicle (Tempo / Van)"
                placeholder="e.g. MH-12-AB-4050"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
              />

              <Input
                label="Assigned Delivery Route / Area"
                placeholder="e.g. Route 1: Sector 4 & MIDC"
                value={assignedRoute}
                onChangeText={setAssignedRoute}
              />

              <Input
                label="Salary / Commission"
                placeholder="e.g. ₹14,000 / mo"
                value={salaryOrCommission}
                onChangeText={setSalaryOrCommission}
              />

              <Input
                label="Staff Address"
                placeholder="e.g. Sector 4, Water Hub"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
              />

              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => setCreateModalVisible(false)}
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
                  onPress={handleCreateStaff}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#0284C7',
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0284C7', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="person-add" size={15} color="#FFF" />
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                          Add Staff Member
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EDIT STAFF MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50">Edit Staff Profile & Credentials</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Full Name *"
                value={editName}
                onChangeText={setEditName}
              />

              <Input
                label="Mobile Phone *"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="Staff Login Email *"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Staff Login Password *"
                value={editPassword}
                onChangeText={setEditPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {/* Edit Role Selection */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Role *
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { key: 'driver', label: 'Driver', icon: 'bicycle' },
                  { key: 'helper', label: 'Route Helper', icon: 'person' },
                  { key: 'manager', label: 'Supervisor', icon: 'shield-checkmark' }
                ].map((r) => {
                  const isSel = editRole === r.key;
                  return (
                    <TouchableOpacity
                      key={r.key}
                      onPress={() => setEditRole(r.key as any)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: isSel ? '#0284C7' : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: isSel ? '#0284C7' : '#CBD5E1',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                      activeOpacity={0.75}
                    >
                      <Ionicons name={r.icon as any} size={14} color={isSel ? '#FFF' : '#64748B'} />
                      <Text style={{ fontSize: 11, fontWeight: '900', color: isSel ? '#FFF' : '#475569' }}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Assigned Vehicle"
                value={editVehicle}
                onChangeText={setEditVehicle}
              />

              <Input
                label="Assigned Delivery Route"
                value={editRoute}
                onChangeText={setEditRoute}
              />

              <Input
                label="Salary / Commission"
                value={editSalary}
                onChangeText={setEditSalary}
              />

              {/* Status Switch in Edit */}
              <Text className="text-xs font-bold text-slate-400 uppercase mb-1.5">Staff Working Status</Text>
              <View className="flex-row gap-2 mb-4">
                <TouchableOpacity
                  onPress={() => setEditStatus('active')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    backgroundColor: editStatus === 'active' ? '#ECFDF5' : '#F8FAFC',
                    borderColor: editStatus === 'active' ? '#10B981' : '#CBD5E1',
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 12, fontWeight: '900', color: editStatus === 'active' ? '#047857' : '#64748B' }}>
                    Active (On Duty)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setEditStatus('inactive')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    backgroundColor: editStatus === 'inactive' ? '#FFF1F2' : '#F8FAFC',
                    borderColor: editStatus === 'inactive' ? '#F43F5E' : '#CBD5E1',
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 12, fontWeight: '900', color: editStatus === 'inactive' ? '#BE123C' : '#64748B' }}>
                    Stop / Inactive
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2 mt-1">
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
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
                  onPress={handleSaveEdit}
                  disabled={savingEdit}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#0284C7',
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0284C7', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                  >
                    {savingEdit ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={15} color="#FFF" />
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>
                          Save Changes
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DRIVER AUTH PIN MODAL */}
      <Modal
        visible={!!pinModalStaff}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPinModalStaff(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl items-center">
            <View className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 items-center justify-center mb-2">
              <Ionicons name="key" size={24} color="#D97706" />
            </View>
            <Text className="text-base font-black text-slate-900 dark:text-slate-50 text-center">
              Driver Quick Auth PIN
            </Text>
            <Text className="text-xs text-slate-400 text-center mt-1">
              One-time driver sign-in PIN for {pinModalStaff?.name}
            </Text>

            <View className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-amber-500 py-3.5 px-8 rounded-2xl my-3.5">
              <Text className="text-3xl font-black text-amber-600 tracking-widest font-mono">
                {generatedPin}
              </Text>
            </View>

            <View className="flex-row gap-2 w-full">
              <TouchableOpacity
                onPress={() => {
                  if (pinModalStaff) {
                    const cleanPhone = pinModalStaff.phone.replace(/[^0-9]/g, '');
                    const plant = user?.businessName || 'NextWater Plant';
                    const msg = `Hello ${pinModalStaff.name}, your driver quick sign-in PIN for ${plant} is: *${generatedPin}*`;
                    Linking.openURL(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`).catch(() => {});
                  }
                }}
                className="flex-1 h-11 rounded-xl overflow-hidden shadow-sm shadow-emerald-600/20"
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-full h-full flex-row items-center justify-center gap-1.5"
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
                  <Text className="text-xs font-black text-white">Send on WhatsApp</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPinModalStaff(null)}
                className="px-5 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 items-center justify-center"
              >
                <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
