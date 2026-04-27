import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AnimatedMapleLogo } from '@/components/AnimatedMapleLogo';
import { CountryChip } from '@/components/CountryChip';
import { loginWithCredentials } from '@/auth/AuthProvider';
import { homeRouteForRole } from '@/auth/roleRouting';
import { useAuthStore } from '@/auth/authStore';

/**
 * Sign-in screen. Centred column on a softly graded brand background:
 * animated brand mark hero, "Welcome Back!" title, email + password,
 * primary CTA, footer link to sign up. Mirrors the layout of the
 * sign-up screen so the two feel like a single auth flow.
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
          Welcome Back!
        </Text>
        <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
          Sign in with the email and password from your school account.
        </Text>

        {error && (
          <View className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 w-full">
            <Text className="text-sm font-medium text-rose-800 text-center">{error}</Text>
          </View>
        )}

        <View className="mt-7 w-full" style={{ gap: 16 }}>
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
          <PrimaryButton label="Log in" onPress={submit} loading={submitting} />
        </View>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="mt-5">
          <Text className="text-xs text-slate-500 text-center px-4">
            Forgot your password? <Text className="font-bold text-maple-900">Reset it</Text>
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/(auth)/signup')} className="mt-6">
          <Text className="text-sm text-slate-600 text-center">
            Don't have an account? <Text className="font-bold text-maple-900">Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
