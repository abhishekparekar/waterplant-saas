import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

export default function OrderLayout() {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="create" options={{ title: 'Delivery Entry' }} />
      <Stack.Screen name="[id]" options={{ title: 'Order Details' }} />
    </Stack>
  );
}
