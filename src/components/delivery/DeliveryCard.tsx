import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Delivery } from '@/types/delivery';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/invoiceUtils';

interface DeliveryCardProps {
  delivery: Delivery;
  onPress?: () => void;
  onCompletePress?: () => void;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ 
  delivery, 
  onPress,
  onCompletePress
}) => {
  const getStatusBadge = () => {
    switch (delivery.status) {
      case 'completed':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400', label: 'Delivered' };
      case 'in_progress':
        return { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-600 dark:text-sky-400', label: 'In Transit' };
      case 'failed':
        return { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-600 dark:text-rose-400', label: 'Failed' };
      default:
        return { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-400', label: 'Scheduled' };
    }
  };

  const badge = getStatusBadge();

  return (
    <TouchableOpacity 
      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-3 shadow-2xs active:opacity-80"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-base font-black text-slate-900 dark:text-slate-50">
            {delivery.customerName}
          </Text>
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            📅 {formatDate(delivery.scheduledDate)}
          </Text>
        </View>

        <View className={`px-2.5 py-1 rounded-full ${badge.bg}`}>
          <Text className={`text-3xs font-black uppercase tracking-wider ${badge.text}`}>
            {badge.label}
          </Text>
        </View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl my-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="cube" size={15} color="#0284c7" />
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {delivery.bottlesDelivered} Jars to Deliver
          </Text>
        </View>

        {delivery.status === 'completed' && (
          <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Collected: {formatCurrency(delivery.cashCollected)}
          </Text>
        )}
      </View>

      {delivery.status === 'completed' && (
        <View className="flex-row justify-between items-center pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/50">
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Empty Jars Returned: <Text className="font-bold text-slate-800 dark:text-slate-200">{delivery.emptyBottlesReturned}</Text>
          </Text>
          <Text className="text-3xs font-bold text-emerald-600 uppercase">
            ✓ Logged to inventory
          </Text>
        </View>
      )}

      {delivery.status !== 'completed' && delivery.status !== 'failed' && onCompletePress && (
        <TouchableOpacity 
          onPress={onCompletePress}
          activeOpacity={0.85}
          className="mt-3 overflow-hidden rounded-xl shadow-xs"
        >
          <LinearGradient
            colors={['#0D9488', '#0F766E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-11 flex-row justify-center items-center gap-2"
          >
            <Ionicons name="checkmark-done" size={16} color="#FFF" />
            <Text className="text-white text-xs font-black tracking-wide">Complete Drop-off & Collect</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default DeliveryCard;
