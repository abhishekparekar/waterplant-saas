import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  message: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  iconName = 'cube-outline' 
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <Ionicons name={iconName} size={56} className="text-slate-400 dark:text-slate-600 mb-4" />
      <Text className="text-base text-slate-500 dark:text-slate-400 text-center leading-relaxed font-medium">
        {message}
      </Text>
    </View>
  );
};

export default EmptyState;
