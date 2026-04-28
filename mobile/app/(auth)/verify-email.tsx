import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AnimatedMapleLogo } from '@/components/AnimatedMapleLogo';
import { authApi } from '@/api/auth.api';

type State = 'pending' | 'verifying' | 'verified' | 'failed';

/**
 * Verify-email — two modes.
 *
 *   1. Notice mode: user just registered, no link params. Shows
 *      "check your inbox" copy with the email address.
 *   2. Activation mode: deep link from the activation email
 *      (`/(auth)/verify-email?uid=…&token=…`). Auto-POSTs to
 *      /auth/activate/ and shows a success / failure card.
 */
export default function VerifyEmail() {
  const router = useRouter();
  const { uid, token, email } = useLocalSearchParams<{
    uid?: string;
    token?: string;
    email?: string;
  }>();

  const hasLink = !!uid && !!token;
  const [state, setState] = useState<State>(hasLink ? 'verifying' : 'pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasLink) return;
    let cancelled = false;
    (async () => {
      const { error: err } = await authApi.activate(uid!, token!);
      if (cancelled) return;
      if (err) {
        setError(err.message || 'This link is invalid or has expired. Sign in to request a new one.');
        setState('failed');
        return;
      }
      setState('verified');
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, token, hasLink]);

  return (
    <AuthScreen haloY={0.28}>
      <View className="px-6 pt-6 pb-10 items-center">
        <Pressable onPress={() => router.replace('/(auth)/login')} className="self-start mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back to sign in</Text>
        </Pressable>

        <View className="items-center mt-2 mb-7">
          <AnimatedMapleLogo size={180} />
        </View>

        {state === 'verifying' && (
          <>
            <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
              Verifying your email…
            </Text>
            <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
              One moment while we activate your account.
            </Text>
          </>
        )}

        {state === 'verified' && (
          <>
            <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-3">
              <Ionicons name="checkmark" size={26} color="#065F46" />
            </View>
            <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
              You're all set
            </Text>
            <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
              Your email is verified. Sign in to start learning.
            </Text>
            <View className="mt-7 w-full">
              <PrimaryButton label="Go to sign in" onPress={() => router.replace('/(auth)/login')} />
            </View>
          </>
        )}

        {state === 'failed' && (
          <>
            <View className="w-14 h-14 rounded-full bg-rose-100 items-center justify-center mb-3">
              <Ionicons name="alert" size={26} color="#9F1239" />
            </View>
            <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
              Link didn't work
            </Text>
            <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
              {error || 'This link is invalid or expired. Try signing in to request a new activation email.'}
            </Text>
            <View className="mt-7 w-full">
              <PrimaryButton label="Go to sign in" onPress={() => router.replace('/(auth)/login')} />
            </View>
          </>
        )}

        {state === 'pending' && (
          <>
            <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
              Check your inbox
            </Text>
            <Text className="text-sm text-slate-600 mt-2 text-center px-6 leading-relaxed">
              We sent an activation link {email ? <>to <Text className="font-bold">{email}</Text></> : 'to your email'}.
              Open it on this phone to finish setting up your account.
            </Text>
            <View className="mt-7 w-full">
              <PrimaryButton label="Go to sign in" onPress={() => router.replace('/(auth)/login')} />
            </View>
            <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="mt-5">
              <Text className="text-sm text-slate-600 text-center">
                Didn't receive it? <Text className="font-bold text-maple-900">Resend</Text>
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </AuthScreen>
  );
}
