import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Customer } from '@/types/customer';
import { formatCurrency } from '@/utils/invoiceUtils';

interface CustomerCardProps {
  customer: Customer;
  onPress?: () => void;
  onCallPress?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ 
  customer, 
  onPress,
  onCallPress 
}) => {
  const hasDues = customer.balance > 0;

  const handleCall = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      Linking.openURL(`tel:${customer.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(customer.name)},%20this%20is%20NextWater%20Plant.`).catch(() => {});
  };

  return (
    <TouchableOpacity 
      className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 mb-2.5 shadow-2xs active:opacity-75"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {/* Top Header: Avatar, Name, Phone & Direct Contact Icons */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 pr-2">
          {/* Avatar */}
          <View className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/60 justify-center items-center mr-2.5">
            <Text className="text-sky-700 dark:text-sky-300 font-black text-sm">
              {customer.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-[14.5px] font-black text-slate-900 dark:text-slate-50 leading-tight" numberOfLines={1}>
              {customer.name}
            </Text>
            <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {customer.phone}
            </Text>
          </View>
        </View>
        
        {/* Actions with LinearGradient */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <TouchableOpacity 
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              elevation: 2,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.25,
              shadowRadius: 2
            }}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: 34,
                height: 34,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              elevation: 2,
              shadowColor: '#0284C7',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.25,
              shadowRadius: 2
            }}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#0284C7', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: 34,
                height: 34,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Address Pill */}
      <View className="flex-row items-center gap-1.5 mb-2.5 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <Ionicons name="location-outline" size={13} color="#0284c7" />
        <Text className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
          {customer.address}
        </Text>
      </View>

      {/* Bottom Ledger Metrics */}
      <View className="flex-row justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="cube-outline" size={13} color="#64748B" />
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {customer.emptyBottlesHeld || 0} Jars
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="shield-outline" size={13} color="#059669" />
            <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(customer.depositPaid || 0)} Dep.
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Text className="text-3xs font-black text-slate-400 uppercase tracking-wider">
            {hasDues ? 'Dues' : 'Balance'}:
          </Text>
          <Text className={`text-xs font-black ${hasDues ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(Math.abs(customer.balance || 0))}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomerCard;
