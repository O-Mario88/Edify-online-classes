import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AnimatedMapleLogo } from '@/components/AnimatedMapleLogo';
import { CountryChip } from '@/components/CountryChip';
import { authApi } from '@/api/auth.api';
import { useCountry } from '@/hooks/useCountry';

/**
 * Sign-up screen. POSTs to /api/v1/auth/register/ to create the
 * account, then routes to verify-email so the user activates from the
 * email link. After verification they sign in normally.
 */
export default function Signup() {
  const router = useRouter();
  const { config } = useCountry();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in every field.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await authApi.register({
      email: email.trim(),
      full_name: name.trim(),
      password,
      country_code: config.code,
      role: 'student',
    });
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Could not create the account. Try again.');
      return;
    }
    setNotice('Account created. Check your email for a verification link, then sign in.');
    // Give the user a beat to read the notice, then route to verify-email.
    setTimeout(() => router.replace('/(auth)/verify-email'), 1500);
  };

  return (
    <AuthScreen haloY={0.22}>
      <View className="px-6 pt-6 pb-10 items-center">
        <View className="w-full flex-row items-center justify-between mb-2">
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm font-semibold text-maple-900">← Back</Text>
          </Pressable>
          <CountryChip />
        </View>

        <View className="items-center mt-2 mb-7">
          <AnimatedMapleLogo size={200} />
        </View>

        <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
          Create Account
        </Text>
        <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
          Tell us a little about yourself and we'll get you set up.
        </Text>

        {error && (
          <View className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 w-full">
            <Text className="text-sm font-medium text-rose-800 text-center">{error}</Text>
          </View>
        )}
        {notice && (
          <View className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 w-full">
            <Text className="text-sm font-medium text-emerald-800 text-center">{notice}</Text>
          </View>
        )}

        <View className="mt-7 w-full" style={{ gap: 16 }}>
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-2 text-center">
              Full name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              placeholder="Your full name"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-2xl border border-slate-200 bg-white/85 px-5 text-base text-slate-900 text-center"
            />
          </View>
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-2 text-center">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-2xl border border-slate-200 bg-white/85 px-5 text-base text-slate-900 text-center"
            />
          </View>
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-2 text-center">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-2xl border border-slate-200 bg-white/85 px-5 text-base text-slate-900 text-center"
            />
          </View>
        </View>

        <View className="mt-8 w-full">
          <PrimaryButton label="Sign up" onPress={submit} loading={submitting} />
        </View>

        <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-6">
          <Text className="text-sm text-slate-600 text-center">
            Already have an account? <Text className="font-bold text-maple-900">Log in</Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
