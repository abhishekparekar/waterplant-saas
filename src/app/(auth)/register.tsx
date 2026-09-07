import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

export default function RegisterScreen() {
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [validationError, setValidationError] = useState('');

  const { signUp, loading, error } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    setValidationError('');
    if (!businessName || !name || !email || !password || !address) {
      setValidationError('Please fill in all required fields.');
      return;
    }
    
    try {
      const user = await signUp(
        email.trim(), 
        password, 
        name.trim(), 
        'owner', // Defaults to Business Owner
        phone.trim() || undefined,
        businessName.trim(),
        address.trim()
      );
      
      Alert.alert(
        'Registration Successful',
        `Welcome to NextWater, ${user.displayName}! Your business "${user.businessName}" is now registered.`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => {
              router.replace(ROUTES.OWNER.DASHBOARD);
            }
          }
        ]
      );
    } catch (err) {
      // Handled by store error state
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
        keyboardShouldPersistTaps="handled"
        className="px-6 py-8"
      >
        <View className="max-w-md mx-auto w-full">
          <View className="items-center mb-6">
            <Image 
              source={require('../../../assets/images/logo1_transparent.png')} 
              style={{ width: 180, height: 135 }} 
              resizeMode="contain"
              className="mb-2"
            />
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Sign up as a Water Plant Owner to get started
            </Text>
          </View>

          <View className="w-full">
            <Input
              label="Business Name *"
              placeholder="e.g. Ganga Water Supplier"
              value={businessName}
              onChangeText={setBusinessName}
              error={validationError && !businessName ? 'Business Name is required' : undefined}
            />

            <Input
              label="Owner Name *"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChangeText={setName}
              error={validationError && !name ? 'Owner Name is required' : undefined}
            />

            <Input
              label="Contact Number *"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={validationError && !phone ? 'Contact Number is required' : undefined}
            />

            <Input
              label="Email Address *"
              placeholder="owner@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={validationError && !email ? 'Email is required' : undefined}
            />

            <Input
              label="Password *"
              placeholder="choose a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              error={validationError && !password ? 'Password is required' : undefined}
            />

            <Input
              label="Plant Address *"
              placeholder="e.g. Sector 4, Noida, UP"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              error={validationError && !address ? 'Address is required' : undefined}
            />

            {error || validationError ? (
              <Text className="text-sm text-rose-500 font-medium text-center mb-4">
                {error || validationError}
              </Text>
            ) : null}

            <Button
              title="Register Water Plant"
              onPress={handleRegister}
              loading={loading}
              className="mt-2 mb-6"
            />

            <View className="flex-row justify-center items-center">
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push(ROUTES.LOGIN)}>
                <Text className="text-sm text-primary font-semibold ml-1.5">
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
