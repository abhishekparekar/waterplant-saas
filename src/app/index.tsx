import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { 
  View, 
  Text, 
  Image, 
  Animated, 
  Easing, 
  StatusBar,
  ActivityIndicator,
  useColorScheme,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

export default function IndexScreen() {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const rootNavState = useRootNavigationState();
  const [showSplash, setShowSplash] = useState(true);
  const isDark = useColorScheme() === 'dark';

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for water drop icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.12,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!rootNavState?.key) return; // Wait until Expo Router is mounted

    if (!loading && !showSplash) {
      if (isAuthenticated) {
        if (role === 'superadmin') {
          router.replace('/(admin)/dashboard');
        } else if (role === 'owner') {
          router.replace(ROUTES.OWNER.DASHBOARD);
        } else if (role === 'helper') {
          router.replace(ROUTES.HELPER.DASHBOARD);
        } else if (role === 'customer') {
          router.replace('/(customer)/dashboard');
        } else {
          router.replace(ROUTES.OWNER.DASHBOARD);
        }
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [rootNavState?.key, isAuthenticated, role, loading, showSplash, router]);

  return (
    <LinearGradient
      colors={isDark ? ['#070F26', '#0E1F47', '#08122B'] : ['#F0F9FF', '#FFFFFF', '#E0F2FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Brand Pill */}
      <Animated.View style={[styles.topPill, { opacity: contentOpacity }]}>
        <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
          <Ionicons name="water" size={14} color="#0284C7" />
        </Animated.View>
        <Text style={styles.topPillText}>Smart Water Plant System</Text>
      </Animated.View>

      {/* Center Branding & Logo */}
      <View style={styles.centerBox}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }]
            }
          ]}
        >
          <Image 
            source={require('../../assets/images/logo1_transparent.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={{ opacity: contentOpacity, alignItems: 'center' }}>
          <Text style={[styles.title, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            NextWater Plant Management
          </Text>
          <Text style={styles.subtitle}>
            Pure Water • Smart Logistics • Enterprise Platform
          </Text>
          
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color="#0284C7" />
            <Text style={[styles.loadingText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Connecting to secure cloud...
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Footer */}
      <Animated.View 
        style={[
          styles.footer, 
          { 
            opacity: contentOpacity,
            borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          }
        ]}
      >
        <Text style={[styles.footerSub, { color: isDark ? '#64748B' : '#94A3B8' }]}>
          ENTERPRISE WATER CLOUD ARCHITECTURE
        </Text>
        <Text style={[styles.footerBrand, { color: isDark ? '#CBD5E1' : '#475569' }]}>
          NextWater SaaS v1.0.0
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 56,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    marginTop: 8,
  },
  topPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerBox: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 250,
    height: 160,
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  loaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerSub: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  footerBrand: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
