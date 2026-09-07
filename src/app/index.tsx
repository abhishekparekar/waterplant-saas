import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { 
  View, 
  Text, 
  Image, 
  Animated, 
  Easing, 
  StatusBar, 
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const rootNavState = useRootNavigationState();

  const [loadingPhase, setLoadingPhase] = useState('Initializing Next WaterPlant Cloud...');
  const [splashFinished, setSplashFinished] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale1 = useRef(new Animated.Value(0.85)).current;
  const rippleOpacity1 = useRef(new Animated.Value(0.6)).current;
  const rippleScale2 = useRef(new Animated.Value(0.85)).current;
  const rippleOpacity2 = useRef(new Animated.Value(0.4)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo Scale & Fade
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 650,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Ripple Rings Animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(rippleScale1, {
            toValue: 1.35,
            duration: 1900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleScale1, {
            toValue: 0.85,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(rippleOpacity1, {
            toValue: 0,
            duration: 1900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity1, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(rippleScale2, {
              toValue: 1.48,
              duration: 1900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rippleScale2, {
              toValue: 0.85,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(rippleOpacity2, {
              toValue: 0,
              duration: 1900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rippleOpacity2, {
              toValue: 0.4,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }, 400);

    // 3. Gentle Floating Motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Progress Bar Fill
    Animated.timing(progressBarWidth, {
      toValue: 100,
      duration: 1900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // 5. Phase Transitions
    const p1 = setTimeout(() => {
      setLoadingPhase('Securing Encrypted Workspace...');
    }, 650);

    const p2 = setTimeout(() => {
      setLoadingPhase('Synchronizing Plant Operations...');
    }, 1300);

    const finishTimer = setTimeout(() => {
      setSplashFinished(true);
    }, 2100);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(finishTimer);
    };
  }, []);

  // Smooth Routing after splash sequence finishes
  useEffect(() => {
    if (!rootNavState?.key) return;
    if (loading || !splashFinished) return;

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
  }, [rootNavState?.key, isAuthenticated, role, loading, splashFinished, router]);

  const progressInterpolation = progressBarWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#020817', '#0A2540', '#0369A1', '#06182C']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Header Badge */}
      <Animated.View style={[styles.topBadgeRow, { opacity: textOpacity }]}>
        <View style={styles.topBadge}>
          <View style={styles.liveDot} />
          <Ionicons name="water" size={13} color="#38BDF8" />
          <Text style={styles.topBadgeText}>NEXT WATERPLANT ENTERPRISE</Text>
        </View>
      </Animated.View>

      {/* Center Core: Ripple Waves + Circle Logo + Typography */}
      <View style={styles.centerContainer}>
        {/* Ripple Wave 2 */}
        <Animated.View 
          style={[
            styles.rippleCircle, 
            {
              transform: [{ scale: rippleScale2 }],
              opacity: rippleOpacity2,
            }
          ]} 
        />

        {/* Ripple Wave 1 */}
        <Animated.View 
          style={[
            styles.rippleCircle, 
            {
              transform: [{ scale: rippleScale1 }],
              opacity: rippleOpacity1,
            }
          ]} 
        />

        {/* Circular Emblem Frame */}
        <Animated.View
          style={[
            styles.emblemWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: floatAnim }
              ]
            }
          ]}
        >
          <View style={styles.emblemCircle}>
            <Image 
              source={require('../../assets/images/circle_icon.png')} 
              style={styles.circleLogoImage} 
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand Titles */}
        <Animated.View style={[styles.brandTextContainer, { opacity: textOpacity }]}>
          <Text style={styles.brandTitle}>
            Next WaterPlant
          </Text>

          <Text style={styles.brandTagline}>
            Smart Water Plant Operations & Logistics ERP
          </Text>

          {/* High-Tech Animated Loading Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarTrack}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  { width: progressInterpolation }
                ]}
              >
                <LinearGradient
                  colors={['#38BDF8', '#0284C7', '#60A5FA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={14} color="#34D399" />
              <Text style={styles.statusText}>
                {loadingPhase}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Footer Architecture Seal */}
      <Animated.View style={[styles.footerContainer, { opacity: textOpacity }]}>
        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark" size={12} color="#38BDF8" />
          <Text style={styles.footerText}>
            256-BIT SSL ENCRYPTED
          </Text>
          <Text style={styles.footerBullet}>•</Text>
          <Text style={styles.footerText}>
            99.9% CLOUD UPTIME
          </Text>
        </View>
        <Text style={styles.versionText}>
          Next WaterPlant SaaS v2.4
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
    paddingTop: Platform.OS === 'android' ? 56 : 64,
    paddingBottom: 32,
  },
  topBadgeRow: {
    width: '100%',
    alignItems: 'center',
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.9,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  rippleCircle: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    top: 5,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emblemCircle: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#38BDF8',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  circleLogoImage: {
    width: 150,
    height: 150,
  },
  brandTextContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(56, 189, 248, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  brandTagline: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7DD3FC',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 18,
    marginBottom: 26,
    paddingHorizontal: 12,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#E0F2FE',
    letterSpacing: 0.2,
  },
  footerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  footerBullet: {
    fontSize: 10,
    color: '#38BDF8',
  },
  footerText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  versionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
  },
});
