import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AnimatedMapleLogo } from '@/components/AnimatedMapleLogo';
import { authApi } from '@/api/auth.api';

/**
 * Forgot-password — collects the email, hits /auth/forgot-password/.
 * Backend returns the same generic confirmation regardless of whether
 * the email exists (account-enumeration protection), so we mirror that
 * in the success state.
 */
export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Enter the email address you signed up with.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await authApi.forgotPassword(email);
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      return;
    }
    setSent(true);
  };

  return (
    <AuthScreen haloY={0.22}>
      <View className="px-6 pt-6 pb-10 items-center">
        <Pressable onPress={() => router.back()} className="self-start mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>

        <View className="items-center mt-2 mb-7">
          <AnimatedMapleLogo size={180} />
        </View>

        <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
          Reset your password
        </Text>
        <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
          We'll email you a link to set a new password.
        </Text>

        {sent ? (
          <View className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 w-full">
            <Text className="text-sm font-bold text-emerald-900 text-center">Check your inbox</Text>
            <Text className="text-xs text-emerald-800 text-center mt-1 leading-relaxed">
              If <Text className="font-bold">{email}</Text> is on Maple, a reset link is on its way.
              The link expires in 24 hours.
            </Text>
          </View>
        ) : (
          <>
            {error && (
              <View className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 w-full">
                <Text className="text-sm font-medium text-rose-800 text-center">{error}</Text>
              </View>
            )}

            <View className="mt-7 w-full">
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

            <View className="mt-7 w-full">
              <PrimaryButton label="Send reset link" onPress={submit} loading={submitting} />
            </View>
          </>
        )}

        <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-6">
          <Text className="text-sm text-slate-600 text-center">
            Remembered it? <Text className="font-bold text-maple-900">Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
