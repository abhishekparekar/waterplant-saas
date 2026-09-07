import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import '@/global.css';

// Disable Reanimated strict logger warnings (per Reanimated v3.x/v4.x docs)
try {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });
} catch (e) {}

// Keep the splash screen visible while assets or user auth are loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Hide splash screen once mounting is complete
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(owner)" options={{ headerShown: false }} />
        <Stack.Screen name="(helper)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="order" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}


