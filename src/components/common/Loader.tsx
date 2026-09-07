import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export const Loader: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  );
};

export default Loader;
