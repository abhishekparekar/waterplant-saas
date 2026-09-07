import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TextInputProps, 
  TouchableOpacity, 
  useColorScheme,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className,
  leftIcon,
  secureTextEntry,
  style,
  ...props 
}) => {
  const isDark = useColorScheme() === 'dark';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error 
    ? '#F43F5E' 
    : isFocused 
      ? '#0284C7' 
      : isDark 
        ? '#334155' 
        : '#E2E8F0';

  const bgColor = isDark ? '#16223F' : '#FFFFFF';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: isDark ? '#94A3B8' : '#475569' }]}>
          {label}
        </Text>
      )}
      <View 
        style={[
          styles.inputWrapper, 
          { 
            backgroundColor: bgColor, 
            borderColor,
            borderWidth: isFocused || error ? 1.5 : 1,
            shadowColor: isFocused ? '#0284C7' : 'transparent',
            shadowOpacity: isFocused ? 0.15 : 0,
            shadowRadius: 4,
            elevation: isFocused ? 1 : 0,
          }
        ]}
      >
        {leftIcon ? (
          <View style={styles.leftIconWrapper}>
            {leftIcon}
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input, 
            { 
              color: textColor,
              paddingLeft: leftIcon ? 6 : 14,
              paddingRight: secureTextEntry ? 40 : 14,
            },
            style
          ]}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeBtn}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isSecure ? "eye-outline" : "eye-off-outline"} 
              size={19} 
              color={isDark ? "#94A3B8" : "#64748B"} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  leftIconWrapper: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F43F5E',
    marginTop: 4,
    marginLeft: 2,
  },
});

export default Input;
