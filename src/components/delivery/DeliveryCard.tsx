import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
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
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', label: 'Delivered' };
      case 'in_progress':
        return { bg: 'bg-sky-50 dark:bg-sky-950/50', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-700 dark:text-sky-300', label: 'In Transit' };
      case 'failed':
        return { bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', label: 'Failed' };
      default:
        return { bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', label: 'Scheduled' };
    }
  };

  const badge = getStatusBadge();
  const phone = delivery.customerPhone;

  return (
    <View 
      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm"
    >
      {/* Header Row: Customer Name & Status Badge */}
      <View className="flex-row justify-between items-start mb-1.5">
        <View className="flex-1 mr-2">
          <Text className="text-[15px] font-black text-slate-900 dark:text-slate-50" numberOfLines={1}>
            {delivery.customerName}
          </Text>
          <Text className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            📅 {formatDate(delivery.scheduledDate)}
          </Text>
        </View>

        <View className={`px-2.5 py-0.5 rounded-md border ${badge.bg} ${badge.border}`}>
          <Text className={`text-[10px] font-black uppercase tracking-wider ${badge.text}`}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Address / Route Info if present */}
      {delivery.customerAddress && (
        <View className="flex-row items-center gap-1.5 mb-2">
          <Ionicons name="location-sharp" size={13} color="#0D9488" />
          <Text className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300 flex-1" numberOfLines={1}>
            {delivery.customerAddress}
          </Text>
        </View>
      )}

      {/* Delivery Bottles & Price Box */}
      <View className="bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl my-1.5 flex-row items-center justify-between border border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="cube" size={15} color="#0284C7" />
          <Text className="text-xs font-black text-slate-800 dark:text-slate-200">
            {delivery.bottlesDelivered} Jars (20L)
          </Text>
        </View>

        {delivery.status === 'completed' ? (
          <Text className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            Collected: {formatCurrency(delivery.cashCollected)}
          </Text>
        ) : (
          <View className="flex-row items-center gap-1">
            <Text className="text-[10.5px] font-bold text-slate-400">Drop Stop</Text>
          </View>
        )}
      </View>

      {/* Completed State: Returned Jars & Status */}
      {delivery.status === 'completed' && (
        <View className="flex-row justify-between items-center pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/50">
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Empty Jars Returned: <Text className="font-black text-slate-800 dark:text-slate-200">{delivery.emptyBottlesReturned}</Text>
          </Text>
          <Text className="text-[10px] font-black text-emerald-600 uppercase">
            ✓ Logged to inventory
          </Text>
        </View>
      )}

      {/* Actions Row: Call Customer + WhatsApp Customer + Complete Drop-off */}
      {delivery.status !== 'completed' && delivery.status !== 'failed' && (
        <View className="flex-row items-center gap-2 mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/40">
          {phone ? (
            <>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${phone}`).catch(() => {})}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 7,
                  backgroundColor: '#ECFDF5',
                  borderWidth: 1,
                  borderColor: '#A7F3D0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="call" size={16} color="#059669" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/91${phone.replace(/[^0-9]/g, '')}?text=Hello%2C%20NextWater%20driver%20is%20on%20the%20way%20with%20your%20water%20jar%20delivery.`).catch(() => {})}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 7,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
              </TouchableOpacity>
            </>
          ) : null}

          {onCompletePress && (
            <TouchableOpacity 
              onPress={onCompletePress}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 8,
                overflow: 'hidden',
                elevation: 2,
                shadowColor: '#0D9488',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
            >
              <LinearGradient
                colors={['#0D9488', '#0F766E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
              >
                <Ionicons name="checkmark-done" size={16} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.2 }}>
                  Complete Drop-off & Return Jars
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default DeliveryCard;

