import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { inventoryService, InventoryItem } from '@/services/inventoryService';
import { useCustomerStore } from '@/store/customerStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type CategoryFilter = 'all' | 'jars' | 'parts' | 'accessories';

export default function InventoryScreen() {
  const [stock, setStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustVal, setAdjustVal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Add Product Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'jars' | 'parts' | 'accessories'>('jars');
  const [newQty, setNewQty] = useState('50');
  const [newUnit, setNewUnit] = useState('jars');
  const [newReorder, setNewReorder] = useState('20');
  const [savingItem, setSavingItem] = useState(false);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { customers, fetchCustomers } = useCustomerStore();

  const loadStock = async () => {
    try {
      setLoading(true);
      const items = await inventoryService.getAll();
      setStock(items);
    } catch (e) {
      console.error('Failed to load inventory from Firestore:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
    fetchCustomers();
  }, [fetchCustomers]);

  // Real calculation of jars in field from customer records
  const realJarsInField = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.emptyBottlesHeld || 0), 0);
  }, [customers]);

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCat && matchesSearch;
    });
  }, [stock, activeCategory, searchQuery]);

  // Real-time filled & empty tallies
  const filledCount = useMemo(() => {
    const item = stock.find(i => i.id === '1' || i.name.toLowerCase().includes('filled'));
    return item ? item.quantity : 0;
  }, [stock]);

  const emptyCount = useMemo(() => {
    const item = stock.find(i => i.id === '2' || i.name.toLowerCase().includes('empty'));
    return item ? item.quantity : 0;
  }, [stock]);

  const quickAdjust = async (id: string, delta: number) => {
    // Optimistic UI update
    setStock((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    );
    try {
      await inventoryService.adjustQuantity(id, delta);
    } catch (err: any) {
      Alert.alert('Sync Error', 'Could not sync stock change to Firestore.');
      loadStock();
    }
  };

  const handleAdjustStock = async (type: 'add' | 'subtract') => {
    if (!selectedItem) return;
    const value = parseInt(adjustVal);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid number greater than 0');
      return;
    }

    const delta = type === 'add' ? value : -value;
    const newQuantity = Math.max(0, selectedItem.quantity + delta);

    setStock((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, quantity: newQuantity } : item))
    );

    setModalVisible(false);
    setAdjustVal('');
    const targetItem = selectedItem;
    setSelectedItem(null);

    try {
      await inventoryService.updateQuantity(targetItem.id, newQuantity);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to save update to Cloud Firestore.');
      loadStock();
    }
  };

  const handleCreateProduct = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }

    const qty = parseInt(newQty) || 0;
    const reorder = parseInt(newReorder) || 10;

    setSavingItem(true);
    try {
      const added = await inventoryService.addItem({
        name: newName.trim(),
        category: newCategory,
        quantity: qty,
        unit: newUnit.trim() || 'units',
        reorderLevel: reorder
      });

      setStock((prev) => [...prev, added]);
      setAddModalVisible(false);
      setNewName('');
      setNewQty('50');
      Alert.alert('Product Created', `${newName} added to your live plant inventory.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create product.');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = (item: InventoryItem) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${item.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await inventoryService.deleteItem(item.id);
              setStock((prev) => prev.filter(i => i.id !== item.id));
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete product.');
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1 px-3 py-2.5"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStock} colors={['#0284c7']} />}
      >
        {/* 1. REAL-TIME CIRCULAR STOCK GAUGES */}
        <View className="flex-row gap-2 mb-3">
          {/* Gauge 1: Filled Stock */}
          <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 items-center shadow-2xs">
            <View className="w-14 h-14 rounded-full border-[3.5px] border-sky-600 border-t-sky-200 justify-center items-center my-0.5">
              <Text className="text-lg font-black text-slate-900 dark:text-slate-50">{filledCount}</Text>
            </View>
            <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-1 uppercase">
              Filled Ready
            </Text>
            <Text className="text-[10px] font-bold text-sky-600 dark:text-sky-400">20L Jars</Text>
          </View>

          {/* Gauge 2: Empty Jars */}
          <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 items-center shadow-2xs">
            <View className="w-14 h-14 rounded-full border-[3.5px] border-amber-500 border-t-amber-200 justify-center items-center my-0.5">
              <Text className="text-lg font-black text-slate-900 dark:text-slate-50">{emptyCount}</Text>
            </View>
            <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-1 uppercase">
              Empties in Plant
            </Text>
            <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Wash Queue</Text>
          </View>

          {/* Gauge 3: Real In Field Circulation from Customer Store */}
          <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 items-center shadow-2xs">
            <View className="w-14 h-14 rounded-full border-[3.5px] border-emerald-500 border-t-emerald-200 justify-center items-center my-0.5">
              <Text className="text-lg font-black text-slate-900 dark:text-slate-50">{realJarsInField}</Text>
            </View>
            <Text className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-1 uppercase">
              In Field
            </Text>
            <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">With Clients</Text>
          </View>
        </View>

        {/* 2. SEARCH & ADD PRODUCT ROW */}
        <View className="flex-row items-center gap-2 mb-2.5">
          <View className="flex-1 flex-row items-center bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <Ionicons name="search-outline" size={17} color="#94A3B8" />
            <TextInput 
              placeholder="Search products by name..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.85}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              elevation: 2,
              shadowColor: '#0284C7',
              shadowOffset: { width: 0, height: 1.5 },
              shadowOpacity: 0.25,
              shadowRadius: 3
            }}
          >
            <LinearGradient
              colors={['#0284C7', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: 13,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Ionicons name="add-circle" size={15} color="#FFF" />
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFF' }}>+ Add Item</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 3. CATEGORY FILTER CHIPS */}
        <View className="flex-row gap-1.5 mb-3">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'jars', label: 'Water Jars' },
            { id: 'parts', label: 'Caps & Seals' },
            { id: 'accessories', label: 'Stands & Units' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id as any)}
              className={`flex-1 py-1.5 rounded-xl items-center border ${
                activeCategory === cat.id 
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-xs font-bold ${activeCategory === cat.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. INVENTORY STOCK ITEMS LIST */}
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 pl-0.5">
          Live Inventory & Warehouse Stock
        </Text>

        {filteredStock.map((item) => {
          const isLow = item.quantity <= item.reorderLevel;
          return (
            <View 
              key={item.id} 
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-2.5 shadow-2xs"
            >
              <View className="flex-row justify-between items-start mb-1.5">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                    {item.name}
                  </Text>
                  <Text className="text-xs font-medium text-slate-400 mt-0.5">
                    Min Stock Threshold: {item.reorderLevel} {item.unit}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-xl font-black text-sky-600 dark:text-sky-400">
                    {item.quantity}
                  </Text>
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {item.unit}
                  </Text>
                </View>
              </View>

              {isLow && (
                <View className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl px-2.5 py-1 flex-row items-center gap-1.5 my-1.5">
                  <Ionicons name="warning" size={13} color="#D97706" />
                  <Text className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Low Stock Alert: Plant replenishment required.
                  </Text>
                </View>
              )}

              {/* Quick Adjustment Controls */}
              <View className="flex-row justify-between items-center pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-700/50">
                <View className="flex-row gap-1.5">
                  <TouchableOpacity
                    onPress={() => quickAdjust(item.id, -10)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 active:opacity-75"
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">-10</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => quickAdjust(item.id, 10)}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 active:opacity-75"
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs font-bold text-sky-700 dark:text-sky-300">+10</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => quickAdjust(item.id, 50)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 active:opacity-75"
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">+50</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <TouchableOpacity 
                    className="bg-slate-900 dark:bg-slate-700 px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:opacity-75"
                    onPress={() => {
                      setSelectedItem(item);
                      setModalVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={13} color="#FFF" />
                    <Text className="text-xs font-bold text-white">Custom</Text>
                  </TouchableOpacity>

                  {/* Allow deleting custom added products */}
                  {item.id !== '1' && item.id !== '2' && (
                    <TouchableOpacity 
                      onPress={() => handleDeleteItem(item)}
                      className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50"
                    >
                      <Ionicons name="trash-outline" size={15} color="#E11D48" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ADJUST STOCK CUSTOM MODAL */}
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
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8">
            <View className="flex-row justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
              <View>
                <Text className="text-[14px] font-black text-slate-900 dark:text-slate-50">
                  Adjust Inventory Stock
                </Text>
                <Text className="text-[10px] text-slate-400 mt-0.5">
                  {selectedItem?.name} (Current: {selectedItem?.quantity} {selectedItem?.unit})
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Input
              label="Units to Add or Subtract"
              placeholder="e.g. 25"
              value={adjustVal}
              onChangeText={setAdjustVal}
              keyboardType="number-pad"
            />

            <View className="flex-row gap-2.5 mt-3">
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => handleAdjustStock('subtract')}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#E11D48', '#BE123C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 42,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 4
                    }}
                  >
                    <Ionicons name="remove-circle-outline" size={16} color="#FFF" />
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>Deduct (-)</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => handleAdjustStock('add')}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 42,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 4
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#FFF" />
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>Add Stock (+)</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* + ADD NEW PRODUCT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Add New Product / Material
                </Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  Track stock of jars, caps, chemicals, or accessories
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setAddModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Product / Item Name *"
                placeholder="e.g. 1L Packaged Water Bottles"
                value={newName}
                onChangeText={setNewName}
              />

              {/* Category Select */}
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { id: 'jars', label: 'Water Jars' },
                  { id: 'parts', label: 'Caps & Parts' },
                  { id: 'accessories', label: 'Accessories' },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setNewCategory(c.id as any)}
                    className={`flex-1 py-2 rounded-xl border items-center ${
                      newCategory === c.id 
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${newCategory === c.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Initial Stock *"
                    placeholder="e.g. 100"
                    value={newQty}
                    onChangeText={setNewQty}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Unit Name"
                    placeholder="e.g. jars, boxes"
                    value={newUnit}
                    onChangeText={setNewUnit}
                  />
                </View>
              </View>

              <Input
                label="Low Stock Warning Level"
                placeholder="e.g. 20"
                value={newReorder}
                onChangeText={setNewReorder}
                keyboardType="number-pad"
              />

              <View className="flex-row gap-2.5 mt-3">
                <View className="flex-1">
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setAddModalVisible(false)}
                    style={{ height: 42 }}
                  />
                </View>
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={handleCreateProduct}
                    disabled={savingItem}
                    activeOpacity={0.85}
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={['#0284C7', '#0EA5E9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: 42,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 5
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFF' }}>
                        {savingItem ? 'Saving...' : 'Save Product'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
