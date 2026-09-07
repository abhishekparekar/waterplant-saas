import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  TouchableOpacityProps,
  View,
  Platform,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' | 'warning';
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  loading = false, 
  disabled, 
  className,
  icon,
  style,
  size = 'md',
  gradient = false,
  ...props 
}) => {
  const getVariantStyles = () => {
    if (disabled) {
      return {
        bg: '#94A3B8',
        text: '#F1F5F9',
        border: 'transparent',
        shadow: 'transparent',
        elevation: 0
      };
    }
    switch (variant) {
      case 'secondary':
        return {
          bg: '#0D9488',
          text: '#FFFFFF',
          border: 'transparent',
          shadow: '#0D9488',
          elevation: 3
        };
      case 'danger':
        return {
          bg: '#E11D48',
          text: '#FFFFFF',
          border: 'transparent',
          shadow: '#E11D48',
          elevation: 3
        };
      case 'success':
        return {
          bg: '#059669',
          text: '#FFFFFF',
          border: 'transparent',
          shadow: '#059669',
          elevation: 3
        };
      case 'warning':
        return {
          bg: '#D97706',
          text: '#FFFFFF',
          border: 'transparent',
          shadow: '#D97706',
          elevation: 3
        };
      case 'outline':
        return {
          bg: '#F8FAFC',
          text: '#0284C7',
          border: '#BAE6FD',
          shadow: '#000000',
          elevation: 1
        };
      default:
        return {
          bg: '#0284C7',
          text: '#FFFFFF',
          border: 'transparent',
          shadow: '#0284C7',
          elevation: 3
        };
    }
  };

  const v = getVariantStyles();
  const useGradient = !disabled && (gradient || variant === 'primary');

  const height = size === 'sm' ? 38 : size === 'lg' ? 52 : 46;
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 13.5;
  const paddingHorizontal = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0284C7' : '#FFFFFF'} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {icon ? icon : null}
          <Text 
            style={{ 
              color: v.text, 
              fontSize, 
              fontWeight: '800', 
              letterSpacing: 0.2,
              textAlign: 'center'
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity 
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        {
          height,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: useGradient ? 'transparent' : v.bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: v.border,
          shadowColor: v.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: variant === 'outline' ? 0.06 : 0.25,
          shadowRadius: 4,
          elevation: v.elevation,
          opacity: disabled ? 0.6 : 1,
        },
        style
      ]}
      {...props}
    >
      {useGradient ? (
        <LinearGradient
          colors={['#0284C7', '#0EA5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal,
          }}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal,
          }}
        >
          {content}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
