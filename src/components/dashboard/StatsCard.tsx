import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  iconName,
  iconColor = '#0D9488'
}) => {
  return (
    <View className="flex-1 flex-row items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl gap-3.5 shadow-2xs min-w-[140px]">
      <View 
        className="w-11 h-11 rounded-xl justify-center items-center"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">{value}</Text>
        <Text className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5" numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
};

export default StatsCard;
