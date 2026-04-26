import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { MapleLogo } from '@/components/MapleLogo';
import { loginWithCredentials } from '@/auth/AuthProvider';
import { homeRouteForRole } from '@/auth/roleRouting';
import { useAuthStore } from '@/auth/authStore';

/**
 * Phase-1 login. Email + password, sized for a phone (h-14 inputs,
 * autocapitalize off, secure entry on the password field). On success
 * the auth store flips state and the route guard takes over.
 */
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setSubmitting(true);
    const { ok, error } = await loginWithCredentials(email, password);
    setSubmitting(false);
    if (!ok) {
      setError(error || 'Could not sign you in.');
      return;
    }
    const role = useAuthStore.getState().user?.role;
    router.replace(homeRouteForRole(role) as any);
  };

  return (
    <AppScreen>
      <View className="px-6 pt-10 pb-8">
        <Pressable onPress={() => router.back()} className="mb-6">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>

        <View className="mb-6 items-start">
          <MapleLogo size={64} animated={false} />
        </View>

        <Text className="text-2xl font-extrabold text-slate-900">Welcome back</Text>
        <Text className="text-sm text-slate-600 mt-1">Sign in to continue learning.</Text>

        {error && (
          <View className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <Text className="text-sm font-medium text-rose-800">{error}</Text>
          </View>
        )}

        <View className="mt-6 space-y-4">
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900"
            />
          </View>
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900"
            />
          </View>
        </View>

        <View className="mt-8">
          <PrimaryButton label="Sign in" onPress={submit} loading={submitting} />
        </View>

        <Text className="text-xs text-slate-500 text-center mt-6">
          Forgot your password? Email support@maple.edify and we'll help.
        </Text>
      </View>
    </AppScreen>
  );
}
