import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AnimatedMapleLogo } from '@/components/AnimatedMapleLogo';
import { authApi } from '@/api/auth.api';

/**
 * Reset-password — receives the deep link from the password-reset
 * email (`/(auth)/reset-password?uid=…&token=…`), collects a new
 * password, and POSTs to /auth/reset-password/.
 *
 * Backend endpoint TODO: when /auth/reset-password/ ships server-side,
 * this screen lights up with no further client changes.
 */
export default function ResetPassword() {
  const router = useRouter();
  const { uid, token } = useLocalSearchParams<{ uid?: string; token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkValid = !!uid && !!token;

  const submit = async () => {
    setError(null);
    if (!linkValid) {
      setError('This link is invalid or expired. Request a fresh reset email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords don\'t match.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await authApi.resetPassword({ uid: uid!, token: token!, password });
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Could not reset password. The link may have expired.');
      return;
    }
    setDone(true);
  };

  return (
    <AuthScreen haloY={0.22}>
      <View className="px-6 pt-6 pb-10 items-center">
        <Pressable onPress={() => router.replace('/(auth)/login')} className="self-start mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back to sign in</Text>
        </Pressable>

        <View className="items-center mt-2 mb-7">
          <AnimatedMapleLogo size={180} />
        </View>

        <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
          Set a new password
        </Text>
        <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
          Pick something you'll remember. At least 8 characters.
        </Text>

        {done ? (
          <View className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 w-full">
            <Text className="text-sm font-bold text-emerald-900 text-center">Password updated</Text>
            <Text className="text-xs text-emerald-800 text-center mt-1 leading-relaxed">
              You can now sign in with your new password.
            </Text>
            <View className="mt-4">
              <PrimaryButton label="Go to sign in" onPress={() => router.replace('/(auth)/login')} />
            </View>
          </View>
        ) : (
          <>
            {!linkValid && (
              <View className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 w-full">
                <Text className="text-sm font-medium text-amber-800 text-center">
                  Open this screen by tapping the link in the password-reset email so we can verify it.
                </Text>
              </View>
            )}
            {error && (
              <View className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 w-full">
                <Text className="text-sm font-medium text-rose-800 text-center">{error}</Text>
              </View>
            )}

            <View className="mt-7 w-full" style={{ gap: 16 }}>
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-2 text-center">
                  New password
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
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-2 text-center">
                  Confirm password
                </Text>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry
                  placeholder="Re-enter the new password"
                  placeholderTextColor="#94A3B8"
                  className="h-14 rounded-2xl border border-slate-200 bg-white/85 px-5 text-base text-slate-900 text-center"
                />
              </View>
            </View>

            <View className="mt-7 w-full">
              <PrimaryButton label="Update password" onPress={submit} loading={submitting} disabled={!linkValid} />
            </View>
          </>
        )}
      </View>
    </AuthScreen>
  );
}
