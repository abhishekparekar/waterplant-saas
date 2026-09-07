import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionProps {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  color?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({ 
  title, 
  iconName, 
  onPress,
  color = '#0D9488'
}) => {
  return (
    <TouchableOpacity 
      className="flex-1 items-center py-4 px-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl gap-2 shadow-2xs active:opacity-75"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View 
        className="w-12 h-12 rounded-full justify-center items-center"
        style={{ backgroundColor: `${color}10` }}
      >
        <Ionicons name={iconName} size={22} color={color} />
      </View>
      <Text className="text-xs font-semibold text-slate-800 dark:text-slate-100 text-center tracking-wide" numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default QuickAction;
