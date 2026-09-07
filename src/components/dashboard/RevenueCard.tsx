import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/invoiceUtils';

interface RevenueCardProps {
  amount: number;
  outstandingAmount: number;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({ amount, outstandingAmount }) => {
  return (
    <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm mb-4">
      <View className="flex-row items-center mb-4 gap-3">
        <View className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/30 justify-center items-center">
          <Ionicons name="wallet-outline" size={20} className="text-primary" color="#0D9488" />
        </View>
        <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          Total Balance & Earnings
        </Text>
      </View>
      
      <View className="mb-4">
        <Text className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          {formatCurrency(amount)}
        </Text>
        <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
          Total Collected Revenue
        </Text>
      </View>

      <View className="h-px bg-slate-100 dark:bg-slate-700/50 my-2" />

      <View className="flex-row justify-between pt-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-amber-500 dark:text-amber-400">
            {formatCurrency(outstandingAmount)}
          </Text>
          <Text className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            Uncollected Dues
          </Text>
        </View>
        
        <View className="flex-1 items-end">
          <Text className="text-lg font-bold text-emerald-500">
            +12.4%
          </Text>
          <Text className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            MoM Growth
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RevenueCard;
